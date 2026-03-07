const NodeCache = require("node-cache");
const mediaCache = new NodeCache({ stdTTL: 3600 });

const { RoomResponseObject } = require("../models");
const mediaService = require("../services/media.service");

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

      console.log("url, roomName, messageId",url, roomName, messageId)

      if (!url) return error(res, "URL is required", 400);

      let mediaData = mediaCache.get(url);

      if (!mediaData) {
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
      return error(res, err.message || "Internal server error", 500);
    }
  }
}
module.exports = new MediaController();
