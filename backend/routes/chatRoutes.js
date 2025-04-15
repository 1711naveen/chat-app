const express = require("express");
// const protect = require("../middleware/authMiddleware");
const { getMessages, getConversation, getUsers } = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", getMessages);
router.get("/conversation", getConversation);
router.get("/users", getUsers);

module.exports = router;
