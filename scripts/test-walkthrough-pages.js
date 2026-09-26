const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const rootUrl = "http://localhost:8080";
const tours = [
  { name: "welcome", path: "/index.html", key: "sao.walkthrough.index.completed", steps: 5 },
  { name: "aincrad-map", path: "/Aincrad/Map/maps.html", key: "sao.walkthrough.maps.completed", steps: 4 },
  { name: "underworld-map", path: "/Fractured%20Underworld/Main%20UI/mainui.html", key: "sao.walkthrough.mainui.completed", steps: 4 }
];
const languages = ["en", "es", "fr"];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 }
];

function inViewport(rect, width, height) {
  return rect && rect.left >= 0 && rect.top >= 0 && rect.right <= width && rect.bottom <= height;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      for (const language of languages) {
        for (const tour of tours) {
          const page = await browser.newPage({ viewport });
          const errors = [];
          const failedRequests = [];
          page.on("console", message => {
            if (message.type() === "error" && !message.text().includes("frame-ancestors")) errors.push(message.text());
          });
          page.on("pageerror", error => errors.push(error.message));
          page.on("requestfailed", request => failedRequests.push(request.url()));

          await page.goto(`${rootUrl}${tour.path}`, { waitUntil: "networkidle" });
          await page.evaluate(({ language, key }) => {
            window.SAOI18n.setLanguage(language);
            window.SAOStorage.removeItem(key);
          }, { language, key: tour.key });
          await page.reload({ waitUntil: "networkidle" });
          await page.waitForTimeout(700);

          for (let stepIndex = 0; stepIndex < tour.steps; stepIndex += 1) {
            await page.waitForTimeout(450);
            const state = await page.evaluate(() => {
              const target = document.querySelector(".sao-tour-focus-target");
              const card = document.querySelector(".sao-tour-card");
              const cardRect = card?.getBoundingClientRect();
              const targetRect = target?.getBoundingClientRect();
              const text = [...document.querySelectorAll(".sao-tour-step, .sao-tour-title, .sao-tour-body, .sao-tour-actions button")]
                .map(element => element.textContent || "")
                .join(" ");
              return {
                open: document.querySelector(".sao-tour-overlay.open") !== null,
                target: Boolean(target),
                targetRect: targetRect && { left: targetRect.left, top: targetRect.top, right: targetRect.right, bottom: targetRect.bottom },
                cardRect: cardRect && { left: cardRect.left, top: cardRect.top, right: cardRect.right, bottom: cardRect.bottom },
                text,
                overflow: document.documentElement.scrollWidth > innerWidth
              };
            });
            assert.equal(state.open, true, `${tour.name}/${language}/${viewport.name}: tour should be open at step ${stepIndex + 1}`);
            assert.equal(state.target, true, `${tour.name}/${language}/${viewport.name}: target missing at step ${stepIndex + 1}`);
            assert.equal(inViewport(state.targetRect, viewport.width, viewport.height), true, `${tour.name}/${language}/${viewport.name}: target outside viewport at step ${stepIndex + 1}`);
            assert.equal(inViewport(state.cardRect, viewport.width, viewport.height), true, `${tour.name}/${language}/${viewport.name}: card outside viewport at step ${stepIndex + 1}`);
            assert.equal(state.overflow, false, `${tour.name}/${language}/${viewport.name}: horizontal overflow at step ${stepIndex + 1}`);
            assert.equal(state.text.includes("page."), false, `${tour.name}/${language}/${viewport.name}: raw localization key at step ${stepIndex + 1}`);
            if (stepIndex < tour.steps - 1) await page.locator(".sao-tour-actions button").nth(2).click({ force: true });
          }

          await page.locator(".sao-tour-actions button").nth(2).click({ force: true });
          await page.waitForTimeout(200);
          assert.equal(await page.evaluate(key => window.SAOStorage.getItem(key), tour.key), "1", `${tour.name}/${language}/${viewport.name}: finish should persist`);
          assert.deepEqual(errors, [], `${tour.name}/${language}/${viewport.name}: browser errors`);
          assert.deepEqual(failedRequests, [], `${tour.name}/${language}/${viewport.name}: failed requests`);
          results.push({ tour: tour.name, language, viewport: viewport.name, status: "passed" });
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});