const Message = require("../models/Message");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("sender", "username").sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getConversation = async (req, res) => {
  try {
    // Assuming you have middleware that sets req.user (from the token)
    const { userId } = req.query;
    const { receiverId } = req.query;

    const conversation = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ timestamp: 1 }); // oldest message first
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getMessages, getConversation };
