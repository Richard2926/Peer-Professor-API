import jwt from "jsonwebtoken";
import { ALLOWED_FILE_TYPES } from "./constants";
import { accessTokenLifespan, refreshTokenLifespan, Token } from "./constants";
import { bucket } from "./services/firebase";
import { v4 as UUID } from "uuid";
import { UploadResults } from "./types";
import { getManager } from "typeorm";

const genToken = (email: string, type: Token) => {
  return jwt.sign(
    {
      iss: "Homework_Hangover",
      sub: email,
      iat: new Date().getTime(),
      exp:
        Date.now() +
        (type === Token.ACCESS ? accessTokenLifespan : refreshTokenLifespan),
    },
    type === Token.ACCESS
      ? process.env.ACCESS_TOKEN_SECRET!
      : process.env.REFRESH_TOKEN_SECRET!
  );
};

const removeLockedContent = (messages: any, milestones: any, senderID: any) => {
  messages = messages.map((message: any) => {
    if (message.wait_for_completion == null || message.sender_id == senderID) return message;
    for (const milestone of milestones) {
      if (milestone.completed && milestone.id == message.wait_for_completion) return message;
    }
    message.text = null
    message.url = null
    return message;
  });
  return messages;
}

const attachMilestonesAndFiles = async (assignments: any) => {
  if (assignments.length === 0) return assignments;
  const milestones = await getManager().query(
    `
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
       `,
    [assignments.map((assignment: any) => assignment.assignmentID)]
  );

  // TypeORM DECIMAL TYPE returns SUM(price) as a string
  assignments = assignments.map((assignment: any) => {
    assignment.price = parseFloat(assignment.price);
    assignment.milestones = milestones.filter((milestone: any) => {
      return milestone.assignmentID === assignment.assignmentID;
    });
    return assignment;
  });

  const files64 = await getManager().query(
    `
   SELECT
   id,
   url,
   extension,
   assignment_id as assignmentID,
   name
   FROM Asset
   WHERE assignment_id IN (?)
   AND message_id IS NULL
   `,
    [assignments.map((assignment: any) => assignment.assignmentID)]
  );

  // TypeORM DECIMAL TYPE returns SUM(price) as a string
  assignments = assignments.map((assignment: any) => {
    assignment.price = parseFloat(assignment.price);
    assignment.milestones = milestones.filter((milestone: any) => {
      return milestone.assignmentID === assignment.assignmentID;
    });
    assignment.files64 = files64.filter((file64: any) => {
      return file64.assignmentID === assignment.assignmentID;
    });
    return assignment;
  });

  return assignments;
}

// https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
const uploadBase64File = (base64File: string, folderPath: string) => {
  // TODO: Compress image on client site and check against file size and file type restrictions
  return new Promise(async (resolve, reject) => {
    if (
      !base64File.startsWith("data:") ||
      !base64File.substring(0, 27).includes(";base64")
    ) {
      reject("Asset is not properly formatted base 64 format");
    }

    let fileType: string = "";
    if (base64File.startsWith("data:image")) {
      fileType = base64File.substring(
        "data:image/".length,
        base64File.indexOf(";base64")
      );
    } else if (base64File.startsWith("data:application")) {
      fileType = base64File.substring(
        "data:application/".length,
        base64File.indexOf(";base64")
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      reject("Unsupported file type"); // FIXME: Make this an official socket error
    }

    const imageBuffer = Buffer.from(base64File.split(";base64,")[1], "base64");

    let uuid = UUID();
    const filePath = `${folderPath}/${uuid}.${fileType}`;
    const file = bucket.file(filePath);

    file.save(imageBuffer, {
      predefinedAcl: "publicRead",
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      }
    });

    resolve({
      url:
        "https://firebasestorage.googleapis.com/v0/b/" +
        bucket.name +
        "/o/" +
        encodeURIComponent(filePath) +
        "?alt=media&token=" +
        uuid,
      extension: fileType,
      filePath,
    } as UploadResults);
  });
};

export { genToken, uploadBase64File, attachMilestonesAndFiles, removeLockedContent };
