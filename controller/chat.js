const Message = require("../model/message");

const getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId,
        },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: -1 }); // Fixed: changed timeStamp to timestamp
    res.json(messages);
  } catch (error) {
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

// Get all chats for a specific user
const getAllUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all messages where user is either sender or receiver
    const allMessages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    }).sort({ timestamp: -1 });

    // Group messages by chat partner
    const chatsMap = new Map();

    allMessages.forEach((message) => {
      // Determine the other person in the chat
      const otherPersonId =
        message.senderId === userId ? message.receiverId : message.senderId;

      // If this chat partner hasn't been added yet, add them with this message as the latest
      if (!chatsMap.has(otherPersonId)) {
        chatsMap.set(otherPersonId, {
          chatPartnerId: otherPersonId,
          latestMessage: message,
          messageCount: 1,
        });
      } else {
        // Increment message count for existing chat
        chatsMap.get(otherPersonId).messageCount++;
      }
    });

    // Convert map to array
    const chats = Array.from(chatsMap.values());

    res.json({
      success: true,
      userId: userId,
      totalChats: chats.length,
      chats: chats,
    });
  } catch (error) {
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
