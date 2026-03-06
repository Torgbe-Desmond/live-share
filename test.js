const SnapTikHandler = require("./puppeteerFunctions/snapTik");

const tickTokService = new SnapTikHandler();

async function run() {
  await tickTokService.run("https://vt.tiktok.com/ZSue2vUfc");

  const result = await tickTokService.send();

  console.log(result);
}

run().catch(console.error);