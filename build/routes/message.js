"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Message_1 = require("../entity/Message");
const passport_1 = require("../passport");
const server_1 = require("../server");
const constants_1 = require("../constants");
const typeorm_1 = require("typeorm");
const utils_1 = require("../utils");
const Asset_1 = require("../entity/Asset");
const Milestone_1 = require("../entity/Milestone");
const Assignment_1 = require("../entity/Assignment");
const Payment_1 = require("../entity/Payment");
const typeorm_2 = require("typeorm");
const Helper_1 = require("../entity/Helper");
const Student_1 = require("../entity/Student");
const Notification_1 = require("../entity/Notification");
const router = express_1.default.Router();
server_1.io.on("connection", (socket) => {
    socket.join(socket.request.user.id);
    socket.on(constants_1.socketEventName[constants_1.socketEventName.SEND_MESSAGE], (socketMessage) => __awaiter(this, void 0, void 0, function* () {
        try {
            const senderID = socket.request.user.id;
            const { assignmentID, recipientID, text, fileBase64, waitForMilestone, } = socketMessage;
            const student = yield Student_1.Student.findOneOrFail(senderID);
            // TODO: Ensure that the sender and recipient are part of this assignment OR Pending Applicant
            // let ids = await getManager().query(
            //   `
            //   SELECT creator_id as id1, helper_id as id2
            //   FROM Assignment
            //   WHERE id = ?
            // `,
            //   [assignmentID]
            // );
            // ids = Object.values(ids[0]);
            // if (!ids.includes(senderID) || !ids.includes(recipientID)) {
            //   return io
            //     .to(socket.id)
            //     .emit(
            //       "ERROR",
            //       socketFeedback[socketFeedback.INVALID_SENDER_OR_RECIPIENT]
            //     );
            // }
            const message = new Message_1.Message();
            message.text = text;
            message.sender_id = senderID;
            message.recipient_id = recipientID;
            message.assignment_id = assignmentID;
            if (waitForMilestone) {
                message.wait_for_completion = waitForMilestone;
            }
            const savedMessage = yield message.save();
            let saved_message_text;
            if (fileBase64.length > 0 && text.trim() !== "") {
                const message_text = new Message_1.Message();
                message_text.text = text;
                message_text.sender_id = senderID;
                message_text.recipient_id = recipientID;
                message_text.assignment_id = assignmentID;
                if (waitForMilestone) {
                    message_text.wait_for_completion = waitForMilestone;
                }
                saved_message_text = yield message_text.save();
            }
            const files = fileBase64.map((fileBase64) => __awaiter(this, void 0, void 0, function* () {
                const folderPath = "messageAssets";
                const { url, extension, filePath } = (yield utils_1.uploadBase64File(fileBase64.base64, folderPath));
                const file = new Asset_1.Asset();
                file.message_id = savedMessage.id;
                file.assignment_id = assignmentID;
                file.path = filePath;
                file.extension = extension;
                file.url = url;
                file.name = fileBase64.name;
                return file.save();
            }));
            yield Promise.all(files);
            let messages = yield typeorm_1.getManager().query(`
          SELECT 
          Message.id as message_id, 
          text, 
          wait_for_completion,
          sender_id, 
          recipient_id,
          Asset.id as assetID,
          Asset.url as url,
          Asset.extension as extension,
          Asset.name as assetName
          FROM Message
          LEFT JOIN Asset
          ON Message.id = Asset.message_id
          WHERE Message.id = ?
          OR Message.id = ?
          ORDER BY Message.created_at ASC;
        `, [
                savedMessage.id,
                fileBase64.length > 0 && text.trim() !== ""
                    ? saved_message_text.id
                    : "",
            ]);
            const milestones = yield typeorm_1.getManager().query(`
           SELECT
           id,
           completed
           FROM Milestone
           WHERE assignment_id = ?
           ORDER BY deadline ASC 
             `, [assignmentID]);
            const prev = yield Notification_1.Notification.findOne({
                text: "New message(s) from " + student.username,
                url: "/home/homework/" + assignmentID + "?applicant=" + student.username,
                student_id: recipientID,
            });
            let notification;
            if (!prev) {
                notification = new Notification_1.Notification();
                notification.text = "New message(s) from " + student.username;
                notification.url =
                    "/home/homework/" + assignmentID + "?applicant=" + student.username;
                notification.student_id = recipientID;
                yield notification.save();
            }
            server_1.io.to(socket.id).emit("MESSAGE_DELIVERED", { messages, assignmentID });
            socket
                .to(senderID)
                .emit("MESSAGE_DELIVERED", { messages, assignmentID });
            messages = utils_1.removeLockedContent(messages, milestones, recipientID);
            return socket
                .to(recipientID)
                .emit("MESSAGE_DELIVERED", { messages, assignmentID, notification });
        }
        catch (err) {
            console.log(err);
            return server_1.io
                .to(socket.id)
                .emit("ERROR", constants_1.socketFeedback[constants_1.socketFeedback.FAILED_MESSAGE_CREATION]);
        }
    }));
});
/**
 * @swagger
 * /message/list:
 *    summary: list messages for a given assignment
 *    post:
 *      responses:
 *        '200':
 *          description: Message sent
 *        '500':
 *          description: Error
 */
router.get("/list", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { assignmentID, limit, offset, fromID } = req.query;
        let messages = yield typeorm_1.getManager().query(`
      SELECT 
      Message.id as message_id, 
      text, 
      wait_for_completion,
      sender_id, 
      recipient_id,
      Asset.id as assetID,
      Asset.url as url,
      Asset.extension as extension,
      Asset.name as assetName
      FROM Message
      LEFT JOIN Asset
      ON Message.id = Asset.message_id
      WHERE Message.assignment_id = ?
      AND ((Message.sender_id = ? AND Message.recipient_id = ?) 
      OR (Message.sender_id = ? AND Message.recipient_id = ?))
      ORDER BY Message.created_at ASC;
    `, [
            assignmentID,
            req.user.id,
            fromID,
            fromID,
            req.user.id,
        ]);
        const milestones = yield typeorm_1.getManager().query(`
       SELECT
       id,
       completed
       FROM Milestone
       WHERE assignment_id = ?
       ORDER BY deadline ASC 
         `, [assignmentID]);
        messages = utils_1.removeLockedContent(messages, milestones, req.user.id);
        res.json(messages);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}));
// TODO: Once payment processing is added
/**
 * @swagger
 * /message/initiateCheckout:
 *    summary: Initiate checkout for a milestone
 *    post:
 *      responses:
 *        '200':
 *          description: Message sent
 *        '404':
 *          description: Milestone does not exist
 *        '500':
 *          description: Error
 */
router.post("/initiateCheckout", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { milestoneID } = req.body;
        const milestone = yield Milestone_1.Milestone.findOneOrFail({
            id: milestoneID,
        });
        const assignment = yield Assignment_1.Assignment.findOneOrFail({
            id: milestone.assignment_id,
        });
        const helper_student = yield Student_1.Student.findOneOrFail({
            id: assignment.helper_id,
        });
        const session = yield server_1.stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: milestone.title,
                        },
                        unit_amount: Math.round(milestone.price * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                milestoneID: milestoneID,
                assignmentID: milestone.assignment_id,
            },
            mode: "payment",
            success_url: "http://localhost:3001/home/homework/" +
                milestone.assignment_id +
                "?success=true",
            cancel_url: "http://localhost:3001/home/homework/" +
                milestone.assignment_id +
                "?cancelled=true",
            payment_intent_data: {
                application_fee_amount: Math.round(Number(milestone.price * (constants_1.HELPER_FEE))),
                transfer_data: {
                    destination: helper_student.stripe_id,
                },
            },
        });
        return res.send({ url: session.url });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
router.post("/stripeSessionComplete", (request, response) => __awaiter(this, void 0, void 0, function* () {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = server_1.stripe.webhooks.constructEvent(payload, sig, server_1.endpointSecret);
    }
    catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        // console.log(session);
        const milestone = yield Milestone_1.Milestone.findOneOrFail({
            id: session.metadata.milestoneID,
        });
        const assignment = yield Assignment_1.Assignment.findOneOrFail({
            id: session.metadata.assignmentID,
        });
        const helper = yield Helper_1.Helper.findOneOrFail({
            student_id: assignment.helper_id,
        });
        const payment = new Payment_1.Payment();
        payment.amount = milestone.price;
        payment.helper_id = assignment.helper_id;
        payment.student_id = assignment.creator_id;
        payment.milestone_id = milestone.id;
        payment.pending = false;
        let active = false;
        const milestones = yield typeorm_1.getManager().query(`
         SELECT
         id,
         completed
         FROM Milestone
         WHERE assignment_id = (?)
           `, [assignment.id]);
        for (const mile of milestones) {
            if (milestone.id != mile.id) {
                active = active || !milestone.completed;
            }
        }
        let task = typeorm_2.getConnection()
            .createQueryBuilder()
            .update(Milestone_1.Milestone)
            .set({ completed: true })
            .where("id = :id", { id: milestone.id })
            .execute();
        let task2 = typeorm_2.getConnection()
            .createQueryBuilder()
            .update(Assignment_1.Assignment)
            .set({ active: active })
            .where("id = :id", { id: assignment.id })
            .execute();
        // const new_balance =
        //   Number(helper.balance) +
        //   Math.round(Number(milestone.price * (100 - HELPER_FEE))) / 100;
        // let task3 = getConnection()
        //   .createQueryBuilder()
        //   .update(Helper)
        //   .set({
        //     balance: new_balance,
        //   })
        //   .where("student_id = :student_id", { student_id: helper.student_id })
        //   .execute();
        const notification = new Notification_1.Notification();
        notification.text = milestone.title + " has been purchased from you!";
        notification.url = "/home/homework/" + assignment.id;
        notification.student_id = assignment.helper_id;
        yield Promise.all([task, task2, payment.save(), notification.save()]);
    }
    else if (event.type === "account.updated") {
        const session = event.data.object;
        if (session.payouts_enabled) {
            yield typeorm_2.getConnection()
                .createQueryBuilder()
                .update(Student_1.Student)
                .set({ payouts_enabled: true })
                .where("stripe_id = :stripe_id", { stripe_id: session.id })
                .execute();
        }
    }
    return response.status(200).end();
}));
module.exports = router;
//# sourceMappingURL=message.js.map