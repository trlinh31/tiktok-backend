const Comment = require("../models/comment");
const Video = require("../models/video");

exports.createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;
    const comment = new Comment({ ...req.body, userId, videoId });
    await comment.save();

    return res.status(201).json({
      status: 201,
      message: "Comment created successfully",
      content: comment,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { commentId } = req.params;
    const userId = req.user._id;
    const commentToUpdate = await Comment.findById(commentId);
    if (!commentToUpdate) {
      return res.status(404).json({ status: 404, message: "Comment not found" });
    }
    if (commentToUpdate.userId.toString() !== userId.toString()) {
      return res
        .status(403) // Forbidden
        .json({ status: 403, message: "Forbidden" });
    }
    commentToUpdate.comment = comment;
    commentToUpdate.updatedAt = Date.now();
    await commentToUpdate.save();
    return res.status(200).json({
      status: 200,
      message: "Comment updated successfully",
      content: commentToUpdate,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getTotalReactions = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ status: 404, message: "Comment not found" });
    }

    if (comment.reactions.length === 0) {
      return res.status(200).json({ status: 200, message: "No reactions found", content: [] });
    }

    res.status(200).json({
      status: 200,
      message: "Reaction data retrieved successfully",
      content: comment.reactions,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.handleSocketConnection = (socket, io) => {
  console.log("New client connected");

  socket.on("addReaction", async ({ commentId, userId, reactionType }) => {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        socket.emit("reactionError", "Comment not found");
        return;
      }

      let existingReaction = comment.reactions.find((r) => r.userIds.includes(userId.toString()));

      if (existingReaction) {
        // Nếu reaction cũ của người dùng tồn tại và là loại khác với reaction mới, cập nhật
        if (existingReaction.type !== reactionType) {
          // Loại bỏ reaction cũ
          comment.reactions = comment.reactions.filter((r) => r.type !== existingReaction.type || !r.userIds.includes(userId.toString()));

          // Thêm reaction mới
          comment.reactions.push({ type: reactionType, userIds: [userId] });
        } else {
          // Nếu reaction mới là loại cũ, loại bỏ reaction
          existingReaction.userIds = existingReaction.userIds.filter((id) => id.toString() !== userId.toString());
          if (existingReaction.userIds.length === 0) {
            comment.reactions = comment.reactions.filter((r) => r.type !== reactionType);
          }
        }
      } else {
        // Nếu không có reaction nào của người dùng, thêm reaction mới
        comment.reactions.push({ type: reactionType, userIds: [userId] });
      }

      await comment.save();
      io.emit("reactionUpdated", { commentId, reactions: comment.reactions });
    } catch (error) {
      socket.emit("reactionError", error.message);
    }
  });

  socket.on("removeReaction", async ({ commentId, userId }) => {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        socket.emit("reactionError", { message: "Comment not found" });
        return;
      }

      comment.reactions = comment.reactions
        .map((reaction) => {
          reaction.userIds = reaction.userIds.filter((id) => id.toString() !== userId.toString());
          return reaction;
        })
        .filter((reaction) => reaction.userIds.length > 0);

      await comment.save();

      io.emit("reactionUpdated", { commentId, reactions: comment.reactions });
    } catch (error) {
      socket.emit("reactionError", { message: error.message });
    }
  });

  socket.on("joinCommentRoom", (commentId) => {
    socket.join(commentId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
};

exports.removeReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.user._id;
    const { reactionType } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ status: 404, message: "Comment not found" });
    }

    comment.reactions = comment.reactions.filter((r) => r.type !== reactionType || !r.userIds.includes(userId.toString()));

    await comment.save();

    res.status(200).json({
      status: 200,
      message: "Reaction removed successfully",
      content: comment,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
