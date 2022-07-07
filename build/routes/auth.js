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
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const typeorm_1 = require("typeorm");
const Student_1 = require("../entity/Student");
const College_1 = require("../entity/College");
const VerificationCode_1 = require("../entity/VerificationCode");
const ExpiredToken_1 = require("../entity/ExpiredToken");
const passport_1 = require("../passport");
const server_1 = require("../server");
const router = express_1.default.Router();
/**
 * @swagger
 * /auth/register:
 *    post:
 *      responses:
 *        '200':
 *          description: Registration successful
 *        '452':
 *          description: Email does not end in .edu
 *        '453':
 *          description: Email does not end in .edu
 *        '454':
 *          description: This university is currently not supported
 *        '455':
 *          description: Password does not meet requirements
 *        '456':
 *          description: This email is already registered to an account
 *        '500':
 *          description: Error
 */
router.post("/register", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // TODO: Do some email validation
        if (!email) {
            return res.status(452).json({ error: "Email does not end in .edu" });
        }
        const domainName = email.split("@")[1];
        if (!domainName.endsWith(".edu")) {
            return res.status(453).json({ error: "Email does not end in .edu" });
        }
        const college = yield College_1.College.findOne({
            domain_name: domainName,
        });
        if (!college) {
            return res
                .status(454)
                .json({ error: "This university is currently not supported" });
        }
        // TODO: Do some password validation
        if (!password) {
            return res
                .status(455)
                .json({ error: "Password does not meet requirements" });
        }
        if (yield Student_1.Student.findOne({ email })) {
            return res
                .status(456)
                .json({ error: "This email is already registered to an account" });
        }
        const account = yield server_1.stripe.accounts.create({ type: 'express' });
        const newStudent = new Student_1.Student();
        newStudent.email = email;
        // TODO: Randomly generate name
        newStudent.username = "UsernameRand";
        // TODO: Hash the passwords when storing them
        newStudent.password = password;
        newStudent.college = college;
        newStudent.verified = false;
        newStudent.stripe_id = account.id;
        newStudent.payouts_enabled = false;
        yield newStudent.save();
        // FIXME: Send email instead of printing
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const msg = {
            to: email,
            from: 'homeworkhangover1@gmail.com',
            subject: 'Verification Code',
            text: `Your verification code for Peer Professor is ${code}`
        };
        yield server_1.sgMail.send(msg);
        console.log(`Verification Code: ${code}`);
        const verificationCode = new VerificationCode_1.VerificationCode();
        verificationCode.code = code;
        verificationCode.student = newStudent;
        yield verificationCode.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /auth/verifyRegistrationCode:
 *    post:
 *      responses:
 *        '200':
 *          description: Registration successful
 *        '452':
 *          description: Incorrect verification code
 *        '500':
 *          description: Error
 */
router.post("/verifyRegistrationCode", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        // TODO: Write CRON Job to delete expired codes
        // Include an expiration column on the VerificationCode table
        const verificationCode = yield VerificationCode_1.VerificationCode.findOne({ code });
        if (!verificationCode) {
            return res.status(452).json({ error: "Incorrect verification code" });
        }
        const student_id = verificationCode.student_id;
        yield typeorm_1.getConnection()
            .createQueryBuilder()
            .update(Student_1.Student)
            .set({ verified: true })
            .where("id = :id", { id: student_id })
            .execute();
        yield verificationCode.remove();
        const studentEmail = (yield Student_1.Student.findOne({ id: student_id })).email;
        const refreshToken = utils_1.genToken(studentEmail, constants_1.Token.REFRESH);
        const tokenResponse = {
            accessToken: utils_1.genToken(studentEmail, constants_1.Token.ACCESS),
            refreshToken: refreshToken,
        };
        return res.json(tokenResponse);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /auth/login:
 *    post:
 *      responses:
 *        '200':
 *          description: Login successful
 *        '452':
 *          description: User (given email address) does not exist
 *        '453':
 *          description: Incorrect password
 *        '500':
 *          description: Internal server error
 */
router.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const studentRepository = typeorm_1.getConnection().getRepository(Student_1.Student);
        const user = yield studentRepository.findOne({
            email: email,
        });
        if (!user) {
            return res.status(452).json({ error: "User does not exist" });
        }
        if (!password || (user && user.password !== password)) {
            return res.status(453).json({ error: "Incorrect password" });
        }
        const refreshToken = utils_1.genToken(email, constants_1.Token.REFRESH);
        const tokenResponse = {
            accessToken: utils_1.genToken(email, constants_1.Token.ACCESS),
            refreshToken: refreshToken,
        };
        return res.json(tokenResponse);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /auth/refresh:
 *    post:
 *      responses:
 *        '200':
 *          description: Got new token
 *        '452':
 *          description: Refresh Token has been invalidated
 *        '500':
 *          description: Internal server error
 */
router.post("/refresh", passport_1.refreshMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const tokenResponse = {
            accessToken: utils_1.genToken(email, constants_1.Token.ACCESS),
        };
        return res.json(tokenResponse);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /auth/logout:
 *    post:
 *      responses:
 *        '200':
 *          description: Logged out
 *        '456':
 *          description: Refresh Token has been invalidated
 *        '500':
 *          description: Internal server error
 */
router.post("/logout", passport_1.refreshMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const refreshToken = req.body.refreshToken;
        const token1 = new ExpiredToken_1.ExpiredToken();
        token1.token = refreshToken;
        yield token1.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
router.get("/verify", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const query = `SELECT * 
  FROM Notification
  WHERE student_id = (?)`;
    const notifications = yield typeorm_1.getManager().query(query, [req.user.id]);
    res.send({
        id: req.user.id,
        email: req.user.email,
        college: req.user.college,
        username: req.user.username,
        payouts_enabled: req.user.payouts_enabled,
        notifications
    });
}));
/**
 * @swagger
 * /auth/deleteNotification:
 *    post:
 *      summary: Deletes Notification
 *      responses:
 *        '200':
 *          description: Deleted
 *        '500':
 *          description: Error
 */
router.post("/deleteNotification", passport_1.accessMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const studentID = req.user.id;
        const { notificationID, text } = req.body;
        if (!notificationID && !text) {
            return res.sendStatus(453);
        }
        if (!text) {
            yield typeorm_1.getManager().query(`
         DELETE
         FROM Notification
         WHERE student_id = ?
         AND id = ?
         `, [studentID, notificationID]);
        }
        else {
            yield typeorm_1.getManager().query(`
       DELETE
       FROM Notification
       WHERE student_id = ?
       AND text = ?
       `, [studentID, text]);
        }
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/**
 * @swagger
 * /auth/register:
 *    post:
 *      responses:
 *        '200':
 *          description: Registration successful
 *        '227':
 *          description: Please Register for an Account
 *        '228':
 *          description: Account is Unverified
 *        '229':
 *          description: Ready to Login
 *        '452':
 *          description: Invalid Email
 *        '500':
 *          description: Error
 */
router.post("/checkEmail", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        //email check
        if (!email) {
            return res.status(452).json({ error: "Please enter a valid email" });
        }
        const student = yield Student_1.Student.findOne({ email });
        if (!student) {
            return res
                .status(227)
                .json({ error: "Register for an account" });
        }
        if (!student.verified) {
            return res
                .status(228)
                .json({ error: "Account is Unverified" });
        }
        return res.status(229).json({ error: "Account is Registered and Verified" });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
module.exports = router;
//# sourceMappingURL=auth.js.map