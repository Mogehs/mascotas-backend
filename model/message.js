const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
