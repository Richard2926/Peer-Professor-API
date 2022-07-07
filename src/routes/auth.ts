import express, { Request, Response } from "express";
import { genToken } from "../utils";
import { Token } from "../constants";
import { getConnection, getManager } from "typeorm";
import { Student } from "../entity/Student";
import { College } from "../entity/College";
import { VerificationCode } from "../entity/VerificationCode";
import { ExpiredToken } from "../entity/ExpiredToken";
import { accessMiddleware, refreshMiddleware } from "../passport";
import { sgMail, stripe } from "../server";

const router = express.Router();

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
router.post("/register", async (req: Request, res: Response) => {
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

    const college = await College.findOne({
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

    if (await Student.findOne({ email })) {
      return res
        .status(456)
        .json({ error: "This email is already registered to an account" });
    }
    const account = await stripe.accounts.create({type: 'express'});
    const newStudent = new Student();
    newStudent.email = email;
    // TODO: Randomly generate name
    newStudent.username = "UsernameRand";
    // TODO: Hash the passwords when storing them
    newStudent.password = password;
    newStudent.college = college!;
    newStudent.verified = false;
    newStudent.stripe_id = account.id;
    newStudent.payouts_enabled = false;

    await newStudent.save();

    // FIXME: Send email instead of printing
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const msg = {
      to: email, 
      from: 'homeworkhangover1@gmail.com', // TODO: Change to your verified sender and remove console.log
      subject: 'Verification Code',
      text: `Your verification code for Peer Professor is ${code}`
    }

    await sgMail.send(msg);
    console.log(`Verification Code: ${code}`);

    const verificationCode = new VerificationCode();
    verificationCode.code = code;
    verificationCode.student = newStudent;

    await verificationCode.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

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
router.post("/verifyRegistrationCode", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // TODO: Write CRON Job to delete expired codes
    // Include an expiration column on the VerificationCode table

    const verificationCode = await VerificationCode.findOne({ code });
    if (!verificationCode) {
      return res.status(452).json({ error: "Incorrect verification code" });
    }

    const student_id = verificationCode!.student_id;

    await getConnection()
      .createQueryBuilder()
      .update(Student)
      .set({ verified: true })
      .where("id = :id", { id: student_id })
      .execute();

    await verificationCode!.remove();

    const studentEmail = (await Student.findOne({ id: student_id }))!.email;

    const refreshToken = genToken(studentEmail, Token.REFRESH);

    const tokenResponse = {
      accessToken: genToken(studentEmail, Token.ACCESS),
      refreshToken: refreshToken,
    };

    return res.json(tokenResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

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
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const studentRepository = getConnection().getRepository(Student);

    const user = await studentRepository.findOne({
      email: email,
    });

    if (!user) {
      return res.status(452).json({ error: "User does not exist" });
    }

    if (!password || (user && user.password !== password)) {
      return res.status(453).json({ error: "Incorrect password" });
    }

    const refreshToken = genToken(email, Token.REFRESH);

    const tokenResponse = {
      accessToken: genToken(email, Token.ACCESS),
      refreshToken: refreshToken,
    };

    return res.json(tokenResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

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
 router.post(
  "/refresh",
  refreshMiddleware,
  async (req: Request, res: Response) => {
    try {

      const email = req.user!.email;
      const tokenResponse = {
        accessToken: genToken(email, Token.ACCESS),
      };
      return res.json(tokenResponse);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

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
 router.post(
  "/logout",
  refreshMiddleware,
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req.body.refreshToken;

      const token1 = new ExpiredToken();
      token1.token = refreshToken;

      await token1.save();

      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

router.get(
 "/verify",
 accessMiddleware,
 async (req: Request, res: Response) => {

  const query = `SELECT * 
  FROM Notification
  WHERE student_id = (?)`;

  const notifications = await getManager().query(query, [req.user!.id]);

  res.send({
    id: req.user!.id,
    email: req.user!.email,
    college: req.user!.college,
    username: req.user!.username,
    payouts_enabled: req.user!.payouts_enabled,
    notifications
  });
 }
);

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
 router.post(
   "/deleteNotification",
   accessMiddleware,
   async (req: Request, res: Response) => {
     try {
       const studentID = req.user!.id;
       const { notificationID, text } = req.body;
       
       if (!notificationID && !text) {
         return res.sendStatus(453);
       }

       if (!text) {
         await getManager().query(
           `
         DELETE
         FROM Notification
         WHERE student_id = ?
         AND id = ?
         `,
           [studentID, notificationID]
         );
       } else {
         await getManager().query(
           `
       DELETE
       FROM Notification
       WHERE student_id = ?
       AND text = ?
       `,
           [studentID, text]
         );
       }

       return res.sendStatus(200);
     } catch (err) {
       console.log(err);
       return res.sendStatus(500);
     }
   }
 );

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
router.post("/checkEmail", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    //email check
    if (!email) {
      return res.status(452).json({ error: "Please enter a valid email" });
    }
    const student = await Student.findOne({ email });

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
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});


module.exports = router;
