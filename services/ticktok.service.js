const puppeteer = require("puppeteer");

class SnapTikHandler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.urls = [];
    this.videoInfo = null;
    this.base_url = "https://snaptik.app/en2";
  }

  static browserInstance = null;

  async initialize() {
    try {
      if (!SnapTikHandler.browserInstance) {
        SnapTikHandler.browserInstance = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
          ],
        });
      }

      this.browser = SnapTikHandler.browserInstance;
      this.page = await this.browser.newPage();

      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      );

      // Block unnecessary resources (ads, fonts, etc.)
      await this.page.setRequestInterception(true);

      this.page.on("request", (req) => {
        const blocked = ["image", "font", "stylesheet"];

        if (blocked.includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
    } catch (error) {
      console.error("Browser initialization error:", error);
    }
  }

  async navigateTo(url) {
    try {
      console.log(`🌐 Navigating to: ${url}`);

      await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    } catch (error) {
      console.error("Navigation failed:", error.message);
    }
  }

  async inputLink(link) {
    try {
      await this.page.waitForSelector(".link-input", { timeout: 15000 });

      // Clear input safely
      await this.page.evaluate(() => {
        const input = document.querySelector(".link-input");
        if (input) input.value = "";
      });

      await this.page.type(".link-input", link, { delay: 20 });

      console.log("✅ Link inserted");
    } catch (error) {
      console.error("Input error:", error.message);
    }
  }

  async submitForm() {
    try {
      const buttonSelector = ".button-go";

      await this.page.waitForSelector(buttonSelector, { timeout: 15000 });

      await this.page.click(buttonSelector);

      await this.page.waitForSelector(".download-box", {
        timeout: 30000,
      });

      console.log("✅ Download section loaded");
    } catch (error) {
      console.error("Submit error:", error.message);
      throw error;
    }
  }

  async getDownloadLinks() {
    try {
      await this.page.waitForSelector("a.download-file", {
        timeout: 30000,
      });

      const links = await this.page.$$eval("a.download-file", (anchors) =>
        anchors
          .map((a) => a.href.trim())
          .filter((href) => href.startsWith("https"))
      );

      this.urls = links;

      return links;
    } catch (error) {
      console.error("Download link extraction failed:", error.message);
      return [];
    }
  }

  async getDownloadInfo() {
    try {
      await this.page.waitForSelector(".video-header", { timeout: 30000 });

      const data = await this.page.evaluate(() => {
        const thumbnail = document.querySelector("#thumbnail")?.src || null;
        const title =
          document.querySelector(".video-title")?.innerText.trim() || null;
        const username =
          document.querySelector(".video-header .info span")?.innerText.trim() ||
          null;

        return {
          thumbnail,
          title,
          username,
        };
      });

      return data;
    } catch (error) {
      console.error("Video info extraction failed:", error.message);
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
    try {
      if (this.page) {
        await this.page.close();
      }
    } catch (error) {
      console.error("Page close error:", error);
    }
  }

  async run(link) {
    try {
      await this.initialize();
      await this.navigateTo(this.base_url);

      await this.inputLink(link);
      await this.submitForm();

      const [urls, videoInfo] = await Promise.all([
        this.getDownloadLinks(),
        this.getDownloadInfo(),
      ]);

      if (!urls.length) {
        throw new Error("No download links found.");
      }

      this.urls = urls;
      this.videoInfo = videoInfo;

      return await this.send();
    } catch (error) {
      console.error("SnapTik run error:", error);
      return null;
    } finally {
      await this.close();
    }
  }
}

module.exports = SnapTikHandler;