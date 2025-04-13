const express = require("express");
// const protect = require("../middleware/authMiddleware");
const { getMessages } = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", getMessages);

module.exports = router;
