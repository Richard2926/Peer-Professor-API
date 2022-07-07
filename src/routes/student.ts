import express, { Request, Response } from "express";
import passport from "passport";
import { Report } from "../entity/Report";
import { Student } from "../entity/Student";
import { Assignment } from "../entity/Assignment";
import { getManager, getConnection } from "typeorm";
import { PendingApplication } from "../entity/PendingApplication";
import { simultaneousActiveAssignmentsLimit } from "../constants";
import { accessMiddleware } from "../passport";
import { attachMilestonesAndFiles } from "../utils";
import { Helper } from "../entity/Helper";
import { Milestone } from "../entity/Milestone";
import { Notification } from "../entity/Notification";
import { stripe } from "../server";

const router = express.Router();

/**
 * @swagger
 * /student/deleteAccount:
 *    put:
 *      responses:
 *        '200':
 *          description: Account deleted
 *        '404':
 *          description: Student ID not provided
 *        '500':
 *          description: Internal Error
 */
router.delete(
  "/deleteAccount",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const studentID = req.user!.id;
      if (!studentID) {
        return res.sendStatus(404);
      }
      await Student.delete(studentID);
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

/**
 * @swagger
 * /student/acceptHelper:
 *    post:
 *      responses:
 *        '200':
 *          description: Helper was accepted
 *        '500':
 *          description: Error
 */
router.post(
  "/acceptHelper",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { pendingApplicationID } = req.body;

      const pendingApplication = await PendingApplication.findOneOrFail(
        pendingApplicationID
      );

      const assignment = await Assignment.findOne(pendingApplication.assignment_id);
      if (!assignment) {
        return res.status(456).json({
          error: `This assignment does not exist`,
        });
      }

      const numActiveAssignments = await getManager().query(
        `
          SELECT COUNT(*)
          FROM Assignment
          WHERE helper_id = ?
          AND active is False
        `,
        [pendingApplication.helper_id]
      );

      if (numActiveAssignments > simultaneousActiveAssignmentsLimit) {
        return res.status(452).json({
          error: "This helper is currently busy",
        });
      }

      // Assign the helper to the assignment
      await getConnection()
        .createQueryBuilder()
        .update(Assignment)
        .set({ helper_id: pendingApplication.helper_id })
        .where("id = :id", { id: pendingApplication.assignment_id })
        .execute();

      // Remove all pending applications for this assignment
      await getManager().query(
        `
          DELETE
          FROM PendingApplication
          WHERE assignment_id = ?
          `,
        [pendingApplication.assignment_id]
      );

      const notification = new Notification();
      notification.text = "You have been accepted as a Helper for " + assignment.name;
      notification.url = "/home/homework/" + pendingApplication.assignment_id;
      notification.student_id = pendingApplication.helper_id;
       
      await notification.save();
      
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

/**
 * @swagger
 * /student/payForMilestone:
 *    post:
 *      responses:
 *        '200':
 *          description: Student pays for completed milestone; unblurs any encrypted messages
 *        '500':
 *          description: Could not accept for unknown reason
 */
router.post("/payForMilestone", function (_req: Request, _res: Response) {
  // TODO: Delete all applications for unaccepted tutors
});

/**
 * @swagger
 * /student/report:
 *    post:
 *      responses:
 *        '200':
 *          description: Succesfully submitted complaint
 *        '452':
 *          description: You cannot report yourself
 *        '500':
 *          description: Could not accept for unknown reason
 */
router.post(
  "/report",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { reportTypeID, toStudentID, text } = req.body;
      const fromStudentID = req.user!.id;

      if (fromStudentID === toStudentID) {
        res.status(452).json({ error: "You cannot report yourself" });
      }
      const report = new Report();
      report.active = true;
      report.from_student_id = fromStudentID;
      report.to_student_id = toStudentID;
      report.report_type = reportTypeID;
      report.text = text;
      await report.save();
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

/**
 * @swagger
 * /student/getProfileData:
 *    get:
 *      responses:
 *        '200':
 *          description: Returns Profile Data
 *        '452':
 *          description: Profile does not exist
 *        '500':
 *          description: Error
 */
 router.get(
   "/getProfileData",
   accessMiddleware,
   async (req: Request, res: Response) => {
     try {
       const username = req.query.username as any as string;
       let student = await Student.findOne({
         username: username,
       });
       if (!student) {
         return res.status(452).json({ error: "Profile does not exist" });
       }
       const query = `
        SELECT 
        Assignment.id as assignmentID, 
        Assignment.name as assignmentName,
        Assignment.description as assignmentDescription,
        Course.name as courseName,
        Course.department as courseDepartment,
        Course.course_no as courseNumber,
        (
          SELECT SUM(price) FROM Milestone
          WHERE Milestone.assignment_id = Assignment.id
        ) as price,
        (
          SELECT deadline FROM Milestone
          WHERE Milestone.assignment_id = Assignment.id
          ORDER BY deadline DESC
          LIMIT 1
        ) as assignmentDeadline,
        Student.username as creatorUsername
        FROM Assignment
        LEFT JOIN Student
        ON Assignment.creator_id = Student.id
        LEFT JOIN Course
        ON Assignment.course_id = Course.id
        WHERE Assignment.creator_id = ?
        AND Assignment.helper_id is NULL
        AND active = True;
       `;
       let activeAssignments = await getManager().query(query, [student.id]);
       if (activeAssignments.length > 0) {
         activeAssignments = await attachMilestonesAndFiles(activeAssignments); 
       }

       let helper = await Helper.findOne({
          student_id: student.id
       });

       let courseHistory = []
       let reviews = []
       let loginLink = null

       if (helper) {
        let helper_student = await Student.findOneOrFail({
          id: student.id,
        });
        if (helper.student_id === student.id) {
          loginLink = await stripe.accounts.createLoginLink(
            helper_student.stripe_id
          ); //TODO: Generate on demand
          const balance = await stripe.balance.retrieve({
            stripeAccount: helper_student.stripe_id,
          });

          helper.balance =
            (balance.available[0].amount + balance.pending[0].amount) / 100;
        }

         const query2 = `SELECT Course.department,
         Course.course_no,
         Course.id as course_id
         FROM CourseHistory
         INNER JOIN Course
         ON CourseHistory.course_id = Course.id
         WHERE CourseHistory.helper_id = ?;`;

         courseHistory = await getManager().query(query2, [student.id]);
         courseHistory = courseHistory.map((course: any) => {
           return {
             text: course.department + " " + course.course_no,
             course_id: course.course_id,
           };
         });

         const query3 = `SELECT Student.username,
         text,
         rating
         FROM Review
         INNER JOIN Student
         ON Student.id = Review.student_id
         WHERE Review.helper_id = ?;`;
         reviews = await getManager().query(query3, [student.id]);
       }
      //TODO: update three things below
       return res.json({
         activeAssignments,
         student: {
           ...student,
           hangover_score: 0,
           completed_requests: 0,
           completed_homeworks: 0,
         },
         helper: {
           ...helper,
           courseHistory,
           reviews,
           loginLink
         },
       });
     } catch (err) {
       console.log(err);
       return res.sendStatus(500);
     }
   }
 );

 router.get("/test", async (req: Request, res: Response) => {
  return res.sendStatus(200);
  // const account = await stripe.accounts.create({type: 'express'});
  const id = "acct_1L38U02V4buiEdMo";
  // const accountLink = await stripe.accountLinks.create({
  //   account: id,
  //   refresh_url: 'https://example.com/reauth',
  //   return_url: 'https://example.com/return',
  //   type: 'account_onboarding',
  // });
  //  return res.send(accountLink);


  const a = await stripe.accounts.create({type: 'express'});

  const account = await stripe.accounts.retrieve(
    a.id
  );
  console.log(account);
  return res.sendStatus(200);
 });

 module.exports = router;
