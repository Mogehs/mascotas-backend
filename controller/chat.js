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
    }).sort({ timeStamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

module.exports = {
  getChatHistory,
};
