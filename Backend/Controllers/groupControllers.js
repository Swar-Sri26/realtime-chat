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
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body; // array of user ids

    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Only the admin can add members" });
    }
    if (!Array.isArray(members) || members.length === 0) {
      return res.json({ success: false, message: "Pick at least one member" });
    }

    const oldIds = group.members.map((m) => m.toString());
    const newIds = members.filter((id) => !oldIds.includes(id));

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: newIds } } },
      { new: true }
    );

    // online new members join the room and see the group in their sidebar
    newIds.forEach((id) => {
      const socketId = userSocketMap[id];
      if (socketId) {
        io.in(socketId).socketsJoin(groupId);
        io.to(socketId).emit("newGroup", updated);
      }
    });

    // everyone in the room updates their member list
    io.to(groupId).emit("groupUpdated", updated);

    res.json({ success: true, group: updated });
  } catch (error) {
    console.log("addMembers error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Only the admin can remove members" });
    }
    if (memberId === group.admin.toString()) {
      return res.json({ success: false, message: "The admin can't be removed" });
    }

    const updated = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    );

    // tell the removed user, then take their socket out of the room
    const socketId = userSocketMap[memberId];
    if (socketId) {
      io.to(socketId).emit("groupRemoved", groupId);
      io.in(socketId).socketsLeave(groupId);
    }

    // remaining members update their list (the removed user is already out)
    io.to(groupId).emit("groupUpdated", updated);

    res.json({ success: true, group: updated });
  } catch (error) {
    console.log("removeMember error:", error);
    res.json({ success: false, message: error.message });
  }
};