const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMessages, getConversation, getUsers } = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", protect, getMessages);
router.get("/conversation", protect, getConversation);
router.get("/users", protect, getUsers);

module.exports = router;
