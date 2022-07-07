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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const firebase_1 = require("./services/firebase");
const uuid_1 = require("uuid");
const typeorm_1 = require("typeorm");
const genToken = (email, type) => {
    return jsonwebtoken_1.default.sign({
        iss: "Homework_Hangover",
        sub: email,
        iat: new Date().getTime(),
        exp: Date.now() +
            (type === constants_2.Token.ACCESS ? constants_2.accessTokenLifespan : constants_2.refreshTokenLifespan),
    }, type === constants_2.Token.ACCESS
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET);
};
exports.genToken = genToken;
const removeLockedContent = (messages, milestones, senderID) => {
    messages = messages.map((message) => {
        if (message.wait_for_completion == null || message.sender_id == senderID)
            return message;
        for (const milestone of milestones) {
            if (milestone.completed && milestone.id == message.wait_for_completion)
                return message;
        }
        message.text = null;
        message.url = null;
        return message;
    });
    return messages;
};
exports.removeLockedContent = removeLockedContent;
const attachMilestonesAndFiles = (assignments) => __awaiter(this, void 0, void 0, function* () {
    if (assignments.length === 0)
        return assignments;
    const milestones = yield typeorm_1.getManager().query(`
     SELECT
     id,
     assignment_id as assignmentID,
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
    const files64 = yield typeorm_1.getManager().query(`
   SELECT
   id,
   url,
   extension,
   assignment_id as assignmentID,
   name
   FROM Asset
   WHERE assignment_id IN (?)
   AND message_id IS NULL
   `, [assignments.map((assignment) => assignment.assignmentID)]);
    // TypeORM DECIMAL TYPE returns SUM(price) as a string
    assignments = assignments.map((assignment) => {
        assignment.price = parseFloat(assignment.price);
        assignment.milestones = milestones.filter((milestone) => {
            return milestone.assignmentID === assignment.assignmentID;
        });
        assignment.files64 = files64.filter((file64) => {
            return file64.assignmentID === assignment.assignmentID;
        });
        return assignment;
    });
    return assignments;
});
exports.attachMilestonesAndFiles = attachMilestonesAndFiles;
// https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
const uploadBase64File = (base64File, folderPath) => {
    // TODO: Compress image on client site and check against file size and file type restrictions
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        if (!base64File.startsWith("data:") ||
            !base64File.substring(0, 27).includes(";base64")) {
            reject("Asset is not properly formatted base 64 format");
        }
        let fileType = "";
        if (base64File.startsWith("data:image")) {
            fileType = base64File.substring("data:image/".length, base64File.indexOf(";base64"));
        }
        else if (base64File.startsWith("data:application")) {
            fileType = base64File.substring("data:application/".length, base64File.indexOf(";base64"));
        }
        if (!constants_1.ALLOWED_FILE_TYPES.includes(fileType)) {
            reject("Unsupported file type"); // FIXME: Make this an official socket error
        }
        const imageBuffer = Buffer.from(base64File.split(";base64,")[1], "base64");
        let uuid = uuid_1.v4();
        const filePath = `${folderPath}/${uuid}.${fileType}`;
        const file = firebase_1.bucket.file(filePath);
        file.save(imageBuffer, {
            predefinedAcl: "publicRead",
            metadata: {
                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                },
            }
        });
        resolve({
            url: "https://firebasestorage.googleapis.com/v0/b/" +
                firebase_1.bucket.name +
                "/o/" +
                encodeURIComponent(filePath) +
                "?alt=media&token=" +
                uuid,
            extension: fileType,
            filePath,
        });
    }));
};
exports.uploadBase64File = uploadBase64File;
//# sourceMappingURL=utils.js.map