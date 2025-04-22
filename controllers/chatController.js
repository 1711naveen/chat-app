const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

const messages = async (req, res) => {
  const { senderId, receiverId, content, type } = req.body;
  if (!senderId || !receiverId || !content)
    return res.status(400).json({ error: "senderId, receiverId and content are required" })
  try {
    const message = new Message({ sender: senderId, receiver: receiverId, content, type: type || "text" });
    const saved = await message.save();
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

// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find({}, "_id username");
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching conversation:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// }




const getUsers = async (req, res) => {
  try {
    // 1) Current user’s ObjectId
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const contacts = await User.aggregate([
      // 2) Exclude yourself
      {
        $match: {
          _id: { $ne: currentUserId }
        }
      },
      // 3) Lookup the single most recent message between you and each user
      {
        $lookup: {
          from: "messages",
          let: { otherId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$sender", currentUserId] },
                        { $eq: ["$receiver", "$$otherId"] }
                      ]
                    },
                    {
                      $and: [
                        { $eq: ["$receiver", currentUserId] },
                        { $eq: ["$sender", "$$otherId"] }
                      ]
                    }
                  ]
                }
              }
            },
            { $sort: { timestamp: -1 } },  // newest first
            { $limit: 1 },                 // only the latest
            { $project: { timestamp: 1 } }
          ],
          as: "lastMsg"
        }
      },
      // 4) Pull the timestamp (or null if never messaged)
      {
        $addFields: {
          lastMessageAt: { $arrayElemAt: ["$lastMsg.timestamp", 0] }
        }
      },
      // 5) Sort descending by that timestamp—nulls (never messaged) go last
      {
        $sort: { lastMessageAt: -1 }
      },
      // 6) Project only the fields you need
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          lastMessageAt: 1
        }
      }
    ]);
    return res.status(200).json(contacts);
    
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




module.exports = { messages, getConversation, getUsers };
