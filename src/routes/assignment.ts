import express, { Request, Response } from "express";
import { Assignment } from "../entity/Assignment";
import { Milestone } from "../entity/Milestone";
import { Sort, UploadResults } from "../types";
import { getManager } from "typeorm";
import { accessMiddleware } from "../passport";
import { Course } from "../entity/Course";
import { uploadBase64File, attachMilestonesAndFiles } from "../utils";
import { Asset } from "../entity/Asset";
import { Student } from "../entity/Student";

const router = express.Router();

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
router.get("/list", accessMiddleware, async (req: Request, res: Response) => {
  try {
    const studentID = req.user!.id;

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

    let assignments = await getManager().query(query, queryParams);

    assignments = await attachMilestonesAndFiles(assignments);
    
    return res.status(200).json(assignments);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

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
 router.get("/helper-list", accessMiddleware, async (req: Request, res: Response) => {
  try {
    const studentID = req.user!.id;

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

    let assignments_1 = await getManager().query(query, queryParams);

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

    let assignments_2 = await getManager().query(query2, queryParams2);

    let assignments = [...assignments_1, ...assignments_2]

    assignments = await attachMilestonesAndFiles(assignments);
    
    return res.status(200).json(assignments);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

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
router.get(
  "/listAll",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        collegeID,
        departmentNames,
        fullCourseNames,
        sortType,
        limit,
        offset,
      } = req.query;

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
        ${
          (departmentNames && departmentNames.length) ||
          (fullCourseNames && fullCourseNames.length)
            ? ``
            : `OR TRUE`
        }
      )
      ORDER BY price ${
        (sortType as unknown as string) === Sort[Sort.LOW_TO_HIGH_PRICE]
          ? `ASC`
          : `DESC`
      }
      LIMIT ?
      OFFSET ?;
  `;

      const queryParams = [
        collegeID,
        departmentNames === undefined ? [""] : departmentNames,
        fullCourseNames === undefined
          ? [""]
          : (fullCourseNames as unknown as string[]).map((str) =>
              str.replace(/\s/g, "")
            ),
        limit === undefined ? 10 : parseInt(limit as string),
        offset === undefined ? 0 : parseInt(offset as string),
      ];

      let assignments = await getManager().query(query, queryParams);

      assignments = await attachMilestonesAndFiles(assignments);
      
      return res.status(200).json(assignments);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
router.post(
  "/createAssignment",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, acceptByDate, collegeID, course_id, milestones, files64, description } =
        req.body;

      const creatorID = req.user!.id;

      const assignment = new Assignment();
      assignment.name = name;
      assignment.description = description;
      assignment.creator_id = creatorID;
      assignment.accept_by = new Date(acceptByDate);
      assignment.college_id = collegeID;
      assignment.course_id = course_id;
      assignment.active = true;

      await assignment.save();

      const files = files64.map(async (fileBase64: any) => {
        const folderPath = "assignmentAssets";
          const { url, extension, filePath } = (await uploadBase64File(
            fileBase64.base64,
            folderPath
          )) as UploadResults;
          const file = new Asset();
          file.assignment_id = assignment.id;
          file.path = filePath;
          file.extension = extension;
          file.url = url;
          file.name = fileBase64.name;
          return file.save();
      })

      await Promise.all(files);

      const milestoneEntities = milestones.map((milestone: Milestone) => {
        const newMilestone = new Milestone();
        newMilestone.assignment_id = assignment.id;
        newMilestone.price = milestone.price;
        newMilestone.title = milestone.title;
        newMilestone.description = milestone.description;
        newMilestone.deadline = new Date(milestone.deadline);
        newMilestone.completed = false;
        return newMilestone.save();
      });

      await Promise.all(milestoneEntities);

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
router.delete(
  "/deleteAssignment",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { assignmentID } = req.body;
      const assignment = await Assignment.findOne({
        id: assignmentID,
      });

      if (!assignment) {
        return res.status(452).json({ error: "Assignment does not exist" });
      }

      if (assignment.creator_id !== req.user!.id) {
        return res.status(453).json({ error: "Unauthorized" });
      }
      await Assignment.delete(assignmentID);

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
 router.get(
  "/autoCompleteCourses",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const start = req.query.start as string;
      if (!start) {
        return res.status(200).send([]);
      }
      const parts = start.trim().split(' ');
      var suggestions : string[] = [];
      if (parts.length > 1) {
        const results = await getManager().query(
          `
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON (Course.department = '${parts[0]}' AND Course.course_no LIKE '${parts[1]}%')
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `
        );
        for (const i in results) {
          suggestions = suggestions.concat((results[i].department + " " + results[i].course_no))
        }
      } else if (parts.length === 1 && start.endsWith(' ')) {
        const results = await getManager().query(
          `
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON Course.department = '${parts[0]}'
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `
        );
        for (const i in results) {
          suggestions = suggestions.concat((results[i].department + " " + results[i].course_no))
        }} else {
        const results = await getManager().query(
          `
        SELECT DISTINCT department
        FROM Course
        WHERE department
        LIKE '${start.trim()}%'
        LIMIT 5
      `
        );
        for (const i in results) {
          suggestions = suggestions.concat(results[i].department)
        }
      }

      
      return res.status(200).send(suggestions);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
 router.get(
  "/getCourses",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const start = req.query.start as string;
      if (!start) {
        return res.status(200).send([]);
      }
      const parts = start.trim().split(' ');
      var suggestions : any[] = [];

      if (parts.length > 1) {
        const results = await getManager().query(
          `
        SELECT DISTINCT department, course_no, id
        FROM Course
        WHERE (Course.department = '${parts[0]}' AND Course.course_no LIKE '${parts[1]}%')
        LIMIT 5
      `
        );
        for (const i in results) {
          suggestions = suggestions.concat({
            "text": (results[i].department + " " + results[i].course_no),
            "course_id": results[i].id
          })
        }
      }  else if (parts.length === 1 && start.endsWith(' ')) {
        const results = await getManager().query(
          `
        SELECT DISTINCT department, course_no
        FROM Course
        INNER JOIN Assignment ON Course.department = '${parts[0]}'
        AND (Assignment.course_id = Course.id)
        AND Assignment.helper_id IS NULL
        LIMIT 5
      `
        );
        for (const i in results) {
          suggestions = suggestions.concat({
            "text": (results[i].department + " " + results[i].course_no),
            "course_id": results[i].id
          })
        }
      } else {
        return res.sendStatus(404);
      }

      
      return res.status(200).send(suggestions);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
 router.get(
  "/getApplicants",
  accessMiddleware,
  async (req: Request, res: Response) => {
    try {
      const assignmentID = req.query.assignmentID as any as number;
      const assignment = await Assignment.findOne({
        id: assignmentID,
      });

      if (!assignment) {
        return res.status(452).json({ error: "Assignment does not exist" });
      }

      if (assignment.creator_id !== req.user!.id) {
        return res.status(453).json({ error: "Unauthorized" });
      }

      if (assignment.active == false || assignment.helper_id !== null) {
        return res.status(454).json({ error: "Assignment is past Applicant stage" });
      }

      const applicants = await getManager().query(
        `
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
        `, [assignmentID]
      );
      return res.status(200).send(applicants);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
 router.get(
   "/getAssignmentData",
   accessMiddleware,
   async (req: Request, res: Response) => {
     try {
       const assignmentID = req.query.assignmentID as any as number;

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

       let assignments = await getManager().query(query, queryParams);

       assignments = await attachMilestonesAndFiles(assignments);
       
       const assignment = assignments[0];

       //TODO: Check for completed and inactive assignments, is it even necessary?
       if (!assignment) {
         return res.status(452).json({ error: "Assignment does not exist" });
       }

       let creator = await Student.findOne({
         id: assignment.creator_id,
       });

       if (
         assignment.creator_id === req.user!.id &&
         assignment.helperID !== null
       ) {
         let helper = await Student.findOne({
           id: assignment.helperID,
         });

         return res.status(200).send({
           assignment: assignment,
           isHelper: assignment.helperID === req.user!.id,
           fromData: {
             username: helper!.username,
             id: helper!.id,
           },
         });
       }

       if (assignment.helperID === req.user!.id) {
         return res.status(200).send({
           assignment: assignment,
           isHelper: assignment.helperID === req.user!.id,
           fromData: {
             username: creator!.username,
             id: creator!.id,
           },
         });
       }

       const applicants = await getManager().query(
         `
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
          `,
         [assignmentID]
       );

       if (assignment.creator_id === req.user!.id) {
         return res.status(200).send({
           assignment: assignment,
           isHelper: false,
           applicants: applicants,
         });
       }

       for (const applicant of applicants) {
         if (applicant.helperID === req.user!.id) {
           return res.status(200).send({
             assignment: assignment,
             isHelper: true,
             fromData: {
               username: creator!.username,
               id: creator!.id,
             },
           });
         }
       }

       return res
         .status(453)
         .json({ error: "Unauthorized: Not a part of assignment" });
     } catch (err) {
       console.log(err);
       return res.sendStatus(500);
     }
   }
 );

module.exports = router;
