const { RoomResponseObject } = require("../models");
const mediaService = require("../services/media.service");

class MediaController {
  async download(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      const result = await mediaService.process(url);

      const payload = new RoomResponseObject({
        // roomName
        media: result,
        createdAt: new Date(),
      });

      console.log("payload", payload);
      sendMessageToRoom(io, payload);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Media Controller Error:", error.message);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new MediaController();
