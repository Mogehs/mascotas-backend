const multer = require("multer");
const path = require("path");

// Configure disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default to pets folder, can be overridden by setting req.uploadFolder
    const folder = req.uploadFolder || "pets";
    const uploadPath = path.join(__dirname, "..", "uploads", folder);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${timestamp}_${randomString}_${sanitizedName}${ext}`;
    cb(null, uniqueFilename);
  },
});

function fileFilter(req, file, cb) {
  const allowedFiles = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
  if (!allowedFiles.includes(file.mimetype)) {
    cb(new Error("Only images are allowed."), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
