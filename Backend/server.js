import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import "./models/db.js";
import userRouter from "./Routes/userRoutes.js";
import messageRouter from "./Routes/messageRoutes.js";
import groupRouter from "./Routes/groupRoutes.js";
import Group from "./models/Group.js";
import { Server } from "socket.io";

dotenv.config();

// create express app and http server
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" }, // allow all origins to connect to the socket server
});

// {userId: socketId} - stores all online users
export const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected with userId:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;

    // join a room for every group this user belongs to
    try {
      const groups = await Group.find({ members: userId }).select("_id");
      groups.forEach((g) => socket.join(g._id.toString()));
    } catch (err) {
      console.log("Error joining group rooms:", err.message);
    }
  }

  // emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected with userId:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// middleware setup
app.use(cors());
app.use(express.json({ limit: "4mb" })); // parse JSON bodies up to 4mb

// route setup
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});