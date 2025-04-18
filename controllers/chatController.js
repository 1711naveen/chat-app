const Message = require("../models/Message");
const User = require("../models/User")

const messages = async (req, res) => {
  const { senderId, receiverId, content, type } = req.body;
  if (!senderId || !receiverId || !content)
    return res.status(400).json({ error: "senderId, receiverId and content are required" })
  try {
    // const message = new Message({ sender: senderId, receiver: receiverId, content, type: type || "text" });
    // const saved = await message.save();
    return res.status(201).json({ message: "data saved" });
  } catch (err) {
    console.error("Error saving message:", err);
    return res.status(500).json({ error: "Could not save message" });
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

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

module.exports = { messages, getConversation, getUsers };
