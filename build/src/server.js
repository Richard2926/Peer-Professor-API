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
const app = express_1.default();
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server);
exports.io = io;
app.use(cors_1.default());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, apiDocs_1.docs);
app.use("/student", require("./routes/student"));
app.use("/auth", require("./routes/auth"));
app.use("/assignment", require("./routes/assignment"));
app.use("/helper", require("./routes/helper"));
app.use("/message", require("./routes/message"));
//# sourceMappingURL=server.js.map