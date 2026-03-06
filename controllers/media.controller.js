const NodeCache = require("node-cache");
// Store cache with a 1-hour TTL (3600 seconds)
const mediaCache = new NodeCache({ stdTTL: 3600 });

const { RoomResponseObject } = require("../models");
const mediaService = require("../services/media.service");
const { sendMessageToRoom } = require("../handlers/messageHandlers");
const { io } = require("../server");

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

class MediaController {
  async download(req, res) {
    try {
      const { url, roomName, messageId } = req.body;

      if (!url) return error(res, "URL is required", 400);

      let mediaData = mediaCache.get(url);

      if (!mediaData) {
        console.log("Cache miss. Processing:", url);
        mediaData = await mediaService.process(url);
        mediaCache.set(url, mediaData); 
      } else {
        console.log("Cache hit for:", url);
      }

      const createdAt = new Date();

      const payload = new RoomResponseObject({
        messageId: messageId || createdAt.getTime().toString(),
        roomName,
        media: mediaData,
        createdAt: createdAt,
      });

      return success(res, payload, 200);
    } catch (err) {
      console.error("Media Controller Error:", err.message);
      return error(res, err.message || "Internal server error", 500);
    }
  }
}
module.exports = new MediaController();
