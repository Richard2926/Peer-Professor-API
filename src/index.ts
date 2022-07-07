import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { setupJWT } from "./passport";
import { Student } from "./entity/Student";

import { server, io } from "./server";

declare global {
  namespace Express {
    interface User extends Student {}
  }
}

io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected`);
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

const port = 3000;
server.listen(port, async () => {
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  await createConnection();
  console.log("Connected to database");
  setupJWT();
  console.log(`Server listening at http://localhost:${port}`);
});
