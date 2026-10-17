// controllers/groupController.js
import Group from "../models/Group.js";
import Message from "../models/message.js";
import { io,userSocketMap} from "../server.js"; // adjust to however you export io

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
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;

    const group = await Group.findOne({ _id: groupId, members: req.user._id });
    if (!group) return res.json({ success: false, message: "Not a member" });

    const msg = await Message.create({
      senderId: req.user._id,
      groupId,
      text,
      image,
    });
    const populated = await msg.populate("senderId", "fullName profilePic");

    // send to everyone in the group room except the sender
    const senderSocketId = userSocketMap[req.user._id.toString()];
    const room = io.to(groupId.toString());
    (senderSocketId ? room.except(senderSocketId) : room).emit(
      "newGroupMessage",
      populated
    );

    res.json({ success: true, newMessage: populated });
  } catch (error) {
    console.log("sendGroupMessage error:", error);
    res.json({ success: false, message: error.message });
  }
};