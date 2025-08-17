const Message = require("../model/message");

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


// Create or get chat between sender and receiver
const createOrGetChat = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    // Check if chat exists between these users
    const existingMessages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    // If no messages exist, create an initial chat entry or return empty array
    if (existingMessages.length === 0) {
      return res.json({
        success: true,
        chatExists: false,
        messages: [],
        participants: { senderId, receiverId },
        message: "New chat created",
      });
    }

    // Return existing chat with messages
    res.json({
      success: true,
      chatExists: true,
      messages: existingMessages,
      participants: { senderId, receiverId },
      message: "Chat retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create or retrieve chat",
    });
  }
};

// Send a new message and create chat if needed
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    });

    await newMessage.save();

    res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
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
  createOrGetChat,
  sendMessage,
  getAllUserChats,
};
