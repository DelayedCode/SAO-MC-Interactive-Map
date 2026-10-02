const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer, readPngDimensions } = require("./harness-helpers");

/* Runtime protection for the map images.
 *
 * The WebP migration must not move a single marker. For every floor this loads the real map
 * page and checks that:
 *   - the surface and underground images really are the WebP siblings;
 *   - the decoded image keeps the exact PNG pixel dimensions (the calibration input);
 *   - every positioned marker sits exactly where the coordinate projection says it should.
 */

const root = path.resolve(__dirname, "..");
const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const floors = ["floor1", "floor2", "floor3"];

async function verifyFloor(browser, floor) {
  const expected = readPngDimensions(path.join(root, "Aincrad", "Map", `${floor}.png`));
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    window.localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  try {
    await page.goto(`${rootUrl}/Aincrad/Map/maps.html?floor=${floor}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () => {
        const img = document.getElementById("mapImage");
        return Boolean(img) && img.complete && img.naturalWidth > 0;
      },
      null,
      { timeout: 30000 }
    );

    const state = await page.evaluate(() => {
      const surface = document.getElementById("mapImage");
      const underground = document.getElementById("undergroundMapImage");
      return {
        surfaceSrc: surface.currentSrc || surface.src,
        surfaceWidth: surface.naturalWidth,
        surfaceHeight: surface.naturalHeight,
        undergroundSrc: underground.currentSrc || underground.src
      };
    });
    assert.ok(
      state.surfaceSrc.endsWith(".webp"),
      `${floor}: the surface image is the WebP sibling (${state.surfaceSrc})`
    );
    assert.ok(
      state.undergroundSrc.endsWith(".webp"),
      `${floor}: the underground image is the WebP sibling (${state.undergroundSrc})`
    );
    assert.equal(
      state.surfaceWidth,
      expected.width,
      `${floor}: decoded surface width matches the PNG (${expected.width})`
    );
    assert.equal(
      state.surfaceHeight,
      expected.height,
      `${floor}: decoded surface height matches the PNG (${expected.height})`
    );

    /* Enable every category so all renderable markers appear, then confirm the DOM position
       of each marker equals the coordinate projection for the decoded image size. */
    await page.evaluate(() => {
      document.querySelectorAll(".sidebar-list-button[data-category]").forEach((button) => {
        if (!button.classList.contains("active")) button.click();
      });
    });
    await page.waitForFunction(() => document.querySelectorAll("#markers .marker").length > 0, null, {
      timeout: 15000
    });

    const alignment = await page.evaluate((floorKey) => {
      const markerLayer = document.getElementById("markers");
      const image = document.getElementById("mapImage");
      const adapter = window.AincradMapAdapter;
      /* Mirror the controller's own letterbox metrics (local, untransformed coordinates). */
      const containerW = markerLayer.clientWidth;
      const containerH = markerLayer.clientHeight;
      const scale = Math.min(containerW / image.naturalWidth, containerH / image.naturalHeight);
      const offsetX = (containerW - image.naturalWidth * scale) / 2;
      const offsetY = (containerH - image.naturalHeight * scale) / 2;
      let maxDelta = 0;
      let checked = 0;
      for (const element of document.querySelectorAll("#markers .marker[data-marker-id]")) {
        const marker = adapter.markerDataset[element.dataset.markerId];
        if (!marker || !marker.coords) continue;
        const inverse = window.invertMapCoordinates(marker.coords.x, marker.coords.z, floorKey, {
          width: image.naturalWidth,
          height: image.naturalHeight
        });
        if (!inverse) continue;
        const expectedLeft = offsetX + inverse.rawX * scale;
        const expectedTop = offsetY + inverse.rawY * scale;
        maxDelta = Math.max(
          maxDelta,
          Math.abs(expectedLeft - parseFloat(element.style.left)),
          Math.abs(expectedTop - parseFloat(element.style.top))
        );
        checked += 1;
      }
      return { checked, maxDelta };
    }, floor);

    assert.ok(alignment.checked > 0, `${floor}: at least one positioned marker was measured`);
    assert.ok(
      alignment.maxDelta < 1.5,
      `${floor}: marker alignment matches the projection (max delta ${alignment.maxDelta}px)`
    );
    assert.deepEqual(diagnostics.errors, [], `${floor}: no console errors`);
    assert.deepEqual(diagnostics.failedRequests, [], `${floor}: no failed requests`);

    return {
      floor,
      surfaceSrc: state.surfaceSrc.split("/").pop(),
      width: state.surfaceWidth,
      height: state.surfaceHeight,
      markersChecked: alignment.checked,
      maxDelta: alignment.maxDelta
    };
  } finally {
    await context.close();
  }
}

(async () => {
  await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const floor of floors) {
      results.push(await verifyFloor(browser, floor));
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
