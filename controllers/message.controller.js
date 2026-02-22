const { sendMessageToRoom } = require("../handlers/messageHandlers");
const { io } = require("../server");
const FileService = require("../services/file.service");

const fileService = new FileService();

function success(res, data = null, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

function error(res, message = "Something went wrong", status = 400) {
  return res.status(status).json({
    success: false,
    error: message,
  });
}

class File {
  constructor(file, uploaded) {
    this.originalname = file.originalname;
    this.path = uploaded.url;
    this.publicId = uploaded.publicId;
    this.type = file.mimetype;
    this.local = false;
    this.isSuccess = true;
    this.viewOnce = false;
    this.isFailed = false;
  }
}

class MessageController {
  async addMessage(req, res) {
    try {
      const { roomName, content, senderId, username, replyTo, messageId } =
        req.body;

      if (!roomName || !senderId) {
        return error(res, "roomName and senderId are required", 400);
      }

      const roomPath = `rooms/${roomName}`;

      // =========================================
      // 1️⃣ Upload NEW message file (if exists)
      // =========================================
      let mainFile = null;

      if (req.file) {
        const uploaded = await fileService.addAsync(req.file, roomPath);
        mainFile = new File(req.file, uploaded);
      }

      // =========================================
      // 2️⃣ Parse reply metadata (NO uploading)
      // =========================================
      let replyObject = null;

      if (replyTo) {
        let parsedReply;

        try {
          parsedReply = JSON.parse(replyTo);
        } catch (err) {
          return error(res, "Invalid replyTo format", 400);
        }

        replyObject = {
          messageId: parsedReply.messageId || null,
          content: parsedReply.content || "",
          username: parsedReply.username || "",
          files: parsedReply.files || [],
        };
      }

      // =========================================
      // 3️⃣ Build final message payload
      // =========================================
      const messagePayload = {
        content: content || null,
        senderId,
        roomName,
        messageId,
        username: username || null,
        replyTo: replyObject,
        files: mainFile ? [mainFile] : [],
        createdAt: new Date(),
      };

      sendMessageToRoom(io, messagePayload);

      return success(res, messagePayload, 201);
    } catch (err) {
      console.error("AddMessage Error:", err);
      return error(res, err.message || "Failed to create message", 500);
    }
  }
}

module.exports = new MessageController();
