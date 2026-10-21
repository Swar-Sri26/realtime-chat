import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { addMembers,removeMember} from "../Controllers/groupControllers.js";
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
groupRouter.put("/:groupId/members", protectRoute, addMembers);
groupRouter.delete("/:groupId/members/:memberId", protectRoute, removeMember);
export default groupRouter;