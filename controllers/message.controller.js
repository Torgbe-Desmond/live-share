const { globalSocketReference, userSocketMap } = require("../functions/users");
const {
  sendMessageToRoom,
  sendPersonalMessage,
} = require("../handlers/messageHandlers");
const { handleJoinRoom } = require("../handlers/userHandlers");
const { getRoomSize, getUserRoomStatus } = require("../helpers/roomHelpers");
const {
  RoomResponseObject,
  PersonalMessageResponseObject,
  FileObject,
} = require("../models");
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

class MessageController {
  async addMessage(req, res) {
    try {
      const { roomName, content, senderId, username, replyTo, messageId } =
        req.body;

      if (!roomName || !senderId) {
        return error(res, "roomName and senderId are required", 400);
      }

      const roomPath = `rooms/${roomName}`;

      // 1. Upload file (if any)
      let mainFile = null;
      if (req.file) {
        const uploaded = await fileService.addAsync(req.file, roomPath);
        mainFile = new FileObject(req.file, uploaded);
      }

      // 2. Parse reply metadata
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
    
      // 4. Build & send message
      const payload = new RoomResponseObject({
        content: content || "",
        senderId,
        roomName,
        messageId,
        username: username || "",
        replyTo: replyObject,
        files: mainFile ? [mainFile] : [],
        createdAt: new Date(),
      });

      sendMessageToRoom(io, payload);

      return success(res, payload, 201);
    } catch (err) {
      console.error("AddMessage Error:", err);
      return error(res, err.message || "Failed to create message", 500);
    }
  }

  async addPersonalMessage(req, res) {
    try {
      const {
        conversationId,
        content,
        senderId,
        username,
        replyTo,
        messageId,
        to,
        from,
      } = req.body;

      if (!conversationId || !senderId) {
        return error(res, "conversationId and senderId are required", 400);
      }

      const roomPath = `rooms/${conversationId}`;

      // =========================================
      // 1️⃣ Upload NEW message file (if exists)
      // =========================================
      let mainFile = null;

      if (req.file) {
        const uploaded = await fileService.addAsync(req.file, roomPath);
        mainFile = new FileObject(req.file, uploaded);
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

      const payload = new PersonalMessageResponseObject({
        content: content,
        senderId,
        messageId,
        to,
        from,
        conversationId,
        username: username,
        replyTo: replyObject,
        files: mainFile ? [mainFile] : [],
        createdAt: new Date(),
      });

      sendPersonalMessage(io, payload);

      return success(res, payload, 201);
    } catch (err) {
      console.error("AddMessage Error:", err);
      return error(res, err.message || "Failed to create message", 500);
    }
  }
}

module.exports = new MessageController();
