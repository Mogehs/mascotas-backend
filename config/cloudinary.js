const cloudinary = require("cloudinary").v2;
// import dotenv from 'dotenv'
// dotenv.config()
require("dotenv").config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary