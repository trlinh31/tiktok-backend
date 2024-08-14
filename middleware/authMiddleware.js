const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ status: 401, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ status: 400, message: "Invalid token." });
  }
};

module.exports = authMiddleware;
