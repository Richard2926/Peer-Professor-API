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
          WHERE assignemnt_id = ?
          `, [pendingApplication.assignment_id]);
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
module.exports = router;
//# sourceMappingURL=student.js.map