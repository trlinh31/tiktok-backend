const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", userController.getUsers);
router.get("/search", userController.searchUsers);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/:userId", authMiddleware, userController.updateUser);

module.exports = router;
