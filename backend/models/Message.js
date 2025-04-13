const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true }, // fixed typo here
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema); // fixed Model to model
