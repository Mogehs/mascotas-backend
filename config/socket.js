const { Server } = require("socket.io");
const Message = require("../model/message");
const User = require("../model/user");
const { sendPushNotification } = require("../service/notification.service");

const users = {};
const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("userLoggedIn", (data) => {
      users[data] = socket.id;
      console.log("User logged in:", data, "Socket ID:", socket.id);
      console.log("Online users:", users);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, timestamp } = data;
      const newMessage = new Message({
        senderId,
        receiverId,
        timestamp,
        message,
      });
      await newMessage.save();

      // Get receiver's socket ID
      const receiverSocketId = users[receiverId];
      console.log("Receiver socket ID:", receiverSocketId);

      if (receiverSocketId) {
        // User is online, send via socket
        io.to(receiverSocketId).emit("receiveMessage", data);
        console.log("Message sent via socket to:", receiverSocketId);
      } else {
        // User is offline, send push notification
        console.log("Receiver is offline, sending push notification");
        try {
          const receiver = await User.findById(receiverId);
          const sender = await User.findById(senderId);

          if (receiver && receiver.device_token && sender) {
            const senderName = sender.firstname + " " + sender.lastname;

            await sendPushNotification(
              receiver.device_token,
              {
                title: `New message from ${senderName}`,
                body:
                  message.length > 50
                    ? message.substring(0, 50) + "..."
                    : message,
              },
              {
                type: "chat_message",
                senderId: senderId,
                senderName: senderName,
                chatId: `${senderId}_${receiverId}`,
                navigation_route: "/chat",
              }
            );

            console.log(
              `Push notification sent to ${receiver.firstname} ${receiver.lastname}`
            );
          }
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
      }
    });

    socket.on("disconnect", () => {
      // Remove user from online users when they disconnect
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          console.log("User disconnected and removed:", userId);
          break;
        }
      }
      console.log("Updated online users:", users);
    });
  });

  return io;
};

// Export users object so other modules can access it
module.exports = { initializeSocket, users };
