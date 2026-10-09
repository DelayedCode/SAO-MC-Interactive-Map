"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const classIds = ["archer", "assassin", "guerrier", "mage", "shaman"];
/* The four nodes the shared layout flags as special: each one needs all four surrounding skills. */
const specialSkillIds = ["skill4", "skill8", "skill51", "skill52"];
/* The node whose requirement is narrower than its connections: the graph also draws its edge to the
   skill 52 box, and skill 52 needs skill 58 back, so skill 58 needs exactly the four skills its rows
   document instead of every skill wired to it. */
const skill58RequiredSkillIds = ["skill49", "skill50", "skill61", "skill66"];
/* The reference screenshots: skill 45 is reachable from skill 2 (the route it was designed with) and
   from skill 39 through the other visible connection. Centre -> skill 2 -> skill 3 -> skill 39 is a
   chain a visitor can walk, so the alternate route can be checked through the interface. */
const routeTarget = "skill45";
const routeFromDocumentedParent = "skill2";
const routeFromOtherConnection = "skill39";
const routeChain = ["skill2", "skill3", "skill39"];

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

function readNodeState(className) {
  if (className.includes("is-selected")) return "selected";
  if (className.includes("is-available")) return "available";
  return "locked";
}

function skillButton(page, classId, skillId) {
  return page.locator(`#skillTreeCanvas [data-skill-id="${classId}-${skillId}"]`);
}

async function skillState(page, classId, skillId) {
  return readNodeState(await skillButton(page, classId, skillId).getAttribute("class"));
}

async function setUnlimitedSkillPoints(page, enabled) {
  const toggle = page.locator("[data-unlimited-skill-points]");
  if (enabled) await toggle.check();
  else await toggle.uncheck();
  assert.equal(await toggle.isChecked(), enabled, "the unlimited skill points toggle follows the request");
}

function selectedSkillIds(page, classId) {
  return page
    .locator("#skillTreeCanvas .skill-node.is-selected")
    .evaluateAll((nodes, prefix) => nodes.map((node) => node.dataset.skillId.replace(`${prefix}-`, "")), classId);
}

/* The build the page must keep: skills whose routes are gone are dropped, and a node that needs every
   prerequisite additionally needs all of the skills it lists. */
function pruneExpectedSelection(selected, adjacency, allPrerequisites) {
  const result = new Set(selected);
  let removed;
  do {
    removed = false;
    for (const skillId of result) {
      if (skillId === "skill1") continue;
      const required = allPrerequisites[skillId];
      const valid = required
        ? required.every((id) => result.has(id))
        : adjacency[skillId].some((id) => result.has(id));
      if (!valid) {
        result.delete(skillId);
        removed = true;
      }
    }
  } while (removed);
  return result;
}

async function assertRenderedStates(page, classId, selected, adjacency, allPrerequisites) {
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
    const required = allPrerequisites[node.id];
    const isAvailable = required
      ? required.every((id) => selectedWithRoot.has(id))
      : adjacency[node.id].some((id) => selectedWithRoot.has(id));
    assert.equal(node.selected, isSelected, `${classId} ${node.id}: selected state matches the model`);
    assert.equal(node.available, !isSelected && isAvailable, `${classId} ${node.id}: availability matches the model`);
    assert.equal(node.locked, !isSelected && !isAvailable, `${classId} ${node.id}: lock state matches the model`);
  }
}

async function assertCurrentModel(page, classId, adjacency, allPrerequisites) {
  const selected = new Set(await selectedSkillIds(page, classId));
  const normalized = pruneExpectedSelection(selected, adjacency, allPrerequisites);
  assert.deepEqual(sorted([...selected]), sorted([...normalized]), `${classId}: no invalid selections remain`);
  await assertRenderedStates(page, classId, selected, adjacency, allPrerequisites);
}

async function switchToClass(page, classId) {
  await page.locator("#characterClass").selectOption(classId);
  assert.equal(await page.locator("#skillTreeCanvas .skill-node").count(), 77, `${classId}: 77 rendered nodes`);
  assert.equal(
    await page.locator("#skillTreeCanvas .skill-node.is-selected").count(),
    1,
    `${classId}: selections do not leak across classes`
  );
  return page.locator("#skillTreeCanvas .skill-node").evaluateAll((nodes) =>
    nodes.map((node) => ({
      skillId: node.dataset.skillId.replace(/^[^-]+-/, ""),
      x: node.style.getPropertyValue("--node-x"),
      y: node.style.getPropertyValue("--node-y")
    }))
  );
}

/* Shortest route from the centre to a skill through the connection graph, ignoring blocked skills. */
function routeThroughTree(targetSkillId, adjacency, blockedSkillIds = []) {
  const blocked = new Set(blockedSkillIds);
  const previous = new Map([["skill1", null]]);
  const queue = ["skill1"];
  while (queue.length) {
    const current = queue.shift();
    for (const neighbour of adjacency[current]) {
      if (previous.has(neighbour) || blocked.has(neighbour)) continue;
      previous.set(neighbour, current);
      queue.push(neighbour);
    }
  }
  if (!previous.has(targetSkillId)) return null;
  const path = [];
  for (let step = targetSkillId; step && step !== "skill1"; step = previous.get(step)) path.unshift(step);
  return path;
}

async function unlockSkill(page, classId, skillId) {
  assert.equal(await skillState(page, classId, skillId), "available", `${classId} ${skillId}: available`);
  await skillButton(page, classId, skillId).click();
  assert.equal(await skillState(page, classId, skillId), "selected", `${classId} ${skillId}: unlocked`);
}

/* Unlocks a skill the way a visitor has to: a skill that needs every prerequisite unlocks those
   first, and every other skill is reached by walking the tree one step at a time. Routes never pass
   through a skill that needs every prerequisite, so every step is available when it is clicked. */
async function unlockWithPrerequisites(page, classId, skillId, adjacency, allPrerequisites) {
  const required = allPrerequisites[skillId];
  if (required) {
    for (const requiredId of required) {
      if ((await skillState(page, classId, requiredId)) === "selected") continue;
      await unlockWithPrerequisites(page, classId, requiredId, adjacency, allPrerequisites);
    }
    assert.equal(
      await skillState(page, classId, skillId),
      "available",
      `${classId} ${skillId}: available once all of its prerequisites are unlocked`
    );
    await skillButton(page, classId, skillId).click();
    assert.equal(
      await skillState(page, classId, skillId),
      "selected",
      `${classId} ${skillId}: unlocked once all of its prerequisites are unlocked`
    );
    return;
  }
  const path = routeThroughTree(skillId, adjacency, Object.keys(allPrerequisites));
  assert.ok(path, `${classId} ${skillId}: a route through the tree exists`);
  for (const step of path) {
    if ((await skillState(page, classId, step)) === "selected") continue;
    assert.equal(await skillState(page, classId, step), "available", `${classId} ${step}: available on the route`);
    await skillButton(page, classId, step).click();
    assert.equal(await skillState(page, classId, step), "selected", `${classId} ${step}: unlocked through the route`);
  }
}

async function deselectSkill(page, classId, skillId) {
  assert.equal(await skillState(page, classId, skillId), "selected", `${classId} ${skillId}: is selected`);
  await skillButton(page, classId, skillId).click();
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
      const neighbours = new Map(data.SKILL_TREE_LAYOUT.map((point) => [point.skillId, new Set()]));
      data.SKILL_TREE_CONNECTIONS.forEach(([from, to]) => {
        neighbours.get(skillByPoint.get(from)).add(skillByPoint.get(to));
        neighbours.get(skillByPoint.get(to)).add(skillByPoint.get(from));
      });
      const errors = [];
      for (const classId of classes) {
        const keys = Object.keys(data.CLASS_SKILLS[classId]).sort();
        if (keys.length !== 77) errors.push(`${classId}: expected 77 skills, found ${keys.length}`);
      }
      return {
        nodeCount: data.SKILL_TREE_LAYOUT.length,
        connectionCount: data.SKILL_TREE_CONNECTIONS.length,
        specialSkillIds: data.SKILL_TREE_LAYOUT.filter((point) => point.special).map((point) => point.skillId),
        /* The nodes that need every prerequisite: the four flagged special need all of their
           neighbours, and the skills listed in the data need exactly the skills listed there. */
        allPrerequisites: Object.fromEntries([
          ...data.SKILL_TREE_LAYOUT.filter((point) => point.special).map((point) => [
            point.skillId,
            [...neighbours.get(point.skillId)]
          ]),
          ...Object.entries(data.SKILL_TREE_ALL_PREREQUISITES || {}).map(([skillId, ids]) => [skillId, [...ids]])
        ]),
        explicitAllPrerequisiteSkillIds: Object.keys(data.SKILL_TREE_ALL_PREREQUISITES || {}),
        adjacency: Object.fromEntries([...neighbours].map(([skillId, adjacent]) => [skillId, [...adjacent]])),
        layout: data.SKILL_TREE_LAYOUT.map((point) => ({
          skillId: point.skillId,
          x: `${point.x}px`,
          y: `${point.y}px`
        })),
        errors
      };
    }, classIds);

    assert.equal(audit.nodeCount, 77, "the shared layout holds 77 nodes");
    assert.equal(audit.connectionCount, 100, "the shared layout holds 100 connections");
    assert.deepEqual(sorted(audit.specialSkillIds), sorted(specialSkillIds), "the four special nodes are configured");
    specialSkillIds.forEach((skillId) =>
      assert.equal(audit.adjacency[skillId].length, 4, `${skillId}: exactly four surrounding skills`)
    );
    assert.deepEqual(
      sorted(Object.keys(audit.allPrerequisites)),
      sorted([...specialSkillIds, ...audit.explicitAllPrerequisiteSkillIds]),
      "only the documented nodes need every prerequisite"
    );
    specialSkillIds.forEach((skillId) =>
      assert.deepEqual(
        sorted(audit.allPrerequisites[skillId]),
        sorted(audit.adjacency[skillId]),
        `${skillId}: needs all four of its surrounding skills`
      )
    );
    assert.deepEqual(
      sorted(audit.explicitAllPrerequisiteSkillIds),
      ["skill58"],
      "skill 58 is the node whose requirement is narrower than its connections"
    );
    assert.deepEqual(
      sorted(audit.allPrerequisites.skill58),
      sorted(skill58RequiredSkillIds),
      "skill 58 needs the four skills its rows document"
    );
    assert.ok(
      !audit.allPrerequisites.skill58.includes("skill52"),
      "skill 58 must not require the skill 52 box, which requires skill 58 back"
    );
    assert.ok(
      audit.adjacency.skill58.includes("skill52"),
      "the drawn connection to the skill 52 box is still there"
    );
    assert.equal(audit.adjacency.skill1.length, 4, "root adjacency comes from the visual connections");
    assert.deepEqual(audit.errors, [], "every class still lists 77 skills");

    /* The level-based pool has its own test file; it must not interfere with the routing checks. */
    await setUnlimitedSkillPoints(page, true);

    let sharedRenderedLayout;
    for (const classId of classIds) {
      const renderedLayout = await switchToClass(page, classId);
      assert.deepEqual(renderedLayout, audit.layout, `${classId}: rendered coordinates match the shared layout`);
      if (sharedRenderedLayout)
        assert.deepEqual(renderedLayout, sharedRenderedLayout, `${classId}: same rendered layout`);
      sharedRenderedLayout = renderedLayout;
      await assertCurrentModel(page, classId, audit.adjacency, audit.allPrerequisites);

      /* A locked skill cannot be unlocked by clicking it, however close its routes are. */
      assert.equal(await skillState(page, classId, routeTarget), "locked", `${classId} ${routeTarget}: starts locked`);
      await skillButton(page, classId, routeTarget).click();
      assert.equal(
        await skillState(page, classId, routeTarget),
        "locked",
        `${classId} ${routeTarget}: locked skills ignore clicks`
      );

      /* The route the skill was designed with works ... */
      await unlockSkill(page, classId, routeFromDocumentedParent);
      assert.equal(
        await skillState(page, classId, routeTarget),
        "available",
        `${classId} ${routeTarget}: reachable through its documented route`
      );

      /* ... and so does the other visible connection, even without the documented one. */
      await page.locator("#resetBuild").click();
      if (classId !== "archer") await switchToClass(page, classId);
      for (const step of routeChain) await unlockSkill(page, classId, step);
      assert.equal(
        await skillState(page, classId, routeFromOtherConnection),
        "selected",
        `${classId} ${routeFromOtherConnection}: the other connection is unlocked`
      );
      assert.equal(
        await skillState(page, classId, routeTarget),
        "available",
        `${classId} ${routeTarget}: reachable through the other connection`
      );
      await deselectSkill(page, classId, routeFromDocumentedParent);
      await assertCurrentModel(page, classId, audit.adjacency, audit.allPrerequisites);
      assert.equal(
        await skillState(page, classId, routeTarget),
        "available",
        `${classId} ${routeTarget}: the remaining route still works`
      );
      await unlockSkill(page, classId, routeTarget);
      assert.equal(await skillState(page, classId, routeTarget), "selected", `${classId} ${routeTarget}: unlocked`);

      /* Removing a skill removes the skills that were unlocked through it. */
      await page.locator("#resetBuild").click();
      if (classId !== "archer") await switchToClass(page, classId);
      await unlockSkill(page, classId, "skill6");
      await unlockSkill(page, classId, "skill7");
      await unlockSkill(page, classId, "skill26");
      await deselectSkill(page, classId, "skill7");
      await assertCurrentModel(page, classId, audit.adjacency, audit.allPrerequisites);
      assert.equal(await skillState(page, classId, "skill26"), "locked", `${classId} skill26: removed with its route`);

      await page.locator("#resetBuild").click();
      assert.equal(
        await page.locator("#skillTreeCanvas .skill-node.is-selected").count(),
        1,
        `${classId}: Reset Build clears selected skills`
      );
      assert.equal(
        await page.locator("#characterClass").inputValue(),
        "archer",
        `${classId}: Reset Build restores the default class`
      );
    }

    /* Each of the four special skills needs all four surrounding skills, and three is not enough. */
    const specialSummary = {};
    for (const specialId of specialSkillIds) {
      await page.locator("#resetBuild").click();
      const surrounding = audit.adjacency[specialId];
      /* Deselecting one surrounding skill can also drop the skills that were reached through it, so
         the four surrounding skills are unlocked again as a set. */
      const unlockSurroundingSkills = async () => {
        for (const surroundingId of surrounding) {
          if ((await skillState(page, "archer", surroundingId)) === "selected") continue;
          await unlockWithPrerequisites(page, "archer", surroundingId, audit.adjacency, audit.allPrerequisites);
        }
      };
      await unlockSurroundingSkills();
      await assertCurrentModel(page, "archer", audit.adjacency, audit.allPrerequisites);
      assert.equal(
        await skillState(page, "archer", specialId),
        "available",
        `${specialId}: available with all four surrounding skills`
      );
      const removedSkillId = surrounding[0];
      await deselectSkill(page, "archer", removedSkillId);
      await assertCurrentModel(page, "archer", audit.adjacency, audit.allPrerequisites);
      assert.equal(
        await skillState(page, "archer", specialId),
        "locked",
        `${specialId}: locked with only three of its four surrounding skills`
      );
      await unlockSurroundingSkills();
      assert.equal(await skillState(page, "archer", specialId), "available", `${specialId}: available again`);
      await unlockSkill(page, "archer", specialId);
      specialSummary[specialId] = { surroundingSkills: surrounding.length, result: "passed" };
    }

    /* Skill 58 needs all four of the skills its rows document, and three of the four is not enough.
       The nodes that need every prerequisite are kept out of the routes, so each prerequisite is
       reached by walking the tree one step at a time. */
    const everyPrerequisiteBlockedSkillIds = [...specialSkillIds, "skill58"];
    const unlockSkill58Prerequisites = async () => {
      for (const requiredId of audit.allPrerequisites.skill58) {
        if ((await skillState(page, "archer", requiredId)) === "selected") continue;
        await unlockWithPrerequisites(page, "archer", requiredId, audit.adjacency, audit.allPrerequisites);
      }
    };
    const skill58Cases = [];
    await page.locator("#resetBuild").click();
    await unlockSkill58Prerequisites();
    await assertCurrentModel(page, "archer", audit.adjacency, audit.allPrerequisites);
    assert.equal(
      await skillState(page, "archer", "skill58"),
      "available",
      "skill58: available with all four of its prerequisites"
    );
    for (const missingId of audit.allPrerequisites.skill58) {
      /* Dropping a prerequisite also drops the skills reached through it, so the set is rebuilt. */
      await deselectSkill(page, "archer", missingId);
      await assertCurrentModel(page, "archer", audit.adjacency, audit.allPrerequisites);
      assert.equal(await skillState(page, "archer", "skill58"), "locked", `skill58: locked without ${missingId}`);
      await skillButton(page, "archer", "skill58").click();
      assert.equal(
        await skillState(page, "archer", "skill58"),
        "locked",
        `skill58: a click cannot skip the missing ${missingId}`
      );
      await unlockSkill58Prerequisites();
      assert.equal(
        await skillState(page, "archer", "skill58"),
        "available",
        `skill58: available again once ${missingId} is back`
      );
      skill58Cases.push(missingId);
    }
    await unlockSkill(page, "archer", "skill58");
    assert.equal(await skillState(page, "archer", "skill58"), "selected", "skill58: unlocked with all four");

    /* Direct adjacency: an unlocked skill only opens the skills wired to it, so a node several steps
       away stays locked until its own route is walked one step at a time. */
    const farNodeId = "skill77";
    const farNodeRoute = routeThroughTree(farNodeId, audit.adjacency, everyPrerequisiteBlockedSkillIds);
    assert.ok(farNodeRoute && farNodeRoute.length >= 3, "skill77 sits several steps away from the centre");
    assert.ok(!audit.adjacency[farNodeId].includes("skill2"), "skill77 is not wired to the centre's neighbour");
    await page.locator("#resetBuild").click();
    await unlockSkill(page, "archer", "skill2");
    assert.equal(
      await skillState(page, "archer", farNodeId),
      "locked",
      "skill77: an unlocked skill it is not wired to does not open it"
    );
    await skillButton(page, "archer", farNodeId).click();
    assert.equal(await skillState(page, "archer", farNodeId), "locked", "skill77: a click cannot skip the steps");
    await unlockWithPrerequisites(page, "archer", farNodeId, audit.adjacency, audit.allPrerequisites);
    assert.equal(await skillState(page, "archer", farNodeId), "selected", "skill77: reachable one step at a time");

    /* Dragging pans the tree from anywhere, never unlocks by accident, and reaches past the old box. */
    await page.locator("#resetBuild").click();
    const viewport = page.locator("#skillTreeViewport");
    await viewport.scrollIntoViewIfNeeded();
    const canvasView = () =>
      page.locator("#skillTreeCanvas").evaluate((canvas) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(canvas).transform);
        return { x: matrix.e, y: matrix.f, scale: matrix.a };
      });
    const dragBy = async (fromX, fromY, deltaX, deltaY) => {
      await page.mouse.move(fromX, fromY);
      await page.mouse.down();
      await page.mouse.move(fromX + deltaX, fromY + deltaY, { steps: 8 });
      await page.mouse.up();
    };
    const statValue = () =>
      page.evaluate(
        () =>
          [...document.querySelectorAll("#statsGroups li")]
            .find((row) => row.querySelector("span")?.textContent.trim() === "Projectile Damage")
            ?.querySelector("strong")?.textContent
      );
    const viewportBox = await viewport.boundingBox();
    const fitted = await canvasView();
    await dragBy(viewportBox.x + viewportBox.width * 0.2, viewportBox.y + viewportBox.height * 0.2, 120, 90);
    const dragged = await canvasView();
    assert.ok(
      Math.abs(dragged.x - fitted.x - 120) < 6 && Math.abs(dragged.y - fitted.y - 90) < 6,
      `dragging moves the tree with the pointer (${fitted.x.toFixed(0)},${fitted.y.toFixed(0)} -> ${dragged.x.toFixed(0)},${dragged.y.toFixed(0)})`
    );
    const oldMaximumX = Math.max(0, viewportBox.width - 921 * dragged.scale);
    await dragBy(viewportBox.x + viewportBox.width * 0.5, viewportBox.y + viewportBox.height * 0.5, 240, 0);
    const farDrag = await canvasView();
    assert.ok(
      farDrag.x > oldMaximumX + 1,
      `the tree can be dragged past the old viewport box (${farDrag.x.toFixed(0)}px > ${oldMaximumX.toFixed(0)}px)`
    );

    await page.locator("[data-reset-view]").click();
    const lockedSkillId = "skill12";
    assert.equal(await skillState(page, "archer", lockedSkillId), "locked", `${lockedSkillId}: starts locked`);
    const lockedSkillBox = await skillButton(page, "archer", lockedSkillId).boundingBox();
    await dragBy(lockedSkillBox.x + lockedSkillBox.width / 2, lockedSkillBox.y + lockedSkillBox.height / 2, 90, 60);
    assert.equal(
      await skillState(page, "archer", lockedSkillId),
      "locked",
      `${lockedSkillId}: dragging over it does not unlock it`
    );

    await unlockSkill(page, "archer", "skill6");
    const statBeforeResetView = await statValue();
    const selectedBeforeResetView = await page.locator("#skillTreeCanvas .skill-node.is-selected").count();
    await page.locator("[data-reset-view]").click();
    const refitted = await canvasView();
    assert.ok(
      Math.abs(refitted.x - fitted.x) < 1 && Math.abs(refitted.y - fitted.y) < 1,
      "Reset View restores the fitted view"
    );
    assert.equal(
      await page.locator("#skillTreeCanvas .skill-node.is-selected").count(),
      selectedBeforeResetView,
      "Reset View keeps the build"
    );
    assert.equal(await statValue(), statBeforeResetView, "Reset View keeps the skill effects");

    console.log(
      JSON.stringify(
        {
          graphAudit: "passed",
          alternateRoutes: "passed",
          lockedSkillsIgnoreClicks: "passed",
          directAdjacency: "passed",
          noSkippingLockedSteps: farNodeId,
          dependentRemoval: "passed",
          specialSkillsNeedAllFour: specialSummary,
          skill58NeedsAllFour: {
            requiredSkills: audit.allPrerequisites.skill58,
            lockedWithoutEach: skill58Cases,
            result: "passed"
          },
          dragBeyondOldBounds: "passed",
          dragDoesNotUnlock: "passed",
          clickStillUnlocks: "passed",
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
