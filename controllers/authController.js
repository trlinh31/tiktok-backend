const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const generateToken = (user) => {
  const accessToken = jwt.sign({ id: user._id, email: user.email, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id, email: user.email, nickname: user.nickname }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  const { fullName, nickname, email, password } = req.body;
  try {
    const user = new User();
    const existingUser = await User.findOne({
      $or: [{ nickname: nickname }, { email: email }],
    });

    if (existingUser) {
      return res.status(500).json({
        status: 500,
        message: "User already exists",
      });
    }

    user.fullName = fullName;
    user.nickname = nickname;
    user.email = email;
    user.password = password;
    await user.save();

    const { accessToken, refreshToken } = generateToken(user);
    res.status(201).json({
      status: 201,
      message: "User created successfully",
      content: { user, accessToken, refreshToken },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        message: "Invalid credentials",
      });
    }
    const { accessToken, refreshToken } = generateToken(user);
    res.status(200).json({
      status: 200,
      message: "Login successful",
      content: { user, accessToken, refreshToken },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.status(200).json({
      status: 200,
      message: "Refresh token successful",
      content: { accessToken },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};
