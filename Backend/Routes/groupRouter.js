import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
} from "../Controllers/groupControllers.js";

const groupRouter = express.Router();

groupRouter.post("/", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getMyGroups);
groupRouter.get("/:groupId/messages", protectRoute, getGroupMessages);
groupRouter.post("/:groupId/send", protectRoute, sendGroupMessage);

export default groupRouter;