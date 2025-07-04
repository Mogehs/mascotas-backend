const { Server } = require("socket.io");
const Message = require("../model/message");

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
      console.log(users);
    });

    socket.on("sendMessage", async (data) => {
      // console.log('Received message:', data);
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
      console.log(receiverSocketId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", data);
        console.log("Message sent to:", receiverSocketId);
      } else {
        console.log("Receiver is offline or not registered.");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
