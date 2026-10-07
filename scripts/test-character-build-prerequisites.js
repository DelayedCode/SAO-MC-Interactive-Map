"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const classIds = ["archer", "assassin", "guerrier", "mage", "shaman"];
const screenshotTwoPrerequisites = ["skill3", "skill5", "skill25", "skill28"];
const screenshotThreePrerequisites = ["skill49", "skill50", "skill61", "skill66"];

async function openBuilder(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    [
      "sao.walkthrough.index.completed",
      "sao.walkthrough.maps.completed",
      "sao.walkthrough.mainui.completed",
      "sao.walkthrough.characterBuild.completed"
    ].forEach((key) => window.localStorage.setItem(key, "1"));
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(builderUrl, { waitUntil: "load" });
  await page.waitForSelector("#skillTreeCanvas .skill-node");
  return { context, page, ...diagnostics };
}

function sorted(values) {
  return [...values].sort();
}

async function unlock(page, classId, skillId, adjacency = null) {
  const button = page.locator(`[data-skill-id="${classId}-${skillId}"]`);
  assert((await button.getAttribute("class")).includes("is-available"), `${classId} ${skillId} is available`);
  await button.click();
  if (adjacency) await assertCurrentModel(page, classId, adjacency);
  assert.equal(await button.getAttribute("aria-pressed"), "true", `${classId} ${skillId} unlocks`);
}

async function switchToClass(page, classId) {
  await page.locator("#characterClass").selectOption(classId);
  assert.equal(await page.locator("#skillTreeCanvas .skill-node").count(), 77, `${classId}: 77 rendered nodes`);
  assert.equal(await page.locator("#skillTreeCanvas .skill-node.is-selected").count(), 1, `${classId}: selections do not leak across classes`);
  return page.locator("#skillTreeCanvas .skill-node").evaluateAll((nodes) =>
    nodes.map((node) => ({
      skillId: node.dataset.skillId.replace(/^[^-]+-/, ""),
      x: node.style.getPropertyValue("--node-x"),
      y: node.style.getPropertyValue("--node-y")
    }))
  );
}

function pruneExpectedSelection(selected, adjacency) {
  const result = new Set(selected);
  let removed;
  do {
    removed = false;
    for (const skillId of result) {
      if (skillId === "skill1") continue;
      const valid = skillId === "skill58"
        ? screenshotThreePrerequisites.every((id) => result.has(id))
        : adjacency[skillId].some((id) => result.has(id));
      if (!valid) {
        result.delete(skillId);
        removed = true;
      }
    }
  } while (removed);
  return result;
}

async function assertRenderedStates(page, classId, selected, adjacency) {
  const actual = await page.locator("#skillTreeCanvas .skill-node").evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: node.dataset.skillId.replace(`${node.dataset.skillId.split("-")[0]}-`, ""),
      selected: node.classList.contains("is-selected"),
      available: node.classList.contains("is-available"),
      locked: node.classList.contains("is-locked")
    }))
  );
  const selectedWithRoot = new Set(selected);
  selectedWithRoot.add("skill1");
  for (const node of actual) {
    const isSelected = selectedWithRoot.has(node.id);
    const isAvailable = node.id === "skill58"
      ? screenshotThreePrerequisites.every((id) => selectedWithRoot.has(id))
      : adjacency[node.id].some((id) => selectedWithRoot.has(id));
    assert.equal(node.selected, isSelected, `${classId} ${node.id}: selected state matches the model`);
    assert.equal(node.available, !isSelected && isAvailable, `${classId} ${node.id}: availability matches the model`);
    assert.equal(node.locked, !isSelected && !isAvailable, `${classId} ${node.id}: lock state matches the model`);
  }
}

async function assertCurrentModel(page, classId, adjacency) {
  const selected = new Set(
    await page.locator("#skillTreeCanvas .skill-node.is-selected").evaluateAll((nodes) =>
      nodes.map((node) => node.dataset.skillId.replace(/^[^-]+-/, ""))
    )
  );
  const normalized = pruneExpectedSelection(selected, adjacency);
  assert.deepEqual(sorted([...selected]), sorted([...normalized]), `${classId}: no invalid selections remain`);
  await assertRenderedStates(page, classId, selected, adjacency);
}

async function deselectSkill(page, classId, skillId, adjacency) {
  const button = page.locator(`[data-skill-id="${classId}-${skillId}"]`);
  assert.equal(await button.getAttribute("aria-pressed"), "true", `${classId} ${skillId} is selected`);
  await button.click();
  await assertCurrentModel(page, classId, adjacency);
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  let session;
  try {
    session = await openBuilder(browser);
    const { page } = session;
    const audit = await page.evaluate((classes) => {
      const data = window.CharacterBuildData;
      const skillByPoint = new Map(data.SKILL_TREE_LAYOUT.map((point) => [point.id, point.skillId]));
      const neighbors = new Map(data.SKILL_TREE_LAYOUT.map((point) => [point.skillId, new Set()]));
      data.SKILL_TREE_CONNECTIONS.forEach(([from, to]) => {
        const first = skillByPoint.get(from);
        const second = skillByPoint.get(to);
        neighbors.get(first).add(second);
        neighbors.get(second).add(first);
      });
      const errors = [];
      const skill58Requirements = {};

      for (const classId of classes) {
        const skills = data.CLASS_SKILLS[classId];
        const keys = Object.keys(skills).sort();
        if (keys.length !== 77) errors.push(`${classId}: expected 77 skills, found ${keys.length}`);
        skill58Requirements[classId] = [...(skills.skill58.prerequisites || [])].sort();
        if (skill58Requirements[classId].some((id) => !skills[id])) {
          errors.push(`${classId}: Skill 58 references a nonexistent required skill`);
        }
        if (skill58Requirements[classId].includes("skill58")) errors.push(`${classId}: Skill 58 requires itself`);
        if ((skills.skill61.prerequisites || []).includes("skill58")) {
          errors.push(`${classId}: Skill 61 must not require Skill 58`);
        }
      }
      return {
        nodeCount: data.SKILL_TREE_LAYOUT.length,
        connectionCount: data.SKILL_TREE_CONNECTIONS.length,
        adjacency: Object.fromEntries([...neighbors].map(([skillId, adjacent]) => [skillId, [...adjacent]])),
        skill58Requirements,
        layout: data.SKILL_TREE_LAYOUT.map((point) => ({
          skillId: point.skillId,
          x: `${point.x}px`,
          y: `${point.y}px`
        })),
        errors
      };
    }, classIds);

    assert.equal(audit.nodeCount, 77);
    assert.equal(audit.connectionCount, 100);
    assert.equal(audit.adjacency.skill1.length, 4, "root adjacency comes from the visual connections");
    assert.deepEqual(sorted(audit.adjacency.skill4), sorted(screenshotTwoPrerequisites), "Skill 4 uses the four screenshot-marked visual alternatives");
    classIds.forEach((classId) =>
      assert.deepEqual(audit.skill58Requirements[classId], sorted(screenshotThreePrerequisites), `${classId}: Skill 58 ALL inputs`)
    );
    assert.deepEqual(audit.errors, [], "special Skill 58 requirements are valid and Skill 61 does not require it");

    let sharedRenderedLayout;
    for (const classId of classIds) {
      const renderedLayout = await switchToClass(page, classId);
      assert.deepEqual(renderedLayout, audit.layout, `${classId}: rendered coordinates match the shared layout`);
      if (sharedRenderedLayout) assert.deepEqual(renderedLayout, sharedRenderedLayout, `${classId}: same rendered layout`);
      sharedRenderedLayout = renderedLayout;
      await assertCurrentModel(page, classId, audit.adjacency);
      const skill8DataPrerequisites = await page.evaluate(
        (selectedClassId) => window.CharacterBuildData.CLASS_SKILLS[selectedClassId].skill8.prerequisites,
        classId
      );
      assert(!skill8DataPrerequisites.includes("skill7"), `${classId}: test distinguishes visual adjacency from stored skill data`);
      await unlock(page, classId, "skill6", audit.adjacency);
      await unlock(page, classId, "skill7", audit.adjacency);
      assert(audit.adjacency.skill8.includes("skill7"), "Skill 7 is directly adjacent to Skill 8");
      assert((await page.locator(`[data-skill-id="${classId}-skill8"]`).getAttribute("class")).includes("is-available"));
      await unlock(page, classId, "skill8", audit.adjacency);
      await deselectSkill(page, classId, "skill7", audit.adjacency);
      assert.equal(await page.locator(`[data-skill-id="${classId}-skill8"]`).getAttribute("aria-pressed"), "false");
      await assertCurrentModel(page, classId, audit.adjacency);
      await page.locator("#resetBuild").click();
      if (classId !== "archer") await switchToClass(page, classId);
      await assertCurrentModel(page, classId, audit.adjacency);
      const skill4 = page.locator(`[data-skill-id="${classId}-skill4"]`);
      const skill3 = page.locator(`[data-skill-id="${classId}-skill3"]`);
      const skill25 = page.locator(`[data-skill-id="${classId}-skill25"]`);

      assert((await skill4.getAttribute("class")).includes("is-locked"), `${classId}: Skill 4 starts locked`);
      await skill4.click();
      assert.equal(await skill4.getAttribute("aria-pressed"), "false", `${classId}: locked Skill 4 cannot unlock`);
      await assertCurrentModel(page, classId, audit.adjacency);
      await unlock(page, classId, "skill2", audit.adjacency);
      await unlock(page, classId, "skill3", audit.adjacency);
      assert((await skill4.getAttribute("class")).includes("is-available"), `${classId}: Skill 3 opens an alternative path to Skill 4`);
      await skill4.click();
      await assertCurrentModel(page, classId, audit.adjacency);
      assert.equal(await skill4.getAttribute("aria-pressed"), "true", `${classId}: Skill 4 unlocks from the Skill 3 path`);
      await unlock(page, classId, "skill33", audit.adjacency);
      await unlock(page, classId, "skill25", audit.adjacency);
      await unlock(page, classId, "skill5", audit.adjacency);
      await unlock(page, classId, "skill28", audit.adjacency);
      await deselectSkill(page, classId, "skill3", audit.adjacency);
      assert.equal(await skill3.getAttribute("aria-pressed"), "false", `${classId}: one OR prerequisite can be removed while another remains`);
      assert.equal(await skill4.getAttribute("aria-pressed"), "true", `${classId}: Skill 4 stays valid through the remaining alternative`);
      await deselectSkill(page, classId, "skill28", audit.adjacency);
      assert.equal(await skill4.getAttribute("aria-pressed"), "true", `${classId}: Skill 4 remains valid through Skill 25 after Skill 28 is removed`);
      await deselectSkill(page, classId, "skill5", audit.adjacency);
      assert.equal(await skill4.getAttribute("aria-pressed"), "true", `${classId}: Skill 4 remains valid through Skill 25 after Skill 5 is removed`);
      await deselectSkill(page, classId, "skill25", audit.adjacency);
      assert.equal(await skill25.getAttribute("aria-pressed"), "false", `${classId}: prerequisite can be removed`);
      assert.equal(await skill4.getAttribute("aria-pressed"), "false", `${classId}: Skill 4 is pruned when its last adjacent skill is removed`);

      const alternateClass = classId === "archer" ? "assassin" : "archer";
      await switchToClass(page, alternateClass);
      await switchToClass(page, classId);
      await assertCurrentModel(page, classId, audit.adjacency);

      for (const skillId of ["skill49", "skill6", "skill50", "skill52", "skill56", "skill66"]) {
        await unlock(page, classId, skillId, audit.adjacency);
      }
      const skill58 = page.locator(`[data-skill-id="${classId}-skill58"]`);
      assert((await skill58.getAttribute("class")).includes("is-locked"), `${classId}: Skill 58 waits for Skill 61`);
      await skill58.click();
      await assertCurrentModel(page, classId, audit.adjacency);
      assert.equal(await skill58.getAttribute("aria-pressed"), "false", `${classId}: Skill 58 cannot unlock with one required skill missing`);
      await unlock(page, classId, "skill61", audit.adjacency);
      assert((await skill58.getAttribute("class")).includes("is-available"), `${classId}: Skill 58 opens after all four requirements`);
      await unlock(page, classId, "skill58", audit.adjacency);
      for (const prerequisiteId of screenshotThreePrerequisites) {
        await deselectSkill(page, classId, prerequisiteId, audit.adjacency);
        assert.equal(await skill58.getAttribute("aria-pressed"), "false", `${classId}: removing ${prerequisiteId} invalidates Skill 58`);
        assert((await skill58.getAttribute("class")).includes("is-locked"), `${classId}: Skill 58 locks without ${prerequisiteId}`);
        await unlock(page, classId, prerequisiteId, audit.adjacency);
        await unlock(page, classId, "skill58", audit.adjacency);
      }

      await page.locator("#resetBuild").click();
      assert.equal(await page.locator("#skillTreeCanvas .skill-node.is-selected").count(), 1, `${classId}: Reset Build clears selected skills`);
      assert.equal(await page.locator("#characterClass").inputValue(), "archer", `${classId}: Reset Build returns to default class`);
    }

    await unlock(page, "archer", "skill2");
    const viewport = page.locator("#skillTreeViewport");
    await viewport.scrollIntoViewIfNeeded();
    const viewportBox = await viewport.boundingBox();
    const cursorX = viewportBox.x + viewportBox.width * 0.55;
    const cursorY = viewportBox.y + viewportBox.height * 0.5;
    const cameraScale = () =>
      page.locator("#skillTreeCanvas").evaluate((canvas) => new DOMMatrixReadOnly(getComputedStyle(canvas).transform).a);
    const scaleBeforeZoom = await cameraScale();
    const selectedBeforeResetView = await page.locator("#skillTreeCanvas .skill-node.is-selected").count();
    const projectileBeforeResetView = await page.evaluate(
      () => [...document.querySelectorAll("#statsGroups li")].find((row) => row.querySelector("span")?.textContent.trim() === "Projectile Damage")?.querySelector("strong")?.textContent
    );
    await page.mouse.move(cursorX, cursorY);
    await page.mouse.wheel(0, -120);
    assert((await cameraScale()) > scaleBeforeZoom, "mouse wheel zooms in");
    await page.locator("[data-reset-view]").click();
    assert.equal(await page.locator("#skillTreeCanvas .skill-node.is-selected").count(), selectedBeforeResetView);
    assert.equal(
      await page.evaluate(
        () => [...document.querySelectorAll("#statsGroups li")].find((row) => row.querySelector("span")?.textContent.trim() === "Projectile Damage")?.querySelector("strong")?.textContent
      ),
      projectileBeforeResetView,
      "Reset View preserves skill buffs"
    );

    console.log(
      JSON.stringify(
        {
          graphAudit: "passed",
          screenshotTwoAlternativePaths: "passed",
          screenshotThreeAllPrerequisites: "passed",
          dependentRemoval: "passed",
          resetViewPreservesBuild: "passed",
          classes: classIds,
          nodeCount: audit.nodeCount,
          result: "passed"
        },
        null,
        2
      )
    );
  } finally {
    if (session?.context) await session.context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
