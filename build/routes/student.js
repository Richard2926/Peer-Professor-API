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
const Report_1 = require("../entity/Report");
const Student_1 = require("../entity/Student");
const Assignment_1 = require("../entity/Assignment");
const typeorm_1 = require("typeorm");
const PendingApplication_1 = require("../entity/PendingApplication");
const constants_1 = require("../constants");
const passport_1 = require("../passport");
const utils_1 = require("../utils");
const Helper_1 = require("../entity/Helper");
const Notification_1 = require("../entity/Notification");
const server_1 = require("../server");
const router = express_1.default.Router();
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
router.delete("/deleteAccount", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        if (!studentID) {
            return res.sendStatus(404);
        }
        yield Student_1.Student.delete(studentID);
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
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
router.post("/acceptHelper", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { pendingApplicationID } = req.body;
        const pendingApplication = yield PendingApplication_1.PendingApplication.findOneOrFail(pendingApplicationID);
        const assignment = yield Assignment_1.Assignment.findOne(pendingApplication.assignment_id);
        if (!assignment) {
            return res.status(456).json({
                error: `This assignment does not exist`,
            });
        }
        const numActiveAssignments = yield typeorm_1.getManager().query(`
          SELECT COUNT(*)
          FROM Assignment
          WHERE helper_id = ?
          AND active is False
        `, [pendingApplication.helper_id]);
        if (numActiveAssignments > constants_1.simultaneousActiveAssignmentsLimit) {
            return res.status(452).json({
                error: "This helper is currently busy",
            });
        }
        // Assign the helper to the assignment
        yield typeorm_1.getConnection()
            .createQueryBuilder()
            .update(Assignment_1.Assignment)
            .set({ helper_id: pendingApplication.helper_id })
            .where("id = :id", { id: pendingApplication.assignment_id })
            .execute();
        // Remove all pending applications for this assignment
        yield typeorm_1.getManager().query(`
          DELETE
          FROM PendingApplication
          WHERE assignment_id = ?
          `, [pendingApplication.assignment_id]);
        const notification = new Notification_1.Notification();
        notification.text = "You have been accepted as a Helper for " + assignment.name;
        notification.url = "/home/homework/" + pendingApplication.assignment_id;
        notification.student_id = pendingApplication.helper_id;
        yield notification.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
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
router.post("/payForMilestone", function (_req, _res) {
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
router.post("/report", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { reportTypeID, toStudentID, text } = req.body;
        const fromStudentID = req.user.id;
        if (fromStudentID === toStudentID) {
            res.status(452).json({ error: "You cannot report yourself" });
        }
        const report = new Report_1.Report();
        report.active = true;
        report.from_student_id = fromStudentID;
        report.to_student_id = toStudentID;
        report.report_type = reportTypeID;
        report.text = text;
        yield report.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
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
router.get("/getProfileData", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const username = req.query.username;
        let student = yield Student_1.Student.findOne({
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
        let activeAssignments = yield typeorm_1.getManager().query(query, [student.id]);
        if (activeAssignments.length > 0) {
            activeAssignments = yield utils_1.attachMilestonesAndFiles(activeAssignments);
        }
        let helper = yield Helper_1.Helper.findOne({
            student_id: student.id
        });
        let courseHistory = [];
        let reviews = [];
        let loginLink = null;
        if (helper) {
            let helper_student = yield Student_1.Student.findOneOrFail({
                id: student.id,
            });
            if (helper.student_id === student.id) {
                loginLink = yield server_1.stripe.accounts.createLoginLink(helper_student.stripe_id); //TODO: Generate on demand
                const balance = yield server_1.stripe.balance.retrieve({
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
            courseHistory = yield typeorm_1.getManager().query(query2, [student.id]);
            courseHistory = courseHistory.map((course) => {
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
            reviews = yield typeorm_1.getManager().query(query3, [student.id]);
        }
        //TODO: update three things below
        return res.json({
            activeAssignments,
            student: Object.assign({}, student, { hangover_score: 0, completed_requests: 0, completed_homeworks: 0 }),
            helper: Object.assign({}, helper, { courseHistory,
                reviews,
                loginLink }),
        });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
router.get("/test", (req, res) => __awaiter(this, void 0, void 0, function* () {
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
    const a = yield server_1.stripe.accounts.create({ type: 'express' });
    const account = yield server_1.stripe.accounts.retrieve(a.id);
    console.log(account);
    return res.sendStatus(200);
}));
module.exports = router;
//# sourceMappingURL=student.js.map