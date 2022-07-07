import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { docs } from "./apiDocs";
import http from "http";
import { Server } from "socket.io";
import { accessMiddleware } from "./passport";
var bodyParser = require("body-parser");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const app = express();
const server = http.createServer(app);
const stripe = require("stripe")(
  "sk_test_51L0axUJtvBVBjjiLDgI1ZV7HlfHpD71eZ1PZR8UHymABV4vEsPcZ6zrgsFtFUBjW08oQ5GpGDvonVlQQuenCZNl800vVRxr9kd"
);
const endpointSecret = 'whsec_89f33f677c7139dcfe5c8b355b34972a14bfe9ab8612de562ef032091da9c945';

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use((socket: any, next: Function) => accessMiddleware(socket.request, {
    sendStatus: function(code: any) {
      next(new Error(code));
    }
}, next));

app.use(cors());

//TODO: Check best way to use for file uploading

// app.use(
//   bodyParser.json({
//     limit: "50mb",
//   })
// );

// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     parameterLimit: 100000,
//     extended: true,
//   })
// );

app.use("/message/stripeSessionComplete", express.raw({ type: "*/*" })); //Stripe needs raw body
app.use(
  express.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);
app.use(express.json({ limit: "50mb" }));

app.use("/api-docs", swaggerUi.serve, docs);
app.use("/student", require("./routes/student"));
app.use("/auth", require("./routes/auth"));
app.use("/assignment", require("./routes/assignment"));
app.use("/helper", require("./routes/helper"));
app.use("/message", require("./routes/message"));

export { server, io, stripe, endpointSecret, sgMail };
