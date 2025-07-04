const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const configureServer = (app) => {
  app.use(express.json());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    fileUpload({ useTempFiles: true, limits: { fileSize: 500 * 2024 * 1024 } })
  );
};

module.exports = configureServer;
