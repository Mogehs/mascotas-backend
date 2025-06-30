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
const cron = require('node-cron');
const moment = require("moment")
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
app.use("/api/medical/",require("./route/medicalhistory"));
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


const Medical = require("./model/medicalhistory");
// const task = cron.schedule('* * * * *', async() => {
//   try {
//     const todayFormatted = moment().format('YYYY-MM-DD');
//     console.log('Task started at:', todayFormatted);
    
//     const data = await Medical.find().populate('user', '_id device_token');
    
//     const notificationPromises = data.map(async (medical) => {
//       let notification = null;
//       if(medical.pet_vaccine_date != 'N/A'){
//         const vaccineReminderDate = moment(medical.pet_vaccine_date).subtract(1, 'day').format('YYYY-MM-DD');
//         console.log(vaccineReminderDate);
//         console.log(todayFormatted);
//         if (todayFormatted === vaccineReminderDate) {
//           notification = {
//             title: `Vaccine Reminder for ${medical.pet.pet_name}`,
//             body: `Your pet ${medical.pet.pet_name} has a vaccine scheduled for tomorrow (${medical.pet_vaccine_date}). Don't forget!`
//           }``;
//           console.log(notification);
//       } else if(medical.pet_deworming_date != 'N/A'){
//         const dewormingReminderDate = moment(medical.pet_deworming_date).subtract(1, 'day').format('YYYY-MM-DD'); 
//         if (todayFormatted === dewormingReminderDate) {
//           notification = {
//             title: `Deworming Reminder for ${medical.pet.pet_name}`,
//             body: `Your pet ${medical.pet.pet_name} has a deworming scheduled for tomorrow (${medical.pet_deworming_date}). Don't forget!`
//           };
//           console.log(notification);
//         }
//             }
//          }
//       return null;
//     });
    
//     await Promise.all(notificationPromises.filter(p => p !== null));
//     console.log('Task completed successfully');
//   } catch (error) {
//     console.error('Error in scheduled task:', error);
//   }
// }, {
//   scheduled: true,
//   timezone: "America/New_York" // Set your timezone
// });

// task.start();

// console.log('Cron job scheduled to run every minute');
const {JWT} = require("google-auth-library");
const axios = require("axios")
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
const client = new JWT({
    email: "firebase-adminsdk-fbsvc@appmascotas-44762.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC2QHsc9iHSAIkn\n+lZEaCffoBuCC3Ur+96Zf63YQ7j74pmUFbrWJr5GXMUQtz30Qf5+qrKyT+M/cbgL\nAgY0tBtrIdVhotNGj0a3WAEiXJL+8PPFzxZ1pC9ZMVEzi+XH8hq/d6Jo1SDLqAI4\nwwEskHPXwLPSyBBmzJP+7eTfaNUJU7GNoo/DTrKcRStu/hWe7B8hbu1Ne8yDBJS1\noi0LPLCSiI4gTO2rJcEJmIxUPz0F6Lh4Mbz/66cSPlIoU28OmV9AiESHdez6TE5v\nnBowmgDt2tMJvNMGic4pvCHR22rZXiEMSsFx2x+CofZxHGXgx8dTY0x+OZH09j8M\nvDnduoCnAgMBAAECggEAA/3ylGZRxFNNrcn+dL4hTXUo1RbiKKX6MLuKt8d3+FB0\n07kMIB+2ID1s9ZpF6aE+bVDY3C4CyMN5aAhR0Xq2dQjHLz3NSejegCqVz8ZeU+Y8\nOLN6BvajMN1zLWFdlZ0Yd+QrcwdkEgHqloqy7mJ1nx6x8aZ/MXk+rqFQV5JoxCz/\nEPuiOgdBqy11wy7cP4OxMfhw87mIHa7fVBdX/YRKB/go9ZIKLDEA7fZoeIgyyH7m\nnQckwETBWYyqEY1MbiA1wtkwh421HlJprA7EKMGFxpulVD0+t8SrTOAixWEnX+8D\n9FAbBXGw76wfXxv1wtGqolWNXyM3x9IYJtO/FYUi0QKBgQD52kr3pEWs/FuSsIha\naIoRJt8I4Fi0+X1msfT22Iyh1RIUbhX/ZRLKVFKf4evGYsUxN22OAuZZfzQ80sIH\nTSBUupFO03kBzkidolJOJ4lUIPrhv8jyLGc0+iuqTwAO2izjmTHA0+FYOyDINpMm\nuNCCGD+Ttx3EKwkqpc4xGRFGEQKBgQC6vGbN8xQh/d9DkD/MFmHtlPnWTumEo9Wl\nJhCHogIVStkyUi5qnwgnIdGpOZXWR4fpWZknsToog/exmztFy+FjJToJGSaeTeR7\nqc+Cd94zVLDfkKY4lzDDiEwjbGZqVlQf4GgIz8hP0bQtNNwEbyJvleD83i/hk7wK\n4AmaVM5DNwKBgFTk8ywJyRLp/ENvcCUn+CGzz3y4neuACjfmp5FoKwCh4S7H6PmK\nYkQVOq3Qmcgir1X1u2fRXGt0aU9xXTQV5LJlYhIikK8oZEwLZ2Pe0y6etiAWhjSj\nGb5KcqO/jAl/4FjFKL6YP603CgB9aqpxiYdqrc+HHLoW1VqEU/ciyVfBAoGAalP+\n4cRIsXZCW9FWUlpoVoTeocX7N9imPUxoWyLHtuIQvJOI9JMrbETYglhU1leSry+i\ngrRqnklOj+YJIRwPcYnv+uBEWh2WPUga7XpdnrLZp+NQkqacUKpaWE1QH7qaWjBI\nbMQLlk+dHaScpzW00P7xxmqprvOVPkgFj8g8To8CgYBXHqRpP5i5uAEReufdZywF\ng35HdY9WznKC7axRbK/0+fmxDy/to+3d9q6wIkbxpDFBSlnT3sirMXKhSQoaJjid\nVRm+cbI/Jui9zsnpdMR7/RbrrWyVW0ZBDVea64jNuBdrPsyLK+Hy2wirEDtL0UtN\n/Zc5D2IGUO8Z159eje6aIQ==\n-----END PRIVATE KEY-----\n",
    scopes: SCOPES
})

const task = cron.schedule('0 9 * * *', async () => {
  try {
    const todayFormatted = moment().format('YYYY-MM-DD');
    const data = await Medical.find().populate('user', 'device_token').populate('pet', 'pet_name');;
    const notificationPromises = data.map(async (medical) => {
       if(medical.pet_vaccine_date != 'N/A'){
        const vaccineReminderDate = moment(medical.pet_vaccine_date).subtract(1, 'day').format('YYYY-MM-DD');
        if(todayFormatted === vaccineReminderDate){
         let notification = {
            title: `Recordatorio de desparasitación para: ${medical.pet.pet_name}`,
            body: `Tu mascota ${medical.pet.pet_name} tiene una vacuna programada para mañana(${medical.pet_vaccine_date}). ¡No lo olvides!`
          };
          if(medical.user?.device_token !== ''){
            console.log(medical.user?.device_token);
            sendPushNotification(medical.user?.device_token,notification)
          }
        }
       }else if(medical.pet_deworming_date != 'N/A'){
        //const dewormingReminderDate = moment(medical.pet_deworming_reminder_date).subtract(1, 'day').format('YYYY-MM-DD');
        if(todayFormatted === medical.pet_deworming_date){
         let notification = {
            title: `Recordatorio de vacunas para: ${medical.pet.pet_name}`,
            body: `Tu mascota ${medical.pet.pet_name} tiene una desparasitación programada para mañana(${medical.pet_vaccine_date}). ¡No lo olvides!`
          };
          if(medical.user?.device_token !== ''){
            console.log(medical.user?.device_token);
            sendPushNotification(medical.user?.device_token,notification)
          }
        }
       }
      return null;
    });
    
    await Promise.all(notificationPromises.filter(p => p !== null));
    console.log('Task completed successfully at:', new Date().toISOString());
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
}, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

task.start();

console.log('Cron job scheduled to run every minute');
async function sendPushNotification(deviceToken,notification) {

  const tokens = await client.authorize();
  const message = {
    token: deviceToken,
    notification: {
      title: notification.title,
      body: notification.body
    },
    data:{
      "type": "reminder",
    }
  };

  const headers = {
    'Authorization': `Bearer ${tokens.access_token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/v1/projects/appmascotas-44762/messages:send',
      { message },
      { headers }
    );
    console.log('Notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
    throw error;
  }
}

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