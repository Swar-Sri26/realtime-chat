import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import "./models/db.js";
import userRouter from "./Routes/userRoutes.js";
import messageRouter from "./Routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import{Server} from 'socket.io';

dotenv.config();
//create express app and http server
const app = express();

const server=http.createServer(app) //creates http server using the express app
export const io=new Server(server,{
  cors: {origin:  "*"}//allow all origins to connect to the socket server
})
export const userSocketMap={};//(userId:socketId)//stores data of all online users
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId;
  console.log("User connected with userId:",userId);
  if(userId)
    userSocketMap[userId]=socket.id;
  //emit online users to all clients
  io.emit("getOnlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect",()=>{
    console.log("User disconnected with userId:",userId);
    delete userSocketMap[userId];
    io.emit("getnlineUsers",Object.keys(userSocketMap))
  })
})
//middleware setup

app.use(cors())
app.use(express.json({limit: "4mb"}));// to parse incoming JSON requests with a size limit of 4mb

//route setup
app.use("/api/status",(req,res)=>res.send("Server is running"));//status endpoint to check if the server is running
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

app.use("/api/groups", groupRouter);
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});