"use strict";
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

(async () => {
  const server = await ensureStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(`${server.url}/index.html`, { waitUntil: "load", timeout: 60000 });
  try {
    await page.waitForSelector(".sao-warning-okay", { timeout: 5000 });
    await page.locator(".sao-warning-okay").click();
  } catch {}
  await page.evaluate(() => {
    document.getElementById("sao-tour-overlay")?.remove();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "scripts/_hub_full.png", fullPage: true });
  await browser.close();
  await server.stop();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
