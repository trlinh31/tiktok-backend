const Video = require("../models/video");
const Comment = require("../models/comment");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});

const upload = multer({ storage });

exports.uploadVideo = upload.single("file");

exports.handleUpload = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      message: "Video uploaded successfully",
      content: {
        url: req.file.path,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    let videos = await Video.find().populate("userId", "nickname email");
    videos = videos.map((video) => {
      video = video.toObject();
      video.user = video.userId;
      video.likesCount = video.likes.length;
      video.commentsCount = video.comments.length;
      delete video.userId;
      delete video.comments;
      return video;
    });

    res.status(200).json({
      status: 200,
      message: "Videos retrieved successfully",
      content: videos,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.find({ videoId }).populate("userId", "nickname email fullName avatar");

    if (!video) {
      res.status(404).json({
        status: 404,
        message: "Video not found",
      });
    }

    // video.user = video.userId;
    // delete video.userId;

    // const likesCount = video.likes.length;
    // const commentsCount = await Comment.countDocuments({ videoId });

    // const commentsWithReplies = await Promise.all(
    //   comments.map(async (comment) => {
    //     comment.user = comment.userId;
    //     delete comment.userId;
    //     const replies = await Comment.find({ parentCommentId: comment._id }).populate("userId", "nickname email fullName avatar").lean();
    //     replies.forEach((reply) => {
    //       reply.user = reply.userId;
    //       delete reply.userId;
    //     });
    //     return { ...comment, replies };
    //   })
    // );

    res.status(200).json({
      status: 200,
      message: "Video retrieved successfully",
      content: video,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const { description, videoUrl, tags } = req.body;
    const video = new Video();
    video.userId = req.user._id;
    video.description = description;
    video.videoUrl = videoUrl;
    video.tags = tags;
    await video.save();
    res.status(201).json({
      status: 201,
      message: "Video created successfully",
      content: video,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ status: 404, message: "Video not found" });
    }

    const hasLiked = video.likes.includes(userId);
    if (hasLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      video.likes.push(userId);
    }
    await video.save();
    res.status(200).json({ status: 200, message: hasLiked ? "Like removed" : "Video liked", content: { likesCount: video.likes.length } });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await Comment.find({ videoId }).populate("parentId");
    return res.status(200).json({ status: 200, message: "Comments retrieved successfully", content: comments });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
