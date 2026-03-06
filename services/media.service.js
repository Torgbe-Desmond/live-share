const SnapTikHandler = require("./ticktok.service");

class MediaService {
  constructor() {
    this.handlers = {
      tiktok: SnapTikHandler,
      // instagram: InstagramHandler,
      // youtube: YoutubeHandler
    };
  }

  detectPlatform(url) {
    if (url.includes("tiktok.com")) return "tiktok";
    return null;
  }

  async process(url) {
    const platform = this.detectPlatform(url);

    if (!platform || !this.handlers[platform]) {
      throw new Error("Unsupported platform");
    }

    const Handler = this.handlers[platform];

    const handler = new Handler();

    const result = await handler.run(url);

    return {
      platform,
      ...result,
    };
  }
}

module.exports = new MediaService();