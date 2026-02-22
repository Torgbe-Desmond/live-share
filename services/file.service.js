const cloudinary = require("../config/claudinary.config");
const streamifier = require("streamifier");
const crypto = require("crypto");

class FileService {
  constructor() {}

  async addAsync(file, folder = "rooms") {
    if (!file || !file.buffer) {
      throw new Error("Invalid file buffer");
    }

    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    const publicId = `${folder}/${hash}`;

    // 1️⃣ Check if already exists
    try {
      const existing = await cloudinary.api.resource(publicId);
      if (existing) {
        return {
          publicId: existing.public_id,
          url: existing.secure_url,
          existing: true,
        };
      }
    } catch (err) {}

    // 2️⃣ Upload if not exists
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "auto",
          overwrite: false,
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result) return reject(new Error("Upload failed"));

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            existing: false,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteAsync(roomId) {
    try {
      await cloudinary.api.delete_resources_by_prefix(`rooms/${roomId}`, {
        resource_type: "image",
      });
      await cloudinary.api.delete_resources_by_prefix(`rooms/${roomId}`, {
        resource_type: "video",
      });
      await cloudinary.api.delete_resources_by_prefix(`rooms/${roomId}`, {
        resource_type: "raw",
      });
      await cloudinary.api.delete_folder(`rooms/${roomId}`);

      return true;
    } catch (error) {}
  }
}

module.exports = FileService;
