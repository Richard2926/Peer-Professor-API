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
        WHERE assignment.creator_id = ?
      `;
        const queryParams = [studentID];
        let assignments = yield typeorm_1.getManager().query(query, queryParams);
        const milestones = yield typeorm_1.getManager().query(`
        SELECT
        id,
        price,
        title,
        description,
        deadline,
        completed,
        assignment_id as assignmentID
        FROM Milestone
        WHERE assignment_id IN (?)
        ORDER BY deadline ASC
        `, [assignments.map((assignment) => assignment.assignmentID)]);
        // TypeORM DECIMAL TYPE returns SUM(price) as a string
        assignments = assignments.map((assignment) => {
            assignment.price = parseFloat(assignment.price);
            assignment.milestones = milestones.filter((milestone) => {
                return milestone.assignmentID === assignment.assignmentID;
            });
            return assignment;
        });
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
      ) as assignmentDeadline   
      FROM Assignment
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
        const milestones = yield typeorm_1.getManager().query(`
      SELECT
      id,
      price,
      title,
      description,
      deadline,
      completed
      FROM Milestone
      WHERE assignment_id IN (?)
      ORDER BY deadline ASC 
      `, [assignments.map((assignment) => assignment.assignmentID)]);
        // TypeORM DECIMAL TYPE returns SUM(price) as a string
        assignments = assignments.map((assignment) => {
            assignment.price = parseFloat(assignment.price);
            assignment.milestones = milestones.filter((milestone) => {
                return milestone.assignmentID === assignment.assignmentID;
            });
            return assignment;
        });
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
        const { name, acceptByDate, collegeID, courseID, milestones } = req.body;
        const creatorID = req.user.id;
        const assignment = new Assignment_1.Assignment();
        assignment.name = name;
        assignment.creator_id = creatorID;
        assignment.accept_by = new Date(acceptByDate);
        assignment.college_id = collegeID;
        assignment.course_id = courseID;
        assignment.active = true;
        yield assignment.save();
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
        AND Assignment.active = 1
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
module.exports = router;
//# sourceMappingURL=assignment.js.map