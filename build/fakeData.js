"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Student_1 = require("./entity/Student");
const College_1 = require("./entity/College");
const Course_1 = require("./entity/Course");
const Helper_1 = require("./entity/Helper");
const Assignment_1 = require("./entity/Assignment");
const PendingApplication_1 = require("./entity/PendingApplication");
const Milestone_1 = require("./entity/Milestone");
exports.populateDB = () => __awaiter(this, void 0, void 0, function* () {
    //College Creation
    yield typeorm_1.createConnection();
    const college1 = new College_1.College();
    college1.name = "Georgia Institute Of Technology";
    college1.domain_name = "gatech.edu";
    college1.image_url =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Georgia_Tech_seal.svg/1200px-Georgia_Tech_seal.svg.png";
    college1.time_zone = "US/Eastern";
    yield typeorm_1.getConnection().manager.save(college1);
    //Courses Creation
    const course1 = new Course_1.Course();
    const course2 = new Course_1.Course();
    const course3 = new Course_1.Course();
    course1.name = "Automata and Complexity";
    course1.department = "CS";
    course1.course_no = 4510;
    course1.college = college1;
    course2.name = "Machine Learning";
    course2.department = "CS";
    course2.course_no = 4641;
    course2.college = college1;
    course3.name = "Ethics for CS";
    course3.department = "CS";
    course3.course_no = 4001;
    course3.college = college1;
    yield typeorm_1.getConnection().manager.save(course1);
    yield typeorm_1.getConnection().manager.save(course2);
    yield typeorm_1.getConnection().manager.save(course3);
    //Student Creation
    const student1 = new Student_1.Student();
    const student2 = new Student_1.Student();
    const student3 = new Student_1.Student();
    student1.email = "rarockiasamy3@gatech.edu";
    student2.email = "athoutam@gatech.edu";
    student3.email = "hnaseer@gatech.edu";
    student1.username = "2incnpunisher";
    student2.username = "purplepp";
    student3.username = "sadasdasd";
    student1.college = college1;
    student2.college = college1;
    student3.college = college1;
    student1.password = "1";
    student2.password = "2";
    student3.password = "3";
    student1.verified = true;
    student2.verified = true;
    student3.verified = true;
    yield typeorm_1.getConnection().manager.save(student1);
    yield typeorm_1.getConnection().manager.save(student2);
    yield typeorm_1.getConnection().manager.save(student3);
    //Helper Creation
    const helper1 = new Helper_1.Helper();
    const helper2 = new Helper_1.Helper();
    helper1.bio = "goo goo gaa gaa";
    helper1.balance = 0;
    helper1.id = student2;
    helper2.bio = "this is test bio for me";
    helper2.balance = 0;
    helper2.id = student3;
    yield typeorm_1.getConnection().manager.save(helper1);
    yield typeorm_1.getConnection().manager.save(helper2);
    //Assignment Creation
    const assignment1 = new Assignment_1.Assignment();
    const assignment2 = new Assignment_1.Assignment();
    const assignment3 = new Assignment_1.Assignment();
    //Helper Accepted Assignment
    assignment1.name = "DFA and State Diagrams";
    assignment1.description = "DFA and State Diagrams";
    assignment1.creator = student1;
    // assignment1.helper = helper1;
    assignment1.accept_by = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000 // 5 days
    );
    assignment1.course = course1;
    assignment1.college = college1;
    assignment1.active = true;
    //Helper Still Not Picked Assignment
    assignment2.name = "Linear Regression HW";
    assignment2.description = "Linear Regression HW";
    assignment2.creator = student1;
    assignment2.accept_by = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000);
    assignment2.course = course2;
    assignment2.college = college1;
    assignment2.active = true;
    //Assignment completed
    assignment3.name = "Are self driving cars ethical?";
    assignment3.description = "Are self driving cars ethical?";
    assignment3.creator = student2;
    assignment3.helper = helper2;
    assignment3.accept_by = new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000);
    assignment3.course = course3;
    assignment3.college = college1;
    assignment3.active = false;
    const savedAssignment1 = yield typeorm_1.getConnection().manager.save(assignment1);
    const savedAssignment2 = yield typeorm_1.getConnection().manager.save(assignment2);
    yield typeorm_1.getConnection().manager.save(assignment3);
    const newMilestone2 = new Milestone_1.Milestone();
    newMilestone2.assignment_id = savedAssignment1.id;
    newMilestone2.price = 12.99;
    newMilestone2.title = "First milestone for Assignment 1";
    newMilestone2.description = "Description";
    newMilestone2.deadline = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
    );
    newMilestone2.completed = false;
    yield typeorm_1.getConnection().manager.save(newMilestone2);
    const newMilestone = new Milestone_1.Milestone();
    newMilestone.assignment_id = savedAssignment2.id;
    newMilestone.price = 32.44;
    newMilestone.title = "First milestone for Assignment 2";
    newMilestone.description = "Description for first milestone";
    newMilestone.deadline = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
    );
    newMilestone.completed = false;
    yield typeorm_1.getConnection().manager.save(newMilestone);
    //Applications for Not Picked Helper Asignment
    const application1 = new PendingApplication_1.PendingApplication();
    const application2 = new PendingApplication_1.PendingApplication();
    application1.helper = helper1;
    application1.assignment = assignment2;
    application2.helper = helper2;
    application2.assignment = assignment2;
    yield typeorm_1.getConnection().manager.save(application1);
    yield typeorm_1.getConnection().manager.save(application2);
    //Review for Completed Assignment
    // const review1 = new Review();
    // const review2 = new Review();
    // review1.student = student2;
    // review1.helper = student3;
    // review1.rating = 7; //Out of ten
    // review1.text = "Work was mid tier";
    // review2.student1 = student3;
    // review2.student2 = student2;
    // review2.rating = 9;
    // review2.text = "He payed on time and was chill";
    // await getConnection().manager.save(review1);
    // await getConnection().manager.save(review2);
});
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        yield exports.populateDB();
        console.log("Successfully added fake data");
    }
    catch (err) {
        console.log("There was an error adding the fake data");
        console.log(err);
    }
    finally {
        process.exit();
    }
}))();
//# sourceMappingURL=fakeData.js.map