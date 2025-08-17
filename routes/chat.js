const express = require("express");
const chatController = require("../controller/chat");
const router = express.Router();

router.get("/chatHistory/:senderId/:receiverId", chatController.getChatHistory);

// Route to get all chats for a user
router.get("/user/:userId/chats", chatController.getAllUserChats);

module.exports = router;
