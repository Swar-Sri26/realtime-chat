import express from "express";
import { getAllMessages, markMessagesAsSeen,sendMessage } from "../Controllers/messagecontrollers.js";
import { protectRoute } from "../middlewares/auth.js";
import { getUsersForSidebar } from "../Controllers/messagecontrollers.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar);
messageRouter.get("/:id",protectRoute,getAllMessages);
messageRouter.put("/mark/:id",protectRoute,markMessagesAsSeen);

messageRouter.post("/send/:id",protectRoute,sendMessage);

export default messageRouter;