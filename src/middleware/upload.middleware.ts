import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"));
  },
});

// If you're sending a single file with field name "file"
export const uploadSinglePhoto = upload.single("file");

// If multiple files (field name "files")
export const uploadMultiplePhotos = upload.array("files", 8);

// Export raw multer instance (optional)
export default upload;