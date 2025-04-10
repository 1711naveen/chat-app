const Message = require("../models/Message");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("sender", "username").sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getMessages };
