require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectToMongo = require('./db');
const fetch = require("node-fetch");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors({origin: "*"}));
app.get("/",async(req,res)=>{
    res.send("api is working")
})


const fileUpload = require("express-fileupload");
app.use(fileUpload({useTempFiles: true,limits: {fileSize: 500*2024*1024}}))
app.use("/api/auth/",require("./route/user"));
app.use("/api/pet/",require("./route/pet"));
app.use("/api/language/",require('./route/language'));
app.use("/api/order/",require("./route/order"));
app.use("/api/lost/",require('./route/lost'));
app.use("/api/business",require("./route/business"))
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
    {'role': 'system', 'content': 'You are a helpful assistant. Provide detailed responses with headings,descriptions,without bullets,without hash point and clear explanations.'},
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



app.listen(process.env.PORT,()=>{
    console.log("working");
    connectToMongo();
})