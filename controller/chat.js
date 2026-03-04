const Message = require("../model/message");

const mongoose = require("mongoose");

const getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ error: "Invalid sender or receiver ID" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const messages = await Message.find({
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId },
      ],
    })
      .sort({ timestamp: -1 })
      .populate("senderId")
      .populate("receiverId");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const getAllUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const allMessages = await Message.find({
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
    })
      .sort({ timestamp: -1 })
      .populate("senderId", "")
      .populate("receiverId", "");

    const chatsMap = new Map();

    allMessages.forEach((message) => {
      if (!message.senderId || !message.receiverId) {
        return;
      }

      const senderStr = message.senderId._id.toString();
      const receiverStr = message.receiverId._id.toString();
      const userStr = userObjectId.toString();

      const otherPersonId = senderStr === userStr ? receiverStr : senderStr;

      if (!chatsMap.has(otherPersonId)) {
        chatsMap.set(otherPersonId, {
          chatPartnerId: otherPersonId,
          chatPartner:
            senderStr === userStr ? message.receiverId : message.senderId,
          latestMessage: message,
          messageCount: 1,
        });
      } else {
        chatsMap.get(otherPersonId).messageCount++;
      }
    });

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
      chats: [],
      totalChats: 0,
    });
  }
};

module.exports = {
  getChatHistory,
  getAllUserChats,
};
