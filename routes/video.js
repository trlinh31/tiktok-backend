const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", videoController.getVideos);
router.get("/:videoId", videoController.getVideo);
router.post("/create", authMiddleware, videoController.createVideo);
router.post("/:videoId/like", authMiddleware, videoController.toggleLike);
router.post("/upload", videoController.uploadVideo, videoController.handleUpload);

module.exports = router;
