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
const Assignment_1 = require("../entity/Assignment");
const Milestone_1 = require("../entity/Milestone");
const types_1 = require("../types");
const typeorm_1 = require("typeorm");
const passport_1 = require("../passport");
const utils_1 = require("../utils");
const Asset_1 = require("../entity/Asset");
const Student_1 = require("../entity/Student");
const router = express_1.default.Router();
/**
 * @swagger
 * /assignment/list:
 *    get:
 *      summary: returns a student's active assignment postings
 *      responses:
 *        '200':
 *          description: Got assignments
 *        '500':
 *          description: Error
 */
router.get("/list", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        // Get list of all assignemnts this student has created
        const query = `
        SELECT 
        Assignment.id as assignmentID, 
        Assignment.name as assignmentName,
        Assignment.description as assignmentDescription,
        Assignment.active as isActive,
        Assignment.helper_id as helperID,
        Course.name as courseName,
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
        Assignment.accept_by
        FROM Assignment
        LEFT JOIN Course
        ON Assignment.course_id = Course.id
        WHERE Assignment.creator_id = ?
      `;
        const queryParams = [studentID];
        let assignments = yield typeorm_1.getManager().query(query, queryParams);
        assignments = yield utils_1.attachMilestonesAndFiles(assignments);
        return res.status(200).json(assignments);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/helper-list:
 *    get:
 *      summary: returns a helper's applications and in progress assignments
 *      responses:
 *        '200':
 *          description: Got assignments
 *        '500':
 *          description: Error
 */
router.get("/helper-list", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        // Get list of all assignemnts this student has created
        const query = `
        SELECT 
        Assignment.id as assignmentID, 
        Assignment.name as assignmentName,
        Assignment.description as assignmentDescription,
        Assignment.active as isActive,
        Assignment.helper_id as helperID,
        Assignment.creator_id as creatorID,
        Course.name as courseName,
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
        Assignment.accept_by
        FROM Assignment
        LEFT JOIN Course
        ON Assignment.course_id = Course.id
        WHERE Assignment.helper_id = ?
      `;
        const queryParams = [studentID];
        let assignments_1 = yield typeorm_1.getManager().query(query, queryParams);
        const query2 = `
        SELECT 
        Assignment.id as assignmentID, 
        Assignment.name as assignmentName,
        Assignment.description as assignmentDescription,
        Assignment.active as isActive,
        Assignment.helper_id as helperID,
        Course.name as courseName,
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
        Assignment.accept_by
        FROM Assignment
        LEFT JOIN Course
        ON Assignment.course_id = Course.id
        INNER JOIN PendingApplication
        ON Assignment.id = PendingApplication.assignment_id
        AND PendingApplication.helper_id = ?
      `;
        const queryParams2 = [studentID];
        let assignments_2 = yield typeorm_1.getManager().query(query2, queryParams2);
        let assignments = [...assignments_1, ...assignments_2];
        assignments = yield utils_1.attachMilestonesAndFiles(assignments);
        return res.status(200).json(assignments);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/listAll:
 *    get:
 *      summary: list all unassigned assignments across all users (for the explore page)
 *      responses:
 *        '200':
 *          description: list assignments
 *        '404':
 *          description: Missing required params
 *        '500':
 *          description: Error
 */
router.get("/listAll", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { collegeID, departmentNames, fullCourseNames, sortType, limit, offset, } = req.query;
        if (!collegeID || !sortType) {
            return res.sendStatus(404);
        }
        // Get list of all assignemnts with pagination (limit and offset) and sorting
        // Remove assignments that have been accepted by a helper
        // Filter assignments by college
        // Match course names by department AND specific courses
        // Remove assignments that are past accept by deadline
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
      WHERE Course.college_id = ?
      AND Assignment.helper_id is NULL
      AND active = True
      AND Assignment.accept_by > CURRENT_TIMESTAMP
      AND (
        Course.department IN (?)
        OR CONCAT(Course.department, Course.course_no) IN (?)
        ${(departmentNames && departmentNames.length) ||
            (fullCourseNames && fullCourseNames.length)
            ? ``
            : `OR TRUE`}
      )
      ORDER BY price ${sortType === types_1.Sort[types_1.Sort.LOW_TO_HIGH_PRICE]
            ? `ASC`
            : `DESC`}
      LIMIT ?
      OFFSET ?;
  `;
        const queryParams = [
            collegeID,
            departmentNames === undefined ? [""] : departmentNames,
            fullCourseNames === undefined
                ? [""]
                : fullCourseNames.map((str) => str.replace(/\s/g, "")),
            limit === undefined ? 10 : parseInt(limit),
            offset === undefined ? 0 : parseInt(offset),
        ];
        let assignments = yield typeorm_1.getManager().query(query, queryParams);
        assignments = yield utils_1.attachMilestonesAndFiles(assignments);
        return res.status(200).json(assignments);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/createAssignment:
 *    post:
 *      responses:
 *        '200':
 *          description: Assignment successfully posted
 *        '500':
 *          description: Error
 */
router.post("/createAssignment", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { name, acceptByDate, collegeID, course_id, milestones, files64, description } = req.body;
        const creatorID = req.user.id;
        const assignment = new Assignment_1.Assignment();
        assignment.name = name;
        assignment.description = description;
        assignment.creator_id = creatorID;
        assignment.accept_by = new Date(acceptByDate);
        assignment.college_id = collegeID;
        assignment.course_id = course_id;
        assignment.active = true;
        yield assignment.save();
        const files = files64.map((fileBase64) => __awaiter(this, void 0, void 0, function* () {
            const folderPath = "assignmentAssets";
            const { url, extension, filePath } = (yield utils_1.uploadBase64File(fileBase64.base64, folderPath));
            const file = new Asset_1.Asset();
            file.assignment_id = assignment.id;
            file.path = filePath;
            file.extension = extension;
            file.url = url;
            file.name = fileBase64.name;
            return file.save();
        }));
        yield Promise.all(files);
        const milestoneEntities = milestones.map((milestone) => {
            const newMilestone = new Milestone_1.Milestone();
            newMilestone.assignment_id = assignment.id;
            newMilestone.price = milestone.price;
            newMilestone.title = milestone.title;
            newMilestone.description = milestone.description;
            newMilestone.deadline = new Date(milestone.deadline);
            newMilestone.completed = false;
            return newMilestone.save();
        });
        yield Promise.all(milestoneEntities);
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/deleteAssignment:
 *    delete:
 *      responses:
 *        '200':
 *          description: Assignment successfully deleted
 *        '452':
 *          description: Assignment not found
 *        '453':
 *          description: User is not the creator of the assignment
 *        '500':
 *          description: Error
 */
router.delete("/deleteAssignment", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { assignmentID } = req.body;
        const assignment = yield Assignment_1.Assignment.findOne({
            id: assignmentID,
        });
        if (!assignment) {
            return res.status(452).json({ error: "Assignment does not exist" });
        }
        if (assignment.creator_id !== req.user.id) {
            return res.status(453).json({ error: "Unauthorized" });
        }
        yield Assignment_1.Assignment.delete(assignmentID);
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/autoCompleteCourses:
 *    delete:
 *      responses:
 *        '200':
 *          description: Auto Complete Courses
 *        '404':
 *          description: Invalid prompt
 *        '500':
 *          description: Error
 */
router.get("/autoCompleteCourses", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const start = req.query.start;
        if (!start) {
            return res.status(200).send([]);
        }
        const parts = start.trim().split(' ');
        var suggestions = [];
        if (parts.length > 1) {
            const results = yield typeorm_1.getManager().query(`
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON (Course.department = '${parts[0]}' AND Course.course_no LIKE '${parts[1]}%')
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `);
            for (const i in results) {
                suggestions = suggestions.concat((results[i].department + " " + results[i].course_no));
            }
        }
        else if (parts.length === 1 && start.endsWith(' ')) {
            const results = yield typeorm_1.getManager().query(`
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON Course.department = '${parts[0]}'
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `);
            for (const i in results) {
                suggestions = suggestions.concat((results[i].department + " " + results[i].course_no));
            }
        }
        else {
            const results = yield typeorm_1.getManager().query(`
        SELECT DISTINCT department
        FROM Course
        WHERE department
        LIKE '${start.trim()}%'
        LIMIT 5
      `);
            for (const i in results) {
                suggestions = suggestions.concat(results[i].department);
            }
        }
        return res.status(200).send(suggestions);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/getCourses:
 *    delete:
 *      responses:
 *        '200':
 *          description: Auto Complete Courses
 *        '404':
 *          description: Invalid prompt
 *        '500':
 *          description: Error
 */
router.get("/getCourses", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const start = req.query.start;
        if (!start) {
            return res.status(200).send([]);
        }
        const parts = start.trim().split(' ');
        var suggestions = [];
        if (parts.length > 1) {
            const results = yield typeorm_1.getManager().query(`
        SELECT DISTINCT department, course_no, id
        FROM Course
        WHERE (Course.department = '${parts[0]}' AND Course.course_no LIKE '${parts[1]}%')
        LIMIT 5
      `);
            for (const i in results) {
                suggestions = suggestions.concat({
                    "text": (results[i].department + " " + results[i].course_no),
                    "course_id": results[i].id
                });
            }
        }
        else if (parts.length === 1 && start.endsWith(' ')) {
            const results = yield typeorm_1.getManager().query(`
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON Course.department = '${parts[0]}'
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `);
            for (const i in results) {
                suggestions = suggestions.concat({
                    "text": (results[i].department + " " + results[i].course_no),
                    "course_id": results[i].id
                });
            }
        }
        else {
            return res.sendStatus(404);
        }
        return res.status(200).send(suggestions);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/getApplicants:
 *    delete:
 *      responses:
 *        '200':
 *          description: Returns applicants for given assignment ID, if user is creator
 *        '452':
 *          description: Assignment does not exist
 *        '453':
 *          description: Not the creator
 *        '454':
 *          description: Assignment is past Applicant stage
 *        '500':
 *          description: Error
 */
router.get("/getApplicants", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const assignmentID = req.query.assignmentID;
        const assignment = yield Assignment_1.Assignment.findOne({
            id: assignmentID,
        });
        if (!assignment) {
            return res.status(452).json({ error: "Assignment does not exist" });
        }
        if (assignment.creator_id !== req.user.id) {
            return res.status(453).json({ error: "Unauthorized" });
        }
        if (assignment.active == false || assignment.helper_id !== null) {
            return res.status(454).json({ error: "Assignment is past Applicant stage" });
        }
        const applicants = yield typeorm_1.getManager().query(`
        SELECT
        Helper.student_id as helperID, 
        Helper.bio as helperBio,
        Student.username as helperUsername
        FROM Helper
        INNER JOIN PendingApplication
        ON Helper.student_id = PendingApplication.helper_id
        INNER JOIN Student
        ON Helper.student_id = Student.id
        WHERE PendingApplication.assignment_id = ?
        `, [assignmentID]);
        return res.status(200).send(applicants);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /assignment/getAssignmentData:
 *    delete:
 *      responses:
 *        '200':
 *          description: Returns applicants for given assignment ID and assignment data if student pre accepting,
 *                       else returns assignment data and whether requester is helper.
 *        '452':
 *          description: Assignment does not exist
 *        '453':
 *          description: Unauthorized
 *        '500':
 *          description: Error
 */
router.get("/getAssignmentData", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const assignmentID = req.query.assignmentID;
        const query = `
          SELECT 
          Assignment.id as assignmentID, 
          Assignment.name as assignmentName,
          Assignment.description as assignmentDescription,
          Assignment.active as isActive,
          Assignment.helper_id as helperID,
          Assignment.creator_id as creator_id,
          Course.name as courseName,
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
          Assignment.accept_by
          FROM Assignment
          LEFT JOIN Course
          ON Assignment.course_id = Course.id
          WHERE Assignment.id = ?
        `;
        const queryParams = [assignmentID];
        let assignments = yield typeorm_1.getManager().query(query, queryParams);
        assignments = yield utils_1.attachMilestonesAndFiles(assignments);
        const assignment = assignments[0];
        //TODO: Check for completed and inactive assignments, is it even necessary?
        if (!assignment) {
            return res.status(452).json({ error: "Assignment does not exist" });
        }
        let creator = yield Student_1.Student.findOne({
            id: assignment.creator_id,
        });
        if (assignment.creator_id === req.user.id &&
            assignment.helperID !== null) {
            let helper = yield Student_1.Student.findOne({
                id: assignment.helperID,
            });
            return res.status(200).send({
                assignment: assignment,
                isHelper: assignment.helperID === req.user.id,
                fromData: {
                    username: helper.username,
                    id: helper.id,
                },
            });
        }
        if (assignment.helperID === req.user.id) {
            return res.status(200).send({
                assignment: assignment,
                isHelper: assignment.helperID === req.user.id,
                fromData: {
                    username: creator.username,
                    id: creator.id,
                },
            });
        }
        const applicants = yield typeorm_1.getManager().query(`
          SELECT
          Helper.student_id as helperID, 
          Helper.bio as helperBio,
          Student.username as helperUsername,
          PendingApplication.id as pendingApplicationID
          FROM Helper
          INNER JOIN PendingApplication
          ON Helper.student_id = PendingApplication.helper_id
          INNER JOIN Student
          ON Helper.student_id = Student.id
          WHERE PendingApplication.assignment_id = ?
          `, [assignmentID]);
        if (assignment.creator_id === req.user.id) {
            return res.status(200).send({
                assignment: assignment,
                isHelper: false,
                applicants: applicants,
            });
        }
        for (const applicant of applicants) {
            if (applicant.helperID === req.user.id) {
                return res.status(200).send({
                    assignment: assignment,
                    isHelper: true,
                    fromData: {
                        username: creator.username,
                        id: creator.id,
                    },
                });
            }
        }
        return res
            .status(453)
            .json({ error: "Unauthorized: Not a part of assignment" });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
module.exports = router;
//# sourceMappingURL=assignment.js.map