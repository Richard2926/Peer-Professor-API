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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const passport_1 = require("./passport");
const server_1 = require("./server");
server_1.io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} connected`);
    socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
    });
});
const port = 3000;
server_1.server.listen(port, () => __awaiter(this, void 0, void 0, function* () {
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    yield typeorm_1.createConnection();
    console.log("Connected to database");
    passport_1.setupJWT();
    console.log(`Server listening at http://localhost:${port}`);
}));
//# sourceMappingURL=index.js.map