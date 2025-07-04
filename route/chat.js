const express = require("express");
const chatController = require("../controller/chat");
const router = express.Router();

router.get("/chatHistory/:senderId/:receiverId", chatController.getChatHistory);

module.exports = router;
