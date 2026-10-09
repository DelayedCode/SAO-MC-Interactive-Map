"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
/* Centre -> skill 2, and centre -> skill 6 -> skill 7 -> skill 26 is a chain a visitor can walk. */
const reachableChain = ["skill2", "skill6", "skill7", "skill26"];

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

function readNodeState(className) {
  if (className.includes("is-selected")) return "selected";
  if (className.includes("is-available")) return "available";
  return "locked";
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  let session;
  try {
    session = await openBuilder(browser);
    const { page } = session;
    const button = (skillId) => page.locator(`#skillTreeCanvas [data-skill-id="archer-${skillId}"]`);
    const state = async (skillId) => readNodeState(await button(skillId).getAttribute("class"));
    const pointsLabel = () => page.locator("[data-skill-points]").textContent();
    const skillDetail = () => page.locator("#skillDetail").textContent();
    const selectedCount = () => page.locator("#skillTreeCanvas .skill-node.is-selected").count();
    const levelValue = () => page.locator("#characterLevel").inputValue();
    const setLevel = async (level) => {
      await page.locator("#characterLevel").fill(String(level));
      await page.evaluate(() =>
        document.getElementById("characterLevel").dispatchEvent(new Event("input", { bubbles: true }))
      );
    };
    const toggleUnlimited = async (enabled) => {
      const toggle = page.locator("[data-unlimited-skill-points]");
      if (enabled) await toggle.check();
      else await toggle.uncheck();
      assert.equal(await toggle.isChecked(), enabled, "the unlimited skill points toggle follows the request");
    };
    const unlock = async (skillId) => {
      assert.equal(await state(skillId), "available", `${skillId}: available`);
      await button(skillId).click();
      assert.equal(await state(skillId), "selected", `${skillId}: unlocked`);
    };

    /* Level 1 is the level a character starts at, so the tree grants no points yet. */
    assert.equal(await levelValue(), "1", "the default level is 1");
    assert.ok(
      (await pointsLabel()).includes("0 / 0 skill points"),
      `level 1 grants no points (${await pointsLabel()})`
    );
    assert.equal(await state(reachableChain[0]), "locked", "the first skill waits for points");
    await button(reachableChain[0]).click();
    assert.equal(await state(reachableChain[0]), "locked", "a skill cannot be unlocked without points");
    assert.ok((await skillDetail()).includes("skill point"), "the skill detail explains the missing points");

    /* The level decides the pool: level 3 grants two points. */
    await setLevel(3);
    assert.ok(
      (await pointsLabel()).includes("2 / 2 skill points"),
      `level 3 grants two points (${await pointsLabel()})`
    );
    await unlock(reachableChain[0]);
    assert.ok((await pointsLabel()).includes("1 / 2 skill points"), "unlocking a skill spends a point");
    await unlock(reachableChain[1]);
    assert.ok((await pointsLabel()).includes("0 / 2 skill points"), "the pool runs out after two skills");
    assert.equal(await selectedCount(), 3, "the centre plus exactly the available two skills are unlocked");
    assert.equal(await state(reachableChain[2]), "locked", "the next skill waits for points");
    await button(reachableChain[2]).click();
    assert.equal(await state(reachableChain[2]), "locked", "no more points can be spent");
    assert.ok((await skillDetail()).includes("more skill point"), "the skill detail asks for the missing points");

    /* The testing toggle ignores the pool without touching the level. */
    await toggleUnlimited(true);
    assert.equal(await levelValue(), "3", "the unlimited toggle leaves the level alone");
    assert.ok(
      (await pointsLabel()).includes("2 spent"),
      `the label reports the unlimited state (${await pointsLabel()})`
    );
    assert.ok((await pointsLabel()).includes("Unlimited skill points"), "the label marks the unlimited state");
    await unlock(reachableChain[2]);
    await unlock(reachableChain[3]);
    assert.ok((await pointsLabel()).includes("4 spent"), "unlimited purchases keep counting the points spent");
    assert.equal(await selectedCount(), 5, "skills beyond the level pool can be unlocked while unlimited");

    /* Switching it off restores the level-based restrictions. */
    await toggleUnlimited(false);
    assert.ok((await pointsLabel()).includes("0 / 2 skill points"), "the level pool applies again");
    assert.equal(await selectedCount(), 3, "skills beyond the pool are removed again");
    assert.equal(await state(reachableChain[2]), "locked", "the skill beyond the pool is locked again");
    assert.equal(await state(reachableChain[0]), "selected", "the earliest unlocked skills are kept");
    assert.equal(await state(reachableChain[1]), "selected", "the earliest unlocked skills are kept");

    /* Lowering the level drops the skills that no longer fit. */
    await setLevel(2);
    assert.ok(
      (await pointsLabel()).includes("0 / 1 skill points"),
      `level 2 grants one point (${await pointsLabel()})`
    );
    assert.equal(await selectedCount(), 2, "only one skill fits the smaller pool");
    assert.equal(await state(reachableChain[1]), "locked", "the skill that no longer fits is locked again");

    /* Raising it again offers the larger pool. */
    await setLevel(25);
    assert.ok(
      (await pointsLabel()).includes("23 / 24 skill points"),
      `level 25 grants twenty-four points (${await pointsLabel()})`
    );

    await page.locator("#resetBuild").click();
    assert.equal(await levelValue(), "1", "Reset Build returns to level 1");
    assert.ok((await pointsLabel()).includes("0 / 0 skill points"), "Reset Build clears the spent points");
    assert.equal(await selectedCount(), 1, "Reset Build clears the skills");

    /* The pool is the character level minus one, so level 7 holds six points. */
    const spentPoints = async () => {
      const label = await pointsLabel();
      const ratio = label.match(/(\d+)\s*\/\s*(\d+)/);
      if (ratio) return Number(ratio[2]) - Number(ratio[1]);
      return Number((label.match(/(\d+) spent/) || [])[1]);
    };
    const unlockedSkillCount = async () => (await selectedCount()) - 1; /* the centre is free */
    await setLevel(7);
    assert.ok(
      (await pointsLabel()).includes("6 / 6 skill points"),
      `level 7 grants six points (${await pointsLabel()})`
    );

    /* Every unlocked skill is charged exactly once, and deselecting one returns its point. */
    for (const skillId of ["skill2", "skill6", "skill7"]) await unlock(skillId);
    assert.equal(await spentPoints(), 3, "three unlocked skills cost three points");
    assert.equal(await spentPoints(), await unlockedSkillCount(), "the spent total matches the build");
    await button("skill7").click();
    assert.equal(await spentPoints(), 2, "deselecting a skill returns its point");
    assert.equal(await spentPoints(), await unlockedSkillCount(), "the spent total still matches the build");
    await unlock("skill7");
    assert.equal(await spentPoints(), 3, "unlocking it again costs exactly one point");
    assert.equal(await spentPoints(), await unlockedSkillCount(), "no skill is ever charged twice");

    /* The testing toggle ignores the pool only: prerequisites still apply at level 1. */
    await page.locator("#resetBuild").click();
    await toggleUnlimited(true);
    assert.equal(await state("skill26"), "locked", "skill26 waits for its route");
    await button("skill26").click();
    assert.equal(await state("skill26"), "locked", "unlimited points never bypass prerequisites");
    assert.ok((await skillDetail()).includes("Requires"), "the detail explains the missing prerequisite");
    await unlock("skill6");
    await unlock("skill7");
    assert.equal(await state("skill26"), "available", "the route opens it while unlimited");
    await unlock("skill26");
    assert.ok((await pointsLabel()).includes("3 spent"), `unlimited spending keeps counting (${await pointsLabel()})`);
    await toggleUnlimited(false);
    assert.ok((await pointsLabel()).includes("0 / 0 skill points"), "the level pool applies again");
    assert.equal(await selectedCount(), 1, "skills beyond the pool are removed again");

    console.log(
      JSON.stringify(
        {
          levelPool: "passed",
          levelSevenPool: "passed",
          cannotOverspend: "passed",
          spendingDecreasesPool: "passed",
          singleChargePerSkill: "passed",
          unlimitedToggle: "passed",
          unlimitedKeepsPrerequisites: "passed",
          disablingRestoresLimit: "passed",
          loweringLevelPrunesBuild: "passed",
          levelUntouchedByToggle: "passed",
          chain: reachableChain,
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
