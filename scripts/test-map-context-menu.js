"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";

async function findMapSurfacePoint(page) {
  return page.evaluate(() => {
    const container = document.getElementById("mapContainer");
    const layer = document.getElementById("mapLayer");
    if (!container || !layer) {
      throw new Error("Map surface not found.");
    }
    const rect = container.getBoundingClientRect();
    const fractions = Array.from({ length: 17 }, (_, index) => (index + 1) / 18);
    for (const yFraction of fractions) {
      for (const xFraction of fractions) {
        const x = rect.left + rect.width * xFraction;
        const y = rect.top + rect.height * yFraction;
        const target = document.elementFromPoint(x, y);
        if (
          !target ||
          !layer.contains(target) ||
          target.closest(
            ".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls, #mapEmptyState, #measurementLayer, #mapContextMenu"
          )
        ) {
          continue;
        }
        return { x, y };
      }
    }
    throw new Error("Could not find an unobstructed map surface point.");
  });
}

async function findDistinctMapSurfacePoint(page, minDistancePx = 80) {
  return page.evaluate(({ minDistancePx }) => {
    const container = document.getElementById("mapContainer");
    const layer = document.getElementById("mapLayer");
    if (!container || !layer) {
      throw new Error("Map surface not found.");
    }
    const existingCenters = Array.from(document.querySelectorAll("#measurementLayer circle"))
      .filter((node) => node.style.display !== "none")
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
      });
    const rect = container.getBoundingClientRect();
    const fractions = Array.from({ length: 17 }, (_, index) => (index + 1) / 18);
    for (const yFraction of fractions) {
      for (const xFraction of fractions) {
        const x = rect.left + rect.width * xFraction;
        const y = rect.top + rect.height * yFraction;
        const target = document.elementFromPoint(x, y);
        if (
          !target ||
          !layer.contains(target) ||
          target.closest(
            ".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls, #mapEmptyState, #measurementLayer, #mapContextMenu"
          )
        ) {
          continue;
        }
        const isDistinct = existingCenters.every((center) => Math.hypot(center.x - x, center.y - y) >= minDistancePx);
        if (isDistinct) {
          return { x, y };
        }
      }
    }
    throw new Error("Could not find a distinct unobstructed map surface point.");
  }, { minDistancePx });
}

async function openMapMenu(page) {
  const point = await findMapSurfacePoint(page);
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.waitForFunction(() => {
    const menu = document.getElementById("mapContextMenu");
    return menu && !menu.hidden && menu.getAttribute("aria-hidden") !== "true";
  });
  return point;
}

async function readMeasurementState(page) {
  return page.evaluate(() => {
    const measurementLayer = document.getElementById("measurementLayer");
    if (!measurementLayer) {
      return { exists: false, first: null, second: null, lineVisible: false, labelVisible: false };
    }
    const circles = Array.from(measurementLayer.querySelectorAll("circle"));
    const line = measurementLayer.querySelector("line");
    const label = measurementLayer.querySelector("text");
    return {
      exists: true,
      first: circles[0]
        ? { x: Number(circles[0].getAttribute("cx")), y: Number(circles[0].getAttribute("cy")), visible: circles[0].style.display !== "none" }
        : null,
      second: circles[1]
        ? { x: Number(circles[1].getAttribute("cx")), y: Number(circles[1].getAttribute("cy")), visible: circles[1].style.display !== "none" }
        : null,
      lineVisible: line ? line.style.display !== "none" : false,
      labelVisible: label ? label.style.display !== "none" : false
    };
  });
}

async function readMeasurementVisuals(page) {
  return page.evaluate(() => {
    const line = document.querySelector("#measurementLayer line");
    const points = Array.from(document.querySelectorAll("#measurementLayer circle"));
    const label = document.querySelector("#measurementLayer text");
    const transform = new DOMMatrix(getComputedStyle(document.getElementById("mapLayer")).transform);
    const image = document.getElementById("mapImage");
    const pointSizes = points.map((point) => {
      const rect = point.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      line: {
        x1: Number(line.getAttribute("x1")),
        y1: Number(line.getAttribute("y1")),
        x2: Number(line.getAttribute("x2")),
        y2: Number(line.getAttribute("y2")),
        strokeWidth: Number.parseFloat(getComputedStyle(line).strokeWidth),
        strokeDasharray: line.getAttribute("stroke-dasharray")
      },
      pointSizes,
      label: {
        x: Number(label.getAttribute("x")),
        y: Number(label.getAttribute("y")),
        fontSize: Number.parseFloat(getComputedStyle(label).fontSize),
        text: label.textContent
      },
      transform: { zoom: transform.a, translateX: transform.e, translateY: transform.f },
      image: {
        width: image.offsetWidth,
        height: image.offsetHeight,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      }
    };
  });
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });

  try {
    const page = await context.newPage();
    await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(
      () =>
        window.__aincradMapRuntime?.isInitialized?.() &&
        document.getElementById("mapContainer")?.clientWidth > 0 &&
        document.getElementById("mapContainer")?.clientHeight > 0
    );

    const distanceExamples = await page.evaluate(() => {
      const distance = window.getDistanceMeasurementDistance;
      return {
        threeFourFive: distance({ x: 0, z: 0 }, { x: 3, z: 4 }),
        horizontal: distance({ x: 0, z: 0 }, { x: 100, z: 0 }),
        vertical: distance({ x: 0, z: 0 }, { x: 0, z: 100 }),
        negativeCoordinates: distance({ x: -100, z: -200 }, { x: 100, z: 100 }),
        reverseDirection: distance({ x: 100, z: 100 }, { x: 0, z: 0 }),
        identical: distance({ x: 500, z: -300 }, { x: 500, z: -300 })
      };
    });
    assert.equal(distanceExamples.threeFourFive, 5, "Minecraft X/Z 3-4-5 distance is 5 blocks");
    assert.equal(distanceExamples.horizontal, 100, "Minecraft X-only distance is 100 blocks");
    assert.equal(distanceExamples.vertical, 100, "Minecraft Z-only distance is 100 blocks");
    assert.ok(Math.abs(distanceExamples.negativeCoordinates - Math.sqrt(130000)) < 1e-12);
    assert.ok(Math.abs(distanceExamples.reverseDirection - Math.sqrt(20000)) < 1e-12);
    assert.equal(distanceExamples.identical, 0, "identical Minecraft coordinates have zero distance");

    const doublePoint = await findMapSurfacePoint(page);
    await page.mouse.click(doublePoint.x, doublePoint.y, { clickCount: 2, delay: 25 });
    assert.equal(await page.evaluate(() => !!document.getElementById("measurementLayer")), false, "double-left-click does not create a measurement");

    await openMapMenu(page);
    assert.equal(await page.evaluate(() => document.getElementById("mapContextMenu")?.hidden), false, "right-click opens the context menu");

    await page.locator("#mapContextMenu [data-map-action='create-custom-marker']").click();
    await page.waitForFunction(() => document.getElementById("customWaypointDialog")?.open === true, null, { timeout: 10000 });
    const xValue = await page.locator("#customWaypointX").inputValue();
    const zValue = await page.locator("#customWaypointZ").inputValue();
    assert.ok(Number.isFinite(Number(xValue)), "custom waypoint coordinate X is populated");
    assert.ok(Number.isFinite(Number(zValue)), "custom waypoint coordinate Z is populated");

    await page.locator("#customWaypointCancel").click();
    const distancePoint1Screen = await openMapMenu(page);
    const distancePoint1World = await page.evaluate(
      ({ x, y }) => window.getDistanceMeasurementPointFromEvent({ clientX: x, clientY: y }),
      distancePoint1Screen
    );
    assert.equal(distancePoint1World.floor, "floor1", "the selected floor's converter supplies endpoint world coordinates");
    assert.ok(Number.isFinite(distancePoint1World.x) && Number.isFinite(distancePoint1World.z));
    await page.locator("#mapContextMenu [data-map-action='distance-point-1']").click();
    const firstMeasurement = await page.evaluate(() => {
      const measurementLayer = document.getElementById("measurementLayer");
      return {
        exists: !!measurementLayer,
        lineVisible: measurementLayer ? measurementLayer.querySelector("line")?.style.display !== "none" : false,
        pointCount: measurementLayer ? measurementLayer.querySelectorAll("circle").length : 0
      };
    });
    assert.equal(firstMeasurement.exists, true, "distance point 1 creates a measurement layer");
    assert.equal(firstMeasurement.pointCount, 2, "distance point 1 renders the first point");

    const distancePoint2Screen = await openMapMenu(page);
    const distancePoint2World = await page.evaluate(
      ({ x, y }) => window.getDistanceMeasurementPointFromEvent({ clientX: x, clientY: y }),
      distancePoint2Screen
    );
    await page.locator("#mapContextMenu [data-map-action='distance-point-2']").click();
    const afterSecond = await page.evaluate(() => {
      const measurementLayer = document.getElementById("measurementLayer");
      return {
        exists: !!measurementLayer,
        lineVisible: measurementLayer ? measurementLayer.querySelector("line")?.style.display !== "none" : false,
        text: measurementLayer ? measurementLayer.querySelector("text")?.textContent || "" : ""
      };
    });
    assert.equal(afterSecond.exists, true, "distance point 2 adds the second point");
      const eventPathDistance = Math.sqrt(
        (distancePoint2World.x - distancePoint1World.x) ** 2 + (distancePoint2World.z - distancePoint1World.z) ** 2
      );
      assert.equal(
        afterSecond.text,
        `Distance: ${eventPathDistance.toFixed(1)}`,
        "displayed distance uses full-precision Minecraft X/Z from actual map event conversion"
      );
    assert.ok(afterSecond.text.includes("Distance:"), "distance label text renders");

    const measurementHitTest = await page.evaluate(() => {
      const layer = document.getElementById("measurementLayer");
      const graphics = [layer, ...layer.querySelectorAll("*")];
      const computedPointerEvents = graphics.map((graphic) => getComputedStyle(graphic).pointerEvents);
      const line = layer.querySelector("line");
      const containerRect = layer.getBoundingClientRect();
      const x = containerRect.left + (Number(line.getAttribute("x1")) + Number(line.getAttribute("x2"))) / 2;
      const y = containerRect.top + (Number(line.getAttribute("y1")) + Number(line.getAttribute("y2"))) / 2;
      const hitTarget = document.elementFromPoint(x, y);
      return {
        computedPointerEvents,
        hitTargetIsMeasurement: Boolean(hitTarget?.closest("#measurementLayer")),
        hitTargetIsMapLayer: Boolean(document.getElementById("mapLayer").contains(hitTarget)),
        point: { x, y }
      };
    });
    assert.deepEqual(
      measurementHitTest.computedPointerEvents,
      ["none", "none", "none", "none", "none"],
      "measurement SVG and every graphic are non-interactive"
    );
    assert.equal(measurementHitTest.hitTargetIsMeasurement, false, "hit testing passes through the measurement SVG");
    assert.equal(measurementHitTest.hitTargetIsMapLayer, true, "the map receives hit testing through the line");
    await page.mouse.click(measurementHitTest.point.x, measurementHitTest.point.y, { button: "right" });
    await page.waitForFunction(() => document.getElementById("mapContextMenu").hidden === false);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.getElementById("mapContextMenu").hidden === true);

    const baseState = await readMeasurementState(page);
    assert.ok(baseState.first && baseState.second, "two measurement points exist before replacement");

    const replacementPoint2 = await findDistinctMapSurfacePoint(page, 90);
    await page.mouse.click(replacementPoint2.x, replacementPoint2.y, { button: "right" });
    await page.waitForFunction(() => {
      const menu = document.getElementById("mapContextMenu");
      return menu && !menu.hidden && menu.getAttribute("aria-hidden") !== "true";
    });
    await page.locator("#mapContextMenu [data-map-action='distance-point-2']").click();

    const afterPoint2Replacement = await readMeasurementState(page);
    assert.ok(afterPoint2Replacement.first, "Point 1 remains present after replacing Point 2");
    assert.ok(afterPoint2Replacement.second, "Point 2 remains present after replacement");
    assert.equal(afterPoint2Replacement.first.x, baseState.first.x, "Point 1 should not be replaced when Point 2 is updated");
    assert.equal(afterPoint2Replacement.first.y, baseState.first.y, "Point 1 should keep its original visual position");
    assert.notEqual(afterPoint2Replacement.second.x, baseState.second.x, "Point 2 should move to the newest coordinate");
    assert.equal(afterPoint2Replacement.lineVisible, true, "the line remains visible for the surviving point pair");

    const replacementPoint1 = await findDistinctMapSurfacePoint(page, 90);
    await page.mouse.click(replacementPoint1.x, replacementPoint1.y, { button: "right" });
    await page.waitForFunction(() => {
      const menu = document.getElementById("mapContextMenu");
      return menu && !menu.hidden && menu.getAttribute("aria-hidden") !== "true";
    });
    await page.locator("#mapContextMenu [data-map-action='distance-point-1']").click();

    const afterPoint1Replacement = await readMeasurementState(page);
    assert.ok(afterPoint1Replacement.first, "Point 1 is still present after replacement");
    assert.ok(afterPoint1Replacement.second, "Point 2 survives replacing Point 1");
    assert.notEqual(afterPoint1Replacement.first.x, baseState.first.x, "Point 1 should move to the newest coordinate");
    assert.equal(afterPoint1Replacement.second.x, afterPoint2Replacement.second.x, "Point 2 should remain in place after Point 1 is updated");
    assert.equal(afterPoint1Replacement.lineVisible, true, "the distance line remains visible after independent replacement");

    const baselineVisuals = await readMeasurementVisuals(page);
    assert.ok(Math.abs(baselineVisuals.transform.zoom - 1) < 0.001, "baseline measurement sample is at 1x zoom");
    const assertStableVisualSize = (visuals, zoomLabel) => {
      assert.equal(visuals.line.strokeWidth, baselineVisuals.line.strokeWidth, `${zoomLabel}: line stroke stays screen-sized`);
      assert.equal(visuals.line.strokeDasharray, baselineVisuals.line.strokeDasharray, `${zoomLabel}: dash spacing stays screen-sized`);
      assert.equal(visuals.label.fontSize, baselineVisuals.label.fontSize, `${zoomLabel}: label font stays screen-sized`);
      assert.equal(visuals.label.text, baselineVisuals.label.text, `${zoomLabel}: distance value is unchanged`);
      visuals.pointSizes.forEach((size, index) => {
        assert.ok(Math.abs(size.width - baselineVisuals.pointSizes[index].width) < 0.5, `${zoomLabel}: endpoint ${index + 1} width stays fixed`);
        assert.ok(Math.abs(size.height - baselineVisuals.pointSizes[index].height) < 0.5, `${zoomLabel}: endpoint ${index + 1} height stays fixed`);
      });
      assert.equal(visuals.label.x, (visuals.line.x1 + visuals.line.x2) / 2, `${zoomLabel}: label remains centered on the line`);
      assert.equal(visuals.label.y, (visuals.line.y1 + visuals.line.y2) / 2 - 12, `${zoomLabel}: label offset remains consistent`);
    };
    const assertFollowsMapTransform = (previous, current, zoomLabel) => {
      const localX1 = (previous.line.x1 - previous.transform.translateX) / previous.transform.zoom;
      const localY1 = (previous.line.y1 - previous.transform.translateY) / previous.transform.zoom;
      const localX2 = (previous.line.x2 - previous.transform.translateX) / previous.transform.zoom;
      const localY2 = (previous.line.y2 - previous.transform.translateY) / previous.transform.zoom;
      assert.ok(Math.abs(current.line.x1 - (current.transform.translateX + localX1 * current.transform.zoom)) < 0.1, `${zoomLabel}: first endpoint follows map X transform`);
      assert.ok(Math.abs(current.line.y1 - (current.transform.translateY + localY1 * current.transform.zoom)) < 0.1, `${zoomLabel}: first endpoint follows map Y transform`);
      assert.ok(Math.abs(current.line.x2 - (current.transform.translateX + localX2 * current.transform.zoom)) < 0.1, `${zoomLabel}: second endpoint follows map X transform`);
      assert.ok(Math.abs(current.line.y2 - (current.transform.translateY + localY2 * current.transform.zoom)) < 0.1, `${zoomLabel}: second endpoint follows map Y transform`);
    };
    const assertFollowsImageCoordinates = (previous, current) => {
      const scaleFor = (image) => Math.min(image.width / image.naturalWidth, image.height / image.naturalHeight);
      const previousScale = scaleFor(previous.image);
      const currentScale = scaleFor(current.image);
      const previousOffsetX = (previous.image.width - previous.image.naturalWidth * previousScale) / 2;
      const previousOffsetY = (previous.image.height - previous.image.naturalHeight * previousScale) / 2;
      const currentOffsetX = (current.image.width - current.image.naturalWidth * currentScale) / 2;
      const currentOffsetY = (current.image.height - current.image.naturalHeight * currentScale) / 2;
      for (const endpoint of [1, 2]) {
        const rawX =
          ((previous.line[`x${endpoint}`] - previous.transform.translateX) / previous.transform.zoom - previousOffsetX) /
          previousScale;
        const rawY =
          ((previous.line[`y${endpoint}`] - previous.transform.translateY) / previous.transform.zoom - previousOffsetY) /
          previousScale;
        const expectedX = current.transform.translateX + (currentOffsetX + rawX * currentScale) * current.transform.zoom;
        const expectedY = current.transform.translateY + (currentOffsetY + rawY * currentScale) * current.transform.zoom;
        assert.ok(Math.abs(current.line[`x${endpoint}`] - expectedX) < 0.1, `resize: endpoint ${endpoint} keeps its image X coordinate`);
        assert.ok(Math.abs(current.line[`y${endpoint}`] - expectedY) < 0.1, `resize: endpoint ${endpoint} keeps its image Y coordinate`);
      }
    };

    let previousVisuals = baselineVisuals;
    for (const targetZoom of [2, 3, 4.2]) {
      while ((await readMeasurementVisuals(page)).transform.zoom < targetZoom) {
        await page.locator("#zoomIn").click();
      }
      const visuals = await readMeasurementVisuals(page);
      assertStableVisualSize(visuals, `${visuals.transform.zoom.toFixed(1)}x`);
      assertFollowsMapTransform(previousVisuals, visuals, `${visuals.transform.zoom.toFixed(1)}x`);
      previousVisuals = visuals;
    }

    const panPoint = await findMapSurfacePoint(page);
    await page.mouse.move(panPoint.x, panPoint.y);
    await page.mouse.down();
    await page.mouse.move(panPoint.x + 30, panPoint.y + 20, { steps: 3 });
    await page.mouse.up();
    await page.waitForFunction(
      (beforeTransform) => document.getElementById("mapLayer").style.transform !== beforeTransform,
      `translate(${previousVisuals.transform.translateX}px, ${previousVisuals.transform.translateY}px) scale(${previousVisuals.transform.zoom})`
    );
    const afterPanVisuals = await readMeasurementVisuals(page);
    assertStableVisualSize(afterPanVisuals, "after pan");
    assertFollowsMapTransform(previousVisuals, afterPanVisuals, "after pan");

    await page.setViewportSize({ width: 1280, height: 860 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const afterResizeVisuals = await readMeasurementVisuals(page);
    assertStableVisualSize(afterResizeVisuals, "after browser resize");
    assert.equal(afterResizeVisuals.label.text, baselineVisuals.label.text, "browser resize preserves the measured distance");
    assertFollowsImageCoordinates(afterPanVisuals, afterResizeVisuals);

    await openMapMenu(page);
    await page.locator("#mapContextMenu [data-map-action='reset-distance']").click();
    const afterReset = await page.evaluate(() => {
      const measurementLayer = document.getElementById("measurementLayer");
      if (!measurementLayer) return { exists: false, lineVisible: false, pointsHidden: false };
      const line = measurementLayer.querySelector("line");
      const points = Array.from(measurementLayer.querySelectorAll("circle"));
      return {
        exists: true,
        lineVisible: line ? line.style.display !== "none" : false,
        pointsHidden: points.length > 0 && points.every((point) => point.style.display === "none")
      };
    });
    assert.equal(afterReset.exists, true, "reset keeps the measurement layer mounted");
    assert.equal(afterReset.lineVisible, false, "reset hides the line and clears the measurement");
    assert.equal(afterReset.pointsHidden, true, "reset hides the measurement points");

    assert.equal(await page.locator("#mapContextMenu").evaluate((menu) => menu.hidden), true, "closing the menu hides it");
    assert.ok((await page.locator("#mapContextMenu").evaluate((menu) => menu.getAttribute("aria-hidden"))) === "true");
    console.log("Map context menu regression checks passed.");
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
