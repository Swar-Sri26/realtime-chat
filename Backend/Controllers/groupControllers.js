// controllers/groupController.js
import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { io } from "../server.js"; // adjust to however you export io

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = await Group.create({
      name,
      admin: req.user._id,
      members: [...new Set([...members, req.user._id.toString()])],
    });
    res.json({ success: true, group });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

export const getMyGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id });
  res.json({ success: true, groups });
};

export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findOne({ _id: groupId, members: req.user._id });
  if (!group) return res.json({ success: false, message: "Not a member" });

  const messages = await Message.find({ groupId }).populate("senderId", "fullName profilePic");
  res.json({ success: true, messages });
};

export const sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const { text, image } = req.body;
  const group = await Group.findOne({ _id: groupId, members: req.user._id });
  if (!group) return res.json({ success: false, message: "Not a member" });

  // upload `image` to cloudinary here if you do that for direct chats
  const msg = await Message.create({ senderId: req.user._id, groupId, text, image });
  const populated = await msg.populate("senderId", "fullName profilePic");

  io.to(groupId).emit("newGroupMessage", populated);
  res.json({ success: true, newMessage: populated });
};