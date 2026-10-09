"use strict";
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

(async () => {
  const server = await ensureStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(`${server.url}/index.html`, { waitUntil: "load", timeout: 60000 });
  try {
    await page.waitForSelector(".sao-warning-okay", { timeout: 5000 });
    await page.locator(".sao-warning-okay").click();
  } catch {}
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const el = document.querySelector(".home-disclaimer");
    const shell = document.querySelector(".shell");
    const cs = el ? getComputedStyle(el) : null;
    const ss = shell ? getComputedStyle(shell) : null;
    return {
      disclaimerText: el ? el.textContent.trim().slice(0, 40) : null,
      disclaimer: cs
        ? {
            border: cs.border,
            borderTopWidth: cs.borderTopWidth,
            borderTopStyle: cs.borderTopStyle,
            borderTopColor: cs.borderTopColor,
            borderRightWidth: cs.borderRightWidth,
            borderBottomWidth: cs.borderBottomWidth,
            borderBottomColor: cs.borderBottomColor,
            borderLeft: cs.borderLeft,
            backgroundImage: cs.backgroundImage.slice(0, 70),
            backgroundColor: cs.backgroundColor,
            padding: cs.padding,
            width: cs.width,
            color: cs.color,
            borderRadius: cs.borderRadius,
            boxShadow: cs.boxShadow.slice(0, 50)
          }
        : null,
      shell: ss ? { border: ss.border, backgroundImage: ss.backgroundImage.slice(0, 60), padding: ss.padding } : null
    };
  });
  console.log(JSON.stringify(info, null, 2));
  console.log("page errors:", JSON.stringify(errors));
  await page.locator(".home-disclaimer").screenshot({ path: "scripts/_hub_disclaimer.png" });
  await browser.close();
  await server.stop();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
