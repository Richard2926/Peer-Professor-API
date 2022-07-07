"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const apiDocs_1 = require("./apiDocs");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const passport_1 = require("./passport");
var bodyParser = require("body-parser");
const sgMail = require('@sendgrid/mail');
exports.sgMail = sgMail;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const app = express_1.default();
const server = http_1.default.createServer(app);
exports.server = server;
const stripe = require("stripe")("sk_test_51L0axUJtvBVBjjiLDgI1ZV7HlfHpD71eZ1PZR8UHymABV4vEsPcZ6zrgsFtFUBjW08oQ5GpGDvonVlQQuenCZNl800vVRxr9kd");
exports.stripe = stripe;
const endpointSecret = 'whsec_89f33f677c7139dcfe5c8b355b34972a14bfe9ab8612de562ef032091da9c945';
exports.endpointSecret = endpointSecret;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
exports.io = io;
io.use((socket, next) => passport_1.accessMiddleware(socket.request, {
    sendStatus: function (code) {
        next(new Error(code));
    }
}, next));
app.use(cors_1.default());
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
app.use("/message/stripeSessionComplete", express_1.default.raw({ type: "*/*" })); //Stripe needs raw body
app.use(express_1.default.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use("/api-docs", swagger_ui_express_1.default.serve, apiDocs_1.docs);
app.use("/student", require("./routes/student"));
app.use("/auth", require("./routes/auth"));
app.use("/assignment", require("./routes/assignment"));
app.use("/helper", require("./routes/helper"));
app.use("/message", require("./routes/message"));
//# sourceMappingURL=server.js.map