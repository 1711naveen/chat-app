const mongoose = require("mongoose")

const MessageSchema = new mongoose.Schame({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { tpye: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.Model("Message", MessageSchema)