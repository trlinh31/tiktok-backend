const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:videoId/create", authMiddleware, commentController.createComment);
router.put("/:commentId/update", authMiddleware, commentController.updateComment);
router.get("/:commentId/reactions", commentController.getTotalReactions);
router.post("/:commentId/reactions/remove", authMiddleware, commentController.removeReaction);

module.exports = router;
