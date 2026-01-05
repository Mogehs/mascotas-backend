const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const { ensureUploadDirectories } = require("../utils/fileUpload.helper");

const configureServer = (app) => {
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(bodyParser.json());
  app.use(
    fileUpload({ useTempFiles: true, limits: { fileSize: 500 * 2024 * 1024 } })
  );

  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // Ensure upload directories exist
  ensureUploadDirectories();
};

module.exports = configureServer;
