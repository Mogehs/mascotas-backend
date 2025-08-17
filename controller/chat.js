const Message = require("../model/message");
const User = require("../model/user");

const mongoose = require("mongoose");

const getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid sender or receiver ID" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // ✅ Fetch messages between both users
    const messages = await Message.find({
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId }
      ]
    })
        .sort({ timestamp: -1 })
        .populate("senderId") // populate sender
        .populate("receiverId"); // populate receiver

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


const getAllUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ✅ Get all messages where user is sender or receiver
    const allMessages = await Message.find({
      $or: [
        { senderId: userObjectId },
        { receiverId: userObjectId }
      ],
    })
        .sort({ timestamp: -1 })
        .populate("senderId", "")
        .populate("receiverId", "");

    // ✅ Group messages by chat partner
    const chatsMap = new Map();

    allMessages.forEach((message) => {
      const senderStr = message.senderId._id.toString();
      const receiverStr = message.receiverId._id.toString();
      const userStr = userObjectId.toString();

      // Find the other participant
      const otherPersonId = senderStr === userStr ? receiverStr : senderStr;

      if (!chatsMap.has(otherPersonId)) {
        chatsMap.set(otherPersonId, {
          chatPartnerId: otherPersonId,
          chatPartner:
              senderStr === userStr ? message.receiverId : message.senderId, // full user info
          latestMessage: message,
          messageCount: 1,
        });
      } else {
        chatsMap.get(otherPersonId).messageCount++;
      }
    });

    // Convert map to array
    const chats = Array.from(chatsMap.values());

    res.json({
      success: true,
      userId,
      totalChats: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Error in getAllUserChats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user chats",
    });
  }
};

module.exports = {
  getChatHistory,
  getAllUserChats,
};
