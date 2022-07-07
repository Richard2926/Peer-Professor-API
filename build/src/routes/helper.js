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
const Helper_1 = require("../entity/Helper");
const PendingApplication_1 = require("../entity/PendingApplication");
const Assignment_1 = require("../entity/Assignment");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const passport_1 = require("../passport");
const router = express_1.default.Router();
/**
 * @swagger
 * /helper/apply:
 *    post:
 *      responses:
 *        '200':
 *          description: Applied to assignment!
 *        '452':
 *          description: You are not a registered helper
 *        '453':
 *          description: You cannot apply as a helper to your own assignment
 *        '454':
 *          description: You already applied to this assignment
 *        '455':
 *          description: Exceeded max simultaneous applications
 *        '456':
 *          description: This assignment does not exist
 *        '500':
 *          description: Error
 */
router.post("/apply", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        const { assignmentID } = req.body;
        const helper = yield Helper_1.Helper.findOne(studentID);
        if (!helper) {
            return res.status(452).json({ error: "This student is not a helper" });
        }
        const creatorID = (yield typeorm_1.getManager().query(`
        SELECT creator_id
        FROM Assignment
        WHERE id = ?
        `, [assignmentID])).id;
        if (creatorID === studentID) {
            return res.status(453).json({
                error: "You cannot apply as a helper to your own assignment",
            });
        }
        const didAlreadyApply = yield PendingApplication_1.PendingApplication.findOne({
            assignment_id: assignmentID,
            helper_id: studentID,
        });
        if (didAlreadyApply) {
            return res.status(454).json({
                error: "You already applied to this assignment",
            });
        }
        const pendingApplicationsCount = yield typeorm_1.getManager().query(`
        SELECT COUNT(*)
        FROM PendingApplication
        WHERE helper_id = ?
        `, [studentID]);
        if (pendingApplicationsCount > constants_1.simultaneousApplicationLimit) {
            return res.status(455).json({
                error: `You can only apply to ${constants_1.simultaneousApplicationLimit} assignments at once`,
            });
        }
        const doesAssignmentExist = Assignment_1.Assignment.findOne(assignmentID);
        if (!doesAssignmentExist) {
            return res.status(456).json({
                error: `This assignment does not exist`,
            });
        }
        const pendingApplication = new PendingApplication_1.PendingApplication();
        pendingApplication.helper_id = studentID;
        pendingApplication.assignment_id = assignmentID;
        yield pendingApplication.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /helper/listApplications:
 *    post:
 *      responses:
 *        '200':
 *          description: Returned all pending applications for this user
 *        '500':
 *          description: Error
 */
router.get("/listApplications", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        const pendingApplications = yield typeorm_1.getManager().query(`
        SELECT 
        PendingApplication.id as pendingApplicationID,
        Assignment.id as assignmentID,
        Assignment.name as assignmentName,
        Course.department as courseDepartment,
        Course.name as courseName,
        Course.course_no as courseNumber
        FROM PendingApplication
        JOIN Assignment
        ON Assignment.id = PendingApplication.assignment_id
        JOIN Course
        ON Course.id = Assignment.course_id
        WHERE PendingApplication.helper_id = ?
        AND Assignment.active is True
      `, [studentID]);
        return res.status(200).json(pendingApplications);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /helper/deleteApplication:
 *    post:
 *      responses:
 *        '200':
 *          description: Successfully Deleted
 *        '452':
 *          description: This application does not exist
 *        '453':
 *          description: You do not have permission to delete this application
 *        '500':
 *          description: Error
 */
router.delete("/deleteApplication", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { applicationID } = req.body;
        const studentID = req.user.id;
        const pendingApplication = yield PendingApplication_1.PendingApplication.findOne(applicationID);
        if (!pendingApplication) {
            return res
                .status(452)
                .json({ error: "This application does not exist" });
        }
        if (pendingApplication.helper_id !== studentID) {
            return res.status(453).json({
                error: "You do not have permission to delete this application",
            });
        }
        yield pendingApplication.remove();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /helper/updateProfile:
 *    put:
 *      summary: update bio
 *      responses:
 *        '200':
 *          description: Updated helper profile
 *        '452':
 *          description: This student is not a helper
 *        '500':
 *          description: Error
 */
router.put("/updateProfile", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        const { bio } = req.body;
        const helper = yield Helper_1.Helper.findOne(studentID);
        if (!helper) {
            return res.status(452).json({ error: "This student is not a helper" });
        }
        yield typeorm_1.getConnection()
            .createQueryBuilder()
            .update(Helper_1.Helper)
            .set({ bio: bio })
            .where("id = :id", { id: studentID })
            .execute();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /helper/bankTransfer:
 *    post:
 *      summary: Transfer partial or complete balance to their connected bank account
 *      responses:
 *        '200':
 *          description: Applied to assignment!
 *        '400':
 *          description: Please make a request within your balance!
 *        '500':
 *          description: Error
 */
router.post("/bankTransfer", function (_req, _res) { });
module.exports = router;
//# sourceMappingURL=helper.js.map