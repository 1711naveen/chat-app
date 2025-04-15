const express = require("express");
// const protect = require("../middleware/authMiddleware");
const { getMessages, getConversation } = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", getMessages);
router.get("/conversation", getConversation);

module.exports = router;
