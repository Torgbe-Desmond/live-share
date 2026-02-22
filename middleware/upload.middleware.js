// src/middleware/uploadMiddleware.js
const multer = require("multer");
const storage = multer.memoryStorage();

// Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"));
  },
});

// Export middleware functions
module.exports = {
  // For single file upload (field name: "photo")
  uploadSinglePhoto: upload.single("file"),

  // For multiple files (field name: "photos", max 8)
  uploadMultiplePhotos: upload.array("files", 8),

  // Optional: raw multer instance if needed elsewhere
  upload,
};
