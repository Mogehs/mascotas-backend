require("dotenv").config();
const express = require("express");
const connectToMongo = require('./db');
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const  mongoose = require("mongoose");
const cors = require("cors");
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
 app.use(cors());
app.use(bodyParser.json());
app.get("/",async(req,res)=>{
    res.send("api is working")
})
// app.use(express.urlencoded({
//   extended: true
// }));
const fileUpload = require("express-fileupload");
app.use(fileUpload({useTempFiles: true,limits: {fileSize: 500*2024*1024}}))
app.use("/api/auth/",require("./route/user"));
app.use("/api/pet/",require("./route/pet"));
app.use("/api/language/",require('./route/language'));
app.use("/api/order/",require("./route/order"));
app.use("/api/lost/",require('./route/lost'));
app.use("/api/business/",require("./route/business"))
app.use("/api/ads",require("./route/ads"));
app.post("/api",async(req,res)=>{
    const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'https://fe12-144-48-134-48.ngrok-free.app'; // Optional
const YOUR_SITE_NAME = 'NGROK'; // Optional
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": YOUR_SITE_URL, // Optional
    "X-Title": YOUR_SITE_NAME, // Optional
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "deepseek/deepseek-chat",
    'messages': [
    {'role': 'system',
      'content': 'You are a helpful veterinary assistant. Provide professional advice for common pet health issues,but always recommend consulting a real veterinarian for serious concerns.'},
      // 'content': 'You are a helpful assistant. Provide detailed responses with headings,descriptions,without bullets,without hash point and clear explanations.'},
    {'role': 'user', 'content': req.body.message}
  ],
  })
})
.then(response => response.json())
.then(data => {
  res.status(200).send(data);
})
.catch(error => {
   res.status(200).json({success: true, message: error});
});
})

app.post("/trainer",async(req,res)=>{
  const OPENROUTER_API_KEY = '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';
const YOUR_SITE_URL = 'https://fe12-144-48-134-48.ngrok-free.app'; // Optional
const YOUR_SITE_NAME = 'NGROK'; // Optional
fetch("https://openrouter.ai/api/v1/chat/completions", {
method: "POST",
headers: {
  "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
  "HTTP-Referer": YOUR_SITE_URL, // Optional
  "X-Title": YOUR_SITE_NAME, // Optional
  "Content-Type": "application/json"
},
body: JSON.stringify({
  "model": "deepseek/deepseek-chat",
  'messages': [
  {'role': 'system',
    'content': 'You are a professional dog training assistant. Offer helpful, accurate, and concise advice on dog training topics. Focus on positive reinforcement techniques and ethical training methods. If they ask you about harmful or abusive training methods, politely redirect them to positive alternatives. Include practical steps and examples where appropriate.'},
    // 'content': 'You are a helpful assistant. Provide detailed responses with headings,descriptions,without bullets,without hash point and clear explanations.'},
  {'role': 'user', 'content': req.body.message}
],
})
})
.then(response => response.json())
.then(data => {
res.status(200).send(data);
})
.catch(error => {
 res.status(200).json({success: true, message: error});
});
})


const messageSchema = new mongoose.Schema({
  senderId: {type: String, required: true},
  receiverId: {type: String, required: true},
  message: {type: String, required: true},
  timestamp: {type: Date, required: Date.now}
})

const Message = mongoose.model("Message",messageSchema)

app.get("/chatHistory/:senderId/:receiverId",async(req,res)=>{
  const {senderId, receiverId} = req.params;
  try {
    const messages = await Message.find({
      $or:[
        {
        senderId,receiverId
      },
      {senderId: receiverId,receiverId:senderId},
    ]
    }).sort({timeStamp: -1});
    res.json(messages);
    
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch messages'})
  }
})


const users = {}; 
const onlineUsers = new Map();
io.on('connection',(socket)=>{
console.log('User connected:', socket.id);

socket.on('userLoggedIn',(data)=>{
users[data] = socket.id;
console.log(users);
});

socket.on('sendMessage',async(data)=>{
  // console.log('Received message:', data);
  const {senderId,receiverId,message,timestamp} = data;
  const newMessage = new Message({senderId,receiverId,timestamp,message});
  await newMessage.save();

 // Get receiver's socket ID
        const receiverSocketId = users[receiverId];
        console.log(receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", data);
            console.log('Message sent to:', receiverSocketId);
        } else {
            console.log('Receiver is offline or not registered.');
        }
});


   socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


server.listen(process.env.PORT,()=>{
    console.log("working");
    connectToMongo();
});