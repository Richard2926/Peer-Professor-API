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
const router = express_1.default.Router();
// TODO: Protect the route with some variant of accessMiddlware
server_1.io.on("connection", (socket) => {
    socket.on(constants_1.socketEventName[constants_1.socketEventName.SEND_MESSAGE], (socketMessage) => __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Get sender ID from jwt token
            // const studentID = req.user!.id;
            const { assignmentID, senderID, recipientID, text, fileBase64, waitForMilestone, } = socketMessage;
            // Ensure that the sender and recipient are part of this assignment
            let ids = yield typeorm_1.getManager().query(`
          SELECT creator_id as id1, helper_id as id2
          FROM Assignment
          WHERE id = ?
        `, [assignmentID]);
            ids = Object.values(ids[0]);
            if (!ids.includes(senderID) || !ids.includes(recipientID)) {
                return server_1.io
                    .to(socket.id)
                    .emit("ERROR", constants_1.socketFeedback[constants_1.socketFeedback.INVALID_SENDER_OR_RECIPIENT]);
            }
            const message = new Message_1.Message();
            message.text = text;
            message.sender_id = senderID;
            message.recipient_id = recipientID;
            message.assignment_id = assignmentID;
            if (waitForMilestone) {
                message.wait_for_completion = waitForMilestone;
            }
            const savedMessage = yield message.save();
            if (fileBase64) {
                const folderPath = "messageAssets";
                const { url, extension, filePath } = (yield utils_1.uploadBase64File(fileBase64, folderPath));
                const file = new Asset_1.Asset();
                file.message_id = savedMessage.id;
                file.assignment_id = assignmentID;
                file.path = filePath;
                file.extension = extension;
                file.url = url;
                yield file.save();
            }
            return server_1.io
                .to(socket.id)
                .emit("SUCCESS", constants_1.socketFeedback[constants_1.socketFeedback.MESSAGE_DELIVERED]);
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
        const { assignmentID, limit, offset } = req.query;
        const messages = yield typeorm_1.getManager().query(`
      SELECT Message.id as message_id, text, wait_for_completion, url
      FROM Message
      LEFT JOIN Asset
      ON Message.id = Asset.message_id
      WHERE Message.assignment_id = ?
      ORDER BY Message.created_at DESC
      LIMIT ?
      OFFSET ?
    `, [
            assignmentID,
            limit === undefined ? 10 : limit,
            offset === undefined ? 0 : offset,
        ]);
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
 * /message/unlock:
 *    summary: Pay for a milestone and unlock a blurred message
 *    post:
 *      responses:
 *        '200':
 *          description: Message sent
 *        '500':
 *          description: Error
 */
router.post("/unlock", passport_1.accessMiddleware, (_req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}));
module.exports = router;
//# sourceMappingURL=message.js.map