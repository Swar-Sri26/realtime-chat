import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// a message must be either direct (receiverId) or group (groupId)
messageSchema.pre("validate", function (next) {
  if (!this.receiverId && !this.groupId) {
    return next(new Error("Message needs a receiverId or a groupId"));
  }
  next();
});

const Message = mongoose.model("message", messageSchema);

export default Message;