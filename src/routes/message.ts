import express, { Request, Response } from "express";
import { Message } from "../entity/Message";
import { accessMiddleware } from "../passport";
import { endpointSecret, io, stripe } from "../server";
import { HELPER_FEE, socketEventName, socketFeedback } from "../constants";
import { getManager } from "typeorm";
import { removeLockedContent, uploadBase64File } from "../utils";
import { Asset } from "../entity/Asset";
import { UploadResults } from "../types";
import { Milestone } from "../entity/Milestone";
import { Assignment } from "../entity/Assignment";
import { Payment } from "../entity/Payment";
import { getConnection } from "typeorm";
import { Helper } from "../entity/Helper";
import { Student } from "../entity/Student";
import { Notification } from "../entity/Notification";

const router = express.Router();

io.on("connection", (socket) => {
  socket.join((socket.request as any).user.id);
  socket.on(
    socketEventName[socketEventName.SEND_MESSAGE],
    async (socketMessage) => {
      try {
        const senderID = (socket.request as any).user.id;
        const {
          assignmentID,
          recipientID,
          text,
          fileBase64,
          waitForMilestone,
        } = socketMessage;

        const student = await Student.findOneOrFail(senderID);

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

        const message = new Message();
        message.text = text;
        message.sender_id = senderID;
        message.recipient_id = recipientID;
        message.assignment_id = assignmentID;

        if (waitForMilestone) {
          message.wait_for_completion = waitForMilestone;
        }

        const savedMessage = await message.save();

        let saved_message_text;

        if (fileBase64.length > 0 && text.trim() !== "") {
          const message_text = new Message();
          message_text.text = text;
          message_text.sender_id = senderID;
          message_text.recipient_id = recipientID;
          message_text.assignment_id = assignmentID;

          if (waitForMilestone) {
            message_text.wait_for_completion = waitForMilestone;
          }

          saved_message_text = await message_text.save();
        }

        const files = fileBase64.map(async (fileBase64: any) => {
          const folderPath = "messageAssets";
          const { url, extension, filePath } = (await uploadBase64File(
            fileBase64.base64,
            folderPath
          )) as UploadResults;
          const file = new Asset();
          file.message_id = savedMessage.id;
          file.assignment_id = assignmentID;
          file.path = filePath;
          file.extension = extension;
          file.url = url;
          file.name = fileBase64.name;
          return file.save();
        });

        await Promise.all(files);

        let messages = await getManager().query(
          `
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
        `,
          [
            savedMessage.id,
            fileBase64.length > 0 && text.trim() !== ""
              ? (saved_message_text as Message).id
              : "",
          ]
        );

        const milestones = await getManager().query(
          `
           SELECT
           id,
           completed
           FROM Milestone
           WHERE assignment_id = ?
           ORDER BY deadline ASC 
             `,
          [assignmentID]
        );
        
        const prev = await Notification.findOne({
          text: "New message(s) from " + student.username,
          url:
            "/home/homework/" + assignmentID + "?applicant=" + student.username,
          student_id: recipientID,
        });

        let notification;
        if (!prev) {
          notification = new Notification();
          notification.text = "New message(s) from " + student.username;
          notification.url =
            "/home/homework/" + assignmentID + "?applicant=" + student.username;
          notification.student_id = recipientID;

          await notification.save();
        }

        io.to(socket.id).emit("MESSAGE_DELIVERED", { messages, assignmentID });

        socket
          .to(senderID)
          .emit("MESSAGE_DELIVERED", { messages, assignmentID });

        messages = removeLockedContent(messages, milestones, recipientID);
        
        return socket
          .to(recipientID)
          .emit("MESSAGE_DELIVERED", { messages, assignmentID, notification });

      } catch (err) {
        console.log(err);
        return io
          .to(socket.id)
          .emit(
            "ERROR",
            socketFeedback[socketFeedback.FAILED_MESSAGE_CREATION]
          );
      }
    }
  );
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
router.get("/list", accessMiddleware, async (req: Request, res: Response) => {
  try {
    const { assignmentID, limit, offset, fromID } = req.query;
    let messages = await getManager().query(
      `
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
    `,
      [
        assignmentID,
        req.user!.id,
        fromID,
        fromID,
        req.user!.id,
        // limit === undefined ? 10 : limit,
        // offset === undefined ? 0 : offset,
      ]
    );

    const milestones = await getManager().query(
      `
       SELECT
       id,
       completed
       FROM Milestone
       WHERE assignment_id = ?
       ORDER BY deadline ASC 
         `,
      [assignmentID]
    );

    messages = removeLockedContent(messages, milestones, req.user!.id);

    res.json(messages);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

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
router.post(
  "/initiateCheckout",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { milestoneID } = req.body;
      const milestone = await Milestone.findOneOrFail({
        id: milestoneID,
      });
      const assignment = await Assignment.findOneOrFail({
        id: milestone.assignment_id,
      });
      const helper_student = await Student.findOneOrFail({
        id: assignment.helper_id,
      });

      const session = await stripe.checkout.sessions.create({
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
        success_url:
          "http://localhost:3001/home/homework/" +
          milestone.assignment_id +
          "?success=true",
        cancel_url:
          "http://localhost:3001/home/homework/" +
          milestone.assignment_id +
          "?cancelled=true",
        payment_intent_data: {
          application_fee_amount: Math.round(Number(milestone.price * (HELPER_FEE))),
          transfer_data: {
            destination: helper_student.stripe_id,
          },
        },
      });

      return res.send({ url: session.url });
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

router.post(
  "/stripeSessionComplete",
  async (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // console.log(session);

      const milestone = await Milestone.findOneOrFail({
        id: session.metadata.milestoneID,
      });

      const assignment = await Assignment.findOneOrFail({
        id: session.metadata.assignmentID,
      });

      const helper = await Helper.findOneOrFail({
        student_id: assignment.helper_id,
      });

      const payment = new Payment();
      payment.amount = milestone.price;
      payment.helper_id = assignment.helper_id;
      payment.student_id = assignment.creator_id;
      payment.milestone_id = milestone.id;
      payment.pending = false;

      let active = false;

      const milestones = await getManager().query(
        `
         SELECT
         id,
         completed
         FROM Milestone
         WHERE assignment_id = (?)
           `,
        [assignment.id]
      );

      for (const mile of milestones) {
        if (milestone.id != mile.id) {
          active = active || !milestone.completed;
        }
      }
      let task = getConnection()
        .createQueryBuilder()
        .update(Milestone)
        .set({ completed: true })
        .where("id = :id", { id: milestone.id })
        .execute();

      let task2 = getConnection()
        .createQueryBuilder()
        .update(Assignment)
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

      const notification = new Notification();
      notification.text = milestone.title + " has been purchased from you!";
      notification.url = "/home/homework/" + assignment.id;
      notification.student_id = assignment.helper_id;

      await Promise.all([task, task2, payment.save(), notification.save()]);

    } else if (event.type === "account.updated") {
      const session = event.data.object;
      if (session.payouts_enabled) {
        await getConnection()
          .createQueryBuilder()
          .update(Student)
          .set({ payouts_enabled: true })
          .where("stripe_id = :stripe_id", { stripe_id: session.id })
          .execute();
      }
    }

    return response.status(200).end();
  }
);

module.exports = router;
