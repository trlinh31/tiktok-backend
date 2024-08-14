const User = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 200,
      message: "Users retrieved successfully",
      content: users,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const { fullName, username, avatar, bio } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(500).json({
        status: 500,
        message: "User already exists",
      });
    }

    user.fullName = fullName;
    user.username = username;
    user.avatar = avatar;
    user.bio = bio;
    await user.save();

    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      content: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      content: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  const { keywords } = req.query;
  try {
    const users = await User.find({
      $or: [
        { nickname: { $regex: keywords, $options: "i" } },
        { fullName: { $regex: keywords, $options: "i" } },
        { email: { $regex: keywords, $options: "i" } },
      ],
    });
    res.status(200).json({
      status: 200,
      message: "Users retrieved successfully",
      content: users,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};
