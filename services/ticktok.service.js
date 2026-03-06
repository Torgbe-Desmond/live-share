const puppeteer = require("puppeteer");
require("dotenv").config();

class SnapTikHandler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.urls = [];
    this.videoInfo = null;
    this.base_url = "https://snaptik.app/en2";
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    this.page = await this.browser.newPage();

    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
    );
  }

  async navigateTo(url) {
    console.log(`🌐 Navigating to: ${url}`);

    try {
      await this.page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 120000,
      });
    } catch (error) {
      console.error("❌ Navigation failed:", error.message);
    }
  }

  async inputLink(link) {
    try {
      await this.page.waitForSelector(".link-input", { timeout: 10000 });

      await this.page.click(".link-input", { clickCount: 3 });
      await this.page.type(".link-input", link);

      console.log("✅ Link inputted successfully.");
    } catch (error) {
      console.error("❌ Failed to input the link:", error.message);
    }
  }
  async submitForm() {
    try {
      const buttonSelector = ".button-go";
      await this.page.waitForSelector(buttonSelector);
      await this.page.click(buttonSelector);
    
      await this.page.waitForSelector(".download-box", {
        timeout: 30000, 
      });

    } catch (error) {
      throw error; 
    }
  }

  async getDownloadLinks() {
    try {
      const selector =
        ".section .container .download .download-box .video-links a.download-file";

      await this.page.waitForSelector(selector, { timeout: 30000 });

      const links = await this.page.evaluate(() => {
        const anchors = document.querySelectorAll(
          ".section .container .download .download-box .video-links a.download-file",
        );

        return Array.from(anchors)
          .map((a) => a.href.trim())
          .filter((href) => href.startsWith("https://"));
      });

      this.urls = links;

      return links;
    } catch (error) {
      return [];
    }
  }

  async getDownloadInfo() {
    try {
      await this.page.waitForSelector(".video-header", { timeout: 30000 });

      const data = await this.page.evaluate(() => {
        const thumbnail = document.querySelector("#thumbnail")?.src || null;
        const title = document.querySelector(".video-title")?.innerText || null;
        const username =
          document.querySelector(".video-header .info span")?.innerText || null;

        return {
          thumbnail,
          title,
          username,
        };
      });

      return data;
    } catch (error) {
      return {};
    }
  }

  async send() {
    return {
      video: this.videoInfo,
      urls: this.urls,
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run(link) {
    try {
      await this.initialize();
      await this.navigateTo(this.base_url);
      await this.inputLink(link);
      await this.submitForm();

      // Parallelize extraction to speed up response time
      const [urls, videoInfo] = await Promise.all([
        this.getDownloadLinks(),
        this.getDownloadInfo(),
      ]);

      if (urls.length === 0) throw new Error("No download links found");

      this.urls = urls;
      this.videoInfo = videoInfo;

      return await this.send();
    } catch (error) {
      return null;
    } finally {
      await this.close();
    }
  }
}

module.exports = SnapTikHandler;
