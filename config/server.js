const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const { ensureUploadDirectories } = require("../utils/fileUpload.helper");

const MAX_IMAGE_SIZE_MB = 50;
const MAX_BODY_SIZE = "50mb";

const configureServer = (app) => {
  app.use(express.json({ limit: MAX_BODY_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: MAX_BODY_SIZE }));
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(bodyParser.json({ limit: MAX_BODY_SIZE }));
  app.use(
    fileUpload({
      useTempFiles: true,
      limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024 },
      abortOnLimit: true,
      limitHandler: (req, res) => {
        return res.status(413).json({
          success: false,
          message: `Image size exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_MB}MB per file. Please compress or resize your image and try again.`,
        });
      },
    })
  );

  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // Ensure upload directories exist
  ensureUploadDirectories();
};

module.exports = { configureServer, MAX_IMAGE_SIZE_MB };
