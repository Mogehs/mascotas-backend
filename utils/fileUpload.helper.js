const fs = require("fs");
const path = require("path");

/**
 * File Upload Helper
 * Handles local file storage for the Mascotas Backend
 */

// Base uploads directory
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// Subdirectories for different file types
const UPLOAD_FOLDERS = {
  pets: path.join(UPLOADS_DIR, "pets"),
  business: path.join(UPLOADS_DIR, "business"),
  lost: path.join(UPLOADS_DIR, "lost"),
  ads: path.join(UPLOADS_DIR, "ads"),
  products: path.join(UPLOADS_DIR, "products"),
  promotions: path.join(UPLOADS_DIR, "promotions"),
  qrcodes: path.join(UPLOADS_DIR, "qrcodes"),
  tags: path.join(UPLOADS_DIR, "tags"),
  medical: path.join(UPLOADS_DIR, "medical"),
  users: path.join(UPLOADS_DIR, "users"),
};

/**
 * Ensure all upload directories exist
 */
const ensureUploadDirectories = () => {
  // Create main uploads directory
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Create subdirectories
  Object.values(UPLOAD_FOLDERS).forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
  return `${timestamp}_${randomString}_${sanitizedName}${ext}`;
};

/**
 * Save uploaded file to local storage
 * @param {Object} file - File object from express-fileupload
 * @param {string} folder - Folder name (e.g., 'pets', 'business')
 * @returns {Promise<Object>} Object containing file path and URL
 */
const saveFile = async (file, folder = "pets") => {
  try {
    // Ensure directories exist
    ensureUploadDirectories();

    // Get the target folder
    const targetFolder = UPLOAD_FOLDERS[folder] || UPLOAD_FOLDERS.pets;

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Full file path
    const filePath = path.join(targetFolder, filename);

    // Relative path for URL generation
    const relativePath = path.join(folder, filename);

    // Move file from temp location to uploads directory
    if (file.tempFilePath) {
      // If using express-fileupload with useTempFiles
      await file.mv(filePath);
    } else if (file.path) {
      // If using multer
      fs.renameSync(file.path, filePath);
    } else {
      throw new Error("Invalid file object");
    }

    // Generate public URL
    const baseUrl = process.env.BASE_URL || "http://localhost:5001";
    const fileUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, "/")}`;

    return {
      success: true,
      filename,
      filePath,
      relativePath: relativePath.replace(/\\/g, "/"),
      url: fileUrl,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
};

/**
 * Delete file from local storage
 * @param {string} filePath - Path to file (can be relative or absolute)
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    let fullPath = filePath;

    // If it's a relative path, make it absolute
    if (!path.isAbsolute(filePath)) {
      fullPath = path.join(UPLOADS_DIR, filePath);
    }

    // Check if file exists
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${fullPath}`);
      return true;
    } else {
      console.warn(`File not found: ${fullPath}`);
      return false;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Generate public URL for a file
 * @param {string} relativePath - Relative path to file (e.g., 'pets/image.jpg')
 * @returns {string} Public URL
 */
const generateFileUrl = (relativePath) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5001";
  return `${baseUrl}/uploads/${relativePath.replace(/\\/g, "/")}`;
};

/**
 * Extract relative path from full URL
 * @param {string} url - Full URL
 * @returns {string|null} Relative path or null
 */
const extractRelativePathFromUrl = (url) => {
  try {
    if (!url) return null;

    // Extract path after /uploads/
    const match = url.match(/\/uploads\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting path from URL:", error);
    return null;
  }
};

/**
 * Validate file type
 * @param {Object} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} Is valid
 */
const validateFileType = (
  file,
  allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"]
) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Get file size in MB
 * @param {Object} file - File object
 * @returns {number} File size in MB
 */
const getFileSizeMB = (file) => {
  return file.size / (1024 * 1024);
};

module.exports = {
  saveFile,
  deleteFile,
  generateFileUrl,
  extractRelativePathFromUrl,
  validateFileType,
  getFileSizeMB,
  ensureUploadDirectories,
  UPLOAD_FOLDERS,
  UPLOADS_DIR,
};
