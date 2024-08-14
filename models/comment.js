const mongoose = require("mongoose");

// Định nghĩa các kiểu reaction
const reactionTypes = ["like", "love", "haha", "wow", "sad", "angry"];

const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comments",
    default: null,
  },
  reactions: [
    {
      type: {
        type: String,
        enum: reactionTypes,
        required: true,
      },
      userIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comments", commentSchema);
