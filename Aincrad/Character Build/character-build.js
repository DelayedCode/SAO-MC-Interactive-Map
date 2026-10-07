(function () {
  "use strict";

  const data = window.CharacterBuildData;
  const adapter = window.CharacterBuildAdapter;
  const calculator = window.CharacterBuildCalculator;
  const i18n = window.SAOI18n || null;
  const walkthroughStorageKey = "sao.walkthrough.characterBuild.completed";
  let walkthroughController = null;
  let walkthroughOpenedDialog = false;
  const fallbackLabels = {
    "page.characterBuild.emptySlot": "Empty slot",
    "page.characterBuild.allRarities": "All rarities",
    "page.characterBuild.select": "Select",
    "page.characterBuild.rune": "Rune",
    "page.characterBuild.alreadyUnlocked": "Already unlocked",
    "page.characterBuild.readyToUnlock": "Ready to unlock",
    "page.characterBuild.none": "None",
    "page.characterBuild.prototypeTree": "Prototype tree",
    "page.characterBuild.prototypeDataOnly": "Prototype data only"
  };
  const t = (key, params) => {
    const template = i18n ? i18n.t(key, params) : fallbackLabels[key] || key;
    return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, token) =>
      params && Object.prototype.hasOwnProperty.call(params, token) ? String(params[token]) : `{${token}}`
    );
  };
  const content = (key, fallback, params) =>
    i18n && typeof i18n.content === "function" ? i18n.content(key, fallback, params) : fallback;
  function dataKey(value) {
    const key = String(value || "")
      .replace(/[^a-zA-Z0-9]+(.)/g, (_match, character) => character.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");
    return key ? key.charAt(0).toLowerCase() + key.slice(1) : "";
  }
  function localizeClass(classId, fallback) {
    return t(`page.characterBuild.classes.${classId}`, null) === `page.characterBuild.classes.${classId}`
      ? fallback
      : t(`page.characterBuild.classes.${classId}`);
  }
  function localizeSlot(slot) {
    const key = `page.characterBuild.slotNames.${slot.id}`;
    return t(key, null) === key ? slot.name : t(key);
  }
  function localizeStat(stat) {
    const key = `page.characterBuild.statNames.${dataKey(stat)}`;
    return t(key, null) === key ? stat : t(key);
  }
  function localizeGroup(group) {
    const key = `page.characterBuild.groupNames.${dataKey(group)}`;
    return t(key, null) === key ? group : t(key);
  }
  function localizeClassLabel(label) {
    const normalized = String(label || "").toLowerCase();
    const classId = normalized === "warrior" || normalized === "guerrier" ? "guerrier" : normalized;
    return t(`page.characterBuild.classes.${classId}`, null) === `page.characterBuild.classes.${classId}`
      ? label
      : localizeClass(classId, label).split(" /")[0];
  }
  function localizeRarity(rarity) {
    return window.SAOContentTranslations?.translateKnownTerms?.(rarity, i18n?.getLanguage?.()) || rarity;
  }
  function localizeItemEffect(effect) {
    const match = String(effect || "").match(/^([^:]+):\s*(.*)$/);
    if (!match) return String(effect || "");
    const language = i18n?.getLanguage?.() || "en";
    const translate = (value) => window.SAOContentTranslations?.translateKnownTerms?.(value, language) || value;
    const statLabel = localizeStat(match[1]);
    return `${statLabel === match[1] ? translate(match[1]) : statLabel}: ${translate(match[2])}`;
  }
  function registerCharacterBuildTranslations() {
    Object.entries(data.CLASS_SKILLS).forEach(([classId, skills]) => {
      Object.entries(skills).forEach(([skillId, skill]) => {
        window.SAOContentTranslations?.registerCharacterBuildNode?.(
          { ...skill, id: `${classId}-${skillId}`, branch: skillId === "skill1" ? "core" : "branch" },
          classId,
          skillId === "skill1" ? "core" : "branch"
        );
      });
    });
  }
  function localizeSkillName(node) {
    return content(`characterBuild.skill.${node.id}.name`, node.name);
  }
  function localizeSkillDescription(node) {
    return content(`characterBuild.skill.${node.id}.description`, node.description, { className: node.className });
  }
  const storage = window.SAOStorage || { getJSON: (_key, fallback) => fallback, setJSON() {} };
  /* The site-wide dataset default is "beta" (shared/sao-datasets.js getDataset falls back to it
     for a missing or invalid dataset). The "current" equipment dataset ships as an empty stub,
     so defaulting the builder to it left every slot picker with nothing to list on a first
     visit. Defaulting to the same dataset the rest of the site uses keeps the picker usable;
     the Source toggle still offers "current" for when that dataset is filled in. */
  const DEFAULT_SOURCE = "beta";
  const state = {
    source: DEFAULT_SOURCE,
    activeSlot: "1",
    level: 1,
    classId: data.classes[0].id,
    pickerSlot: null,
    pickerMode: "equipment",
    pickerArmorSlot: null,
    pickerRuneIndex: null,
    search: "",
    rarity: ""
  };
  const buildSlots = {
    1: { source: DEFAULT_SOURCE, level: 1, classId: data.classes[0].id, equipment: {}, runes: {}, selectedSkills: {} },
    2: { source: DEFAULT_SOURCE, level: 1, classId: data.classes[0].id, equipment: {}, runes: {}, selectedSkills: {} },
    3: { source: DEFAULT_SOURCE, level: 1, classId: data.classes[0].id, equipment: {}, runes: {}, selectedSkills: {} }
  };
  const buildStateKey = "sao.characterBuild.foundation";

  function $(id) {
    return document.getElementById(id);
  }
  function mountIcons() {
    document.querySelectorAll("[data-cb-icon]").forEach((element) => {
      element.innerHTML = window.CharacterBuildIcons.markup(element.dataset.cbIcon);
    });
  }
  const { escapeHtml } = window.SAOPageHelpers;
  function normalize(value) {
    return String(value || "").toLowerCase();
  }
  function activeBuild() {
    return buildSlots[state.activeSlot].equipment;
  }
  function activeSkillState() {
    return buildSlots[state.activeSlot];
  }
  function syncActiveConfiguration() {
    const active = activeSkillState();
    state.source = active.source;
    state.level = active.level;
    state.classId = active.classId;
  }
  function resetBuildState(build) {
    build.level = 1;
    build.classId = data.classes[0].id;
    build.equipment = {};
    build.runes = {};
    build.selectedSkills = {};
  }
  function restoreBuildState(target, saved) {
    if (!saved || typeof saved !== "object") return;
    target.source = saved.source === "current" ? "current" : DEFAULT_SOURCE;
    target.level = Math.min(25, Math.max(1, Number(saved.level) || 1));
    target.classId = data.classes.some((item) => item.id === saved.classId) ? saved.classId : target.classId;
    target.equipment = saved.equipment && typeof saved.equipment === "object" ? saved.equipment : {};
    target.runes = saved.runes && typeof saved.runes === "object" ? saved.runes : {};
    target.selectedSkills =
      saved.selectedSkills && typeof saved.selectedSkills === "object" ? saved.selectedSkills : {};
  }
  function slotById(slotId) {
    return data.slots.find((slot) => slot.id === slotId);
  }
  function skillNodeId(classId, skillId) {
    return `${classId}-${skillId}`;
  }
  function skillClassName(classId) {
    if (classId === "guerrier") return "Warrior";
    const selectedClass = data.classes.find((item) => item.id === classId);
    return selectedClass ? selectedClass.name.split(" /")[0].trim() : classId;
  }
  const skillNeighborsById = (() => {
    const skillByPointId = new Map(data.SKILL_TREE_LAYOUT.map((point) => [point.id, point.skillId]));
    const neighbors = new Map(data.SKILL_TREE_LAYOUT.map((point) => [point.skillId, new Set()]));
    data.SKILL_TREE_CONNECTIONS.forEach(([firstPointId, secondPointId]) => {
      const firstSkillId = skillByPointId.get(firstPointId);
      const secondSkillId = skillByPointId.get(secondPointId);
      neighbors.get(firstSkillId).add(secondSkillId);
      neighbors.get(secondSkillId).add(firstSkillId);
    });
    return new Map([...neighbors].map(([skillId, adjacentSkillIds]) => [skillId, [...adjacentSkillIds]]));
  })();
  function currentSkillTree() {
    const classSkills = data.CLASS_SKILLS[state.classId] || data.WARRIOR_SKILLS;
    return data.SKILL_TREE_LAYOUT.map((point) => {
      const config = classSkills[point.skillId];
      const center = point.skillId === "skill1";
      const skill58 = point.skillId === "skill58";
      const value = center ? null : config.statMode === "percent" ? `${config.amount}%` : config.amount;
      const prerequisiteSkillIds = center
        ? []
        : skill58
          ? config.prerequisites
          : skillNeighborsById.get(point.skillId);
      return {
        id: skillNodeId(state.classId, point.skillId),
        nodeId: point.skillId,
        layoutId: point.id,
        name: config.name,
        description: config.description,
        className: skillClassName(state.classId),
        ...(center ? {} : { stat: config.stat, amount: config.amount, statMode: config.statMode }),
        cost: center ? 0 : 1,
        prerequisiteMode: center || !skill58 ? "any" : "all",
        prerequisites: prerequisiteSkillIds.map((id) => skillNodeId(state.classId, id)),
        effects: center ? [] : [{ stat: config.stat, value }],
        x: point.x,
        y: point.y,
        branch: center ? "core" : "branch",
        center
      };
    });
  }
  function isSkillUnlocked(skillId) {
    return skillId === skillNodeId(state.classId, "skill1") || Boolean(activeSkillState().selectedSkills[skillId]);
  }
  function skillPrerequisitesSatisfied(node, selectedSkillIds = null) {
    if (!node.prerequisites.length) return true;
    const isSelected = (skillId) =>
      skillId === skillNodeId(state.classId, "skill1") ||
      (selectedSkillIds ? selectedSkillIds.has(skillId) : isSkillUnlocked(skillId));
    if (node.prerequisiteMode === "any") return node.prerequisites.some(isSelected);
    return node.prerequisites.every(isSelected);
  }
  function pruneInvalidSelectedSkills() {
    const build = activeSkillState();
    const selectedSkillIds = new Set(
      Object.keys(build.selectedSkills || {}).filter((skillId) => build.selectedSkills[skillId])
    );
    let removedInvalidSkill;
    do {
      removedInvalidSkill = false;
      currentSkillTree().forEach((node) => {
        if (node.center || !selectedSkillIds.has(node.id) || skillPrerequisitesSatisfied(node, selectedSkillIds)) return;
        selectedSkillIds.delete(node.id);
        removedInvalidSkill = true;
      });
    } while (removedInvalidSkill);
    build.selectedSkills = Object.fromEntries([...selectedSkillIds].map((skillId) => [skillId, true]));
  }
  function missingSkillPrerequisites(node) {
    if (skillPrerequisitesSatisfied(node)) return [];
    return node.prerequisites.filter((id) => !isSkillUnlocked(id));
  }
  function selectedSkillNodes() {
    return currentSkillTree().filter((node) => isSkillUnlocked(node.id));
  }
  function availableSkillPoints() {
    const skills = currentSkillTree();
    const total = skills.reduce((points, node) => points + node.cost, 0);
    const spent = skills.reduce((points, node) => points + (isSkillUnlocked(node.id) ? node.cost : 0), 0);
    return Math.max(0, total - spent);
  }
  function activeItems() {
    return adapter.getItems(state.source);
  }
  function activeRunes() {
    return adapter.getRunes(state.source);
  }
  const characterBuildScriptCache = new Set();
  function ensureEquipmentDataLoaded(source, onReady, onError) {
    const runtime = window.SAORuntimeUtils;
    if (!runtime || typeof runtime.loadTaggedScriptOnce !== "function") {
      onReady?.();
      return;
    }

    const dependencyMap = {
      current: ["../eCompendium/ecompendium_current.js"],
      beta: [
        "../eCompendium/ecompendium_floor1.js",
        "../eCompendium/ecompendium_floor2.js",
        "../eCompendium/ecompendium_floor3.js"
      ]
    };

    const scripts = dependencyMap[source] || [];
    if (!scripts.length) {
      onReady?.();
      return;
    }

    let remaining = scripts.length;
    let failed = false;
    if (remaining === 0) {
      onReady?.();
      return;
    }

    const finalize = (success) => {
      if (!success) failed = true;
      remaining -= 1;
      if (remaining <= 0) {
        if (failed) onError?.();
        else onReady?.();
      }
    };

    scripts.forEach((src) => {
      runtime.loadTaggedScriptOnce({
        cache: characterBuildScriptCache,
        cacheKey: src,
        tagAttribute: "data-character-build-dependency",
        src,
        onReady: () => finalize(true),
        onError: () => finalize(false)
      });
    });
  }
  function itemIsClassCompatible(item, classId = state.classId) {
    return adapter.isItemCompatibleWithClass(item, classId);
  }
  function slotItems() {
    return adapter.getItemsForSlot(state.source, state.pickerSlot, state.classId);
  }
  function iconForType(type) {
    return data.slots.find((slot) => slot.type === type)?.icon || data.slots[0].icon;
  }
  function displayText(item, field) {
    return adapter.getText(item, field) || "";
  }
  function rarityClass(rarity) {
    return rarity ? `rarity-${normalize(rarity).replace(/[^a-z0-9]+/g, "-")}` : "";
  }
  function className(classId) {
    const item = data.classes.find((candidate) => candidate.id === classId);
    return item ? localizeClass(classId, item.name).split(" /")[0] : classId;
  }

  function selectedRunesForSlot(slotId) {
    const runes = activeSkillState().runes || {};
    return Array.isArray(runes[slotId]) ? runes[slotId] : [];
  }

  function canonicalRune(rune) {
    if (!rune) return null;
    return activeRunes().find((candidate) => candidate.runeKey === rune.runeKey || candidate.id === rune.id) || null;
  }

  function calculationEquipment() {
    const equipment = { ...activeBuild() };
    Object.entries(activeBuild()).forEach(([slotId, item]) => {
      const capacity = adapter.getRuneSlots(item);
      if (!capacity) return;
      selectedRunesForSlot(slotId)
        .slice(0, capacity)
        .forEach((selected, index) => {
          const rune = canonicalRune(selected);
          if (!rune) return;
          equipment[`rune:${slotId}:${index}`] = Object.freeze({ ...rune, isBuildRune: true });
        });
    });
    return equipment;
  }

  function isCalculationItemAvailable(item, source, slotId) {
    if (item?.isBuildRune) return true;
    return adapter.isAvailable(item, source, slotId, state.classId);
  }

  function loadState() {
    const saved = storage.getJSON(buildStateKey, null);
    if (!saved || typeof saved !== "object") return;
    if (saved.builds && typeof saved.builds === "object") {
      Object.keys(buildSlots).forEach((slotId) => restoreBuildState(buildSlots[slotId], saved.builds[slotId]));
      state.activeSlot = Object.prototype.hasOwnProperty.call(buildSlots, saved.activeSlot) ? saved.activeSlot : "1";
    } else {
      restoreBuildState(buildSlots["1"], saved);
      state.activeSlot = "1";
    }
    syncActiveConfiguration();
    pruneInvalidSelectedSkills();
  }

  function saveState() {
    storage.setJSON(buildStateKey, {
      activeSlot: state.activeSlot,
      builds: buildSlots
    });
  }

  function renderConfiguration() {
    $("buildSlot").innerHTML = Object.keys(buildSlots)
      .map(
        (slotId) =>
          `<option value="${slotId}">${escapeHtml(t("page.characterBuild.buildNumber", { number: slotId }))}</option>`
      )
      .join("");
    $("buildSlot").value = state.activeSlot;
    $("characterLevel").value = state.level;
    $("levelValue").value = state.level;
    $("levelValue").textContent = state.level;
    const baseValue = document.querySelector(".base-value");
    if (baseValue) baseValue.textContent = t("page.characterBuild.base", { level: state.level });
    const slotCount = document.querySelector(".section-count");
    if (slotCount) slotCount.textContent = t("page.characterBuild.slots", { count: 14 });
    $("characterLevel").style.setProperty("--level-progress", `${((state.level - 1) / 24) * 100}%`);
    $("characterClass").innerHTML = data.classes
      .map((item) => `<option value="${item.id}">${escapeHtml(localizeClass(item.id, item.name))}</option>`)
      .join("");
    $("characterClass").value = state.classId;
    document
      .querySelectorAll("[data-source]")
      .forEach((button) => button.classList.toggle("is-active", button.dataset.source === state.source));
    $("skillClassLabel").textContent = `/ ${className(state.classId)}`;
  }

  function setLevelFromPointer(event) {
    const input = $("characterLevel");
    const bounds = input.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    input.value = String(Math.round(1 + progress * 24));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function renderSlots() {
    const groups = [
      { name: "armor", container: $("armorSlots"), matches: (slot) => slot.group === "armor" },
      {
        name: "accessory",
        container: $("accessorySlots"),
        matches: (slot) => slot.group === "accessory" && !["main-weapon", "offhand"].includes(slot.id)
      },
      { name: "weapon", container: $("weaponSlots"), matches: (slot) => ["main-weapon", "offhand"].includes(slot.id) }
    ];
    groups.forEach((group) => {
      group.container.innerHTML = data.slots
        .filter(group.matches)
        .map((slot) => {
          const item = activeBuild()[slot.id];
          const available = item && adapter.isAvailable(item, state.source, slot.id, state.classId);
          const itemLabel = item ? displayText(item, "name") || item.name : "";
          const rarity = item?.rarity
            ? `<span class="slot-empty ${rarityClass(item.rarity)}">${escapeHtml(localizeRarity(item.rarity))}</span>`
            : "";
          const runeControls =
            group.name === "armor" && item && available
              ? Array.from({ length: adapter.getRuneSlots(item) }, (_, index) => {
                  const rune = canonicalRune(selectedRunesForSlot(slot.id)[index]);
                  const slotLabel = localizeSlot(slot);
                  const label = rune
                    ? displayText(rune, "name") || rune.name
                    : t("page.characterBuild.selectRune", { slot: slotLabel, number: index + 1 });
                  return `<button class="rune-button${rune ? " is-filled" : ""}" type="button" data-rune-slot="${index}" data-armor-slot="${slot.id}" aria-label="${escapeHtml(t("page.characterBuild.selectRune", { slot: slotLabel, number: index + 1 }))}"><span>R${index + 1}</span><strong>${escapeHtml(label)}</strong></button>`;
                }).join("")
              : "";
          const slotLabel = localizeSlot(slot);
          return `<div class="equipment-slot-wrap"><button class="slot-button${item ? " is-filled" : ""}${item && !available ? " is-unavailable" : ""}" type="button" data-slot-id="${slot.id}" aria-label="${escapeHtml(t("page.characterBuild.selectSlot", { slot: slotLabel }))}"${item && !available ? ` aria-disabled="true" title="${escapeHtml(t("page.characterBuild.unavailable"))}"` : ""}>
          <span class="slot-icon" aria-hidden="true">${slot.icon}</span>
          <span class="slot-name">${escapeHtml(slotLabel)}</span>
          ${item ? `<span class="slot-item">${escapeHtml(itemLabel)}</span>${rarity}<span class="slot-empty">${available ? t("page.characterBuild.equipped") : t("page.characterBuild.unavailable")}</span>` : `<span class="slot-empty">${t("page.characterBuild.emptySlot")}</span>`}
        </button>${runeControls ? `<div class="rune-controls" aria-label="${escapeHtml(t("page.characterBuild.runeSlots", { slot: slotLabel }))}">${runeControls}</div>` : ""}</div>`;
        })
        .join("");
    });
  }

  function renderStats() {
    const statsGroups = $("statsGroups");
    const previousGroups = [...statsGroups.querySelectorAll(".stats-group")];
    const openGroups = new Set(previousGroups.filter((group) => group.open).map((group) => group.dataset.statsGroup));
    const calculated = calculator.calculateBuildStats({
      equipment: calculationEquipment(),
      source: state.source,
      level: state.level,
      classId: state.classId,
      selectedSkills: selectedSkillNodes(),
      isAvailable: isCalculationItemAvailable
    });
    const hasPreviousState = previousGroups.length > 0;
    const baseStats = calculator.createBaseStats ? calculator.createBaseStats(state.classId) : null;
    const equippedCount = Object.values(calculationEquipment()).filter(Boolean).length;
    const summary = statsGroups && document.querySelector(".stats-panel .base-value");
    if (summary) {
      summary.textContent = [
        `${t("page.characterBuild.level")} ${state.level}`,
        localizeClass(state.classId, state.classId),
        `${equippedCount} ${t("page.characterBuild.equipped")}`
      ].join(" · ");
    }
    statsGroups.innerHTML = Object.entries(calculator.groups)
      .map(([group, entries], index) => {
        const isOpen = hasPreviousState ? openGroups.has(String(index)) : false;
        return `<details class="stats-group" data-stats-group="${index}"${isOpen ? " open" : ""}><summary>${escapeHtml(localizeGroup(group))}</summary><ul class="stat-list">${entries
          .map((stat) => {
            const total = calculated[stat];
            const base = baseStats ? baseStats[stat] : null;
            const modified = Boolean(base && total && (total.flat !== base.flat || total.percent !== base.percent));
            const baseTitle = modified
              ? ` title="${escapeHtml(t("page.characterBuild.base", { level: calculator.formatValue(base) }))}"`
              : "";
            return `<li><span>${escapeHtml(localizeStat(stat))}</span><strong${baseTitle}>${calculator.formatValue(total)}${modified ? " *" : ""}</strong></li>`;
          })
          .join("")}</ul></details>`;
      })
      .join("");
  }

  function skillNodeState(node) {
    const statusLabel = (key) => t(`page.characterBuild.${key}`);
    if (isSkillUnlocked(node.id))
      return { name: "selected", label: statusLabel("selected"), reason: t("page.characterBuild.alreadyUnlocked") };
    const missing = missingSkillPrerequisites(node);
    if (missing.length) {
      const requirementNames = missing
        .map((id) => {
          const prerequisite = currentSkillTree().find((item) => item.id === id);
          return prerequisite ? localizeSkillName(prerequisite) : id;
        })
        .join(", ");
      return {
        name: "locked",
        label: statusLabel("locked"),
        reason: t(node.prerequisiteMode === "any" ? "page.characterBuild.requiresAny" : "page.characterBuild.requiresSkills", {
          value: requirementNames
        })
      };
    }
    if (node.cost > availableSkillPoints()) {
      return {
        name: "locked",
        label: statusLabel("locked"),
        reason: `Need ${node.cost - availableSkillPoints()} more skill point${node.cost - availableSkillPoints() === 1 ? "" : "s"}.`
      };
    }
    return { name: "available", label: statusLabel("available"), reason: t("page.characterBuild.readyToUnlock") };
  }

  function formatSkillEffects(node) {
    return node.effects.map((effect) => `${localizeStat(effect.stat)}: ${effect.value}`).join(" / ");
  }

  function renderSkillDetail(nodeId) {
    const node = currentSkillTree().find((item) => item.id === nodeId) || currentSkillTree()[0];
    if (!node || !$("skillDetail")) return;
    const status = skillNodeState(node);
    const prerequisites = node.prerequisites.length
      ? node.prerequisites
          .map((id) => {
            const prerequisite = currentSkillTree().find((item) => item.id === id);
            return prerequisite ? localizeSkillName(prerequisite) : id;
          })
          .join(", ")
      : t("page.characterBuild.none");
    const effectDetail = node.center ? "" : `<span>${escapeHtml(formatSkillEffects(node))}</span>`;
    const prerequisiteDetail = node.center
      ? ""
      : `<span>${escapeHtml(t(node.prerequisiteMode === "any" ? "page.characterBuild.requiresAny" : "page.characterBuild.requires", { value: prerequisites }))}</span>`;
    const descriptionDetail = node.description
      ? `<span>${escapeHtml(localizeSkillDescription(node))}</span>`
      : "";
    $("skillDetail").innerHTML =
      `<strong>${escapeHtml(localizeSkillName(node))}</strong><span>${escapeHtml(node.className)}</span>${descriptionDetail}${effectDetail}${prerequisiteDetail}<span>Cost: ${node.cost} skill point${node.cost === 1 ? "" : "s"}</span><span>${escapeHtml(t("page.characterBuild.state", { value: status.label }))}${status.reason ? ` - ${escapeHtml(status.reason)}` : ""}</span>`;
  }

  function renderSkills(selectedNodeId) {
    const skills = currentSkillTree();
    const layout = data.SKILL_TREE_LAYOUT || [];
    const layoutById = new Map(layout.map((point) => [point.id, point]));
    const layoutBySkillId = new Map(layout.map((point) => [point.skillId, point]));
    const skillsById = new Map(skills.map((node) => [node.id, node]));
    const skillsByNodeId = new Map(skills.map((node) => [node.nodeId, node]));
    const drawnConnections = new Set();
    const connectionMarkup = [];
    const addConnection = (fromId, toId, active = false) => {
      const key = [fromId, toId].sort().join(":");
      if (drawnConnections.has(key)) return;
      const from = layoutById.get(fromId);
      const to = layoutById.get(toId);
      if (!from || !to) return;
      drawnConnections.add(key);
      const fromSkill = skillsByNodeId.get(from.skillId);
      const toSkill = skillsByNodeId.get(to.skillId);
      connectionMarkup.push(
        `<line class="skill-connection${active ? " is-active" : ""}" data-from-skill-id="${fromSkill?.id || ""}" data-to-skill-id="${toSkill?.id || ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`
      );
    };
    (data.SKILL_TREE_CONNECTIONS || []).forEach(([fromId, toId]) => {
      const fromPoint = layoutById.get(fromId);
      const toPoint = layoutById.get(toId);
      const fromSkill = fromPoint && skillsByNodeId.get(fromPoint.skillId);
      const toSkill = toPoint && skillsByNodeId.get(toPoint.skillId);
      const active = (fromSkill && isSkillUnlocked(fromSkill.id)) || (toSkill && isSkillUnlocked(toSkill.id));
      addConnection(fromId, toId, active);
    });
    skills.forEach((node) => {
      node.prerequisites.forEach((parentId) => {
        const parent = skillsById.get(parentId);
        const parentPoint = parent && layoutBySkillId.get(parent.nodeId);
        const nodePoint = layoutBySkillId.get(node.nodeId);
        if (parentPoint && nodePoint) addConnection(parentPoint.id, nodePoint.id, isSkillUnlocked(node.id));
      });
    });
    const connections = connectionMarkup.join("");
    const nodes = layout
      .map((point) => {
        const node = skillsByNodeId.get(point.skillId);
        const position = `--node-x:${point.x}px;--node-y:${point.y}px`;
        const status = skillNodeState(node);
        const selected = status.name === "selected";
        return `<button class="skill-node is-${status.name}${node.center ? " is-center" : ""}${point.isAnchor ? " is-branch-anchor" : ""}" type="button" data-skill-id="${node.id}" style="${position}" aria-label="${escapeHtml(localizeSkillName(node))}: ${escapeHtml(status.label)}" aria-pressed="${selected}"><span class="skill-node-core" aria-hidden="true"></span></button>`;
      })
      .join("");
    const selectedNode = skillsById.get(selectedNodeId) || skills.find((node) => node.center);
    $("skillTree").innerHTML = `
      <div class="skill-tree-toolbar">
        <span data-skill-points>${escapeHtml(skillClassName(state.classId))} · ${availableSkillPoints()} / ${skills.reduce((sum, node) => sum + node.cost, 0)} skill points</span>
        <button class="skill-tree-reset" type="button" data-reset-view>Reset View</button>
      </div>
      <div class="skill-tree-viewport" id="skillTreeViewport" aria-label="Skill tree viewport">
        <div class="skill-tree-canvas" id="skillTreeCanvas">
          <svg class="skill-connections" viewBox="0 0 921 923" preserveAspectRatio="none" aria-hidden="true">${connections}</svg>
          ${nodes}
        </div>
      </div>
      <div id="skillDetail" class="skill-detail" aria-live="polite"></div>
    `;
    renderSkillDetail(selectedNode?.id);
    setupSkillTreeViewport();
  }

  function updateSkillTreeState(selectedNodeId) {
    const skills = currentSkillTree();
    const pointsBySkillId = new Map((data.SKILL_TREE_LAYOUT || []).map((point) => [point.skillId, point]));
    document.querySelectorAll("#skillTreeCanvas [data-skill-id]").forEach((button) => {
      const node = skills.find((skill) => skill.id === button.dataset.skillId);
      if (!node) return;
      const status = skillNodeState(node);
      const point = pointsBySkillId.get(node.nodeId);
      const isCenter = node.center;
      button.className = `skill-node is-${status.name}${isCenter ? " is-center" : ""}${point?.isAnchor ? " is-branch-anchor" : ""}`;
      button.setAttribute("aria-pressed", String(status.name === "selected"));
      button.setAttribute("aria-label", `${localizeSkillName(node)}: ${status.label}`);
    });
    document.querySelectorAll("#skillTreeCanvas .skill-connection").forEach((line) => {
      const fromSelected = isSkillUnlocked(line.dataset.fromSkillId);
      const toSelected = isSkillUnlocked(line.dataset.toSkillId);
      line.classList.toggle("is-active", fromSelected || toSelected);
    });
    const pointsLabel = $("skillTree").querySelector?.("[data-skill-points]");
    if (pointsLabel) {
      const total = skills.reduce((sum, node) => sum + node.cost, 0);
      pointsLabel.textContent = `${skillClassName(state.classId)} · ${availableSkillPoints()} / ${total} skill points`;
    }
    renderSkillDetail(selectedNodeId);
  }

  const skillTreeViewState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    originX: 0,
    originY: 0,
    initialized: false,
    userInteracted: false,
    resizeListenerBound: false,
    dragging: false,
    pointerId: null
  };

  function resetSkillTreeViewport(viewport) {
    if (!viewport) return;
    const width = viewport.clientWidth || 921;
    const height = viewport.clientHeight || 923;
    const scale = Math.min(0.94, (width - 24) / 921, (height - 24) / 923);
    skillTreeViewState.scale = Math.max(0.4, scale);
    skillTreeViewState.offsetX = (width - 921 * skillTreeViewState.scale) / 2;
    skillTreeViewState.offsetY = (height - 923 * skillTreeViewState.scale) / 2;
    skillTreeViewState.userInteracted = false;
    applySkillTreeTransform();
  }

  function applySkillTreeTransform() {
    const viewport = $("skillTreeViewport");
    const canvas = $("skillTreeCanvas");
    if (!viewport || !canvas) return;
    const clamped = Math.min(2, Math.max(0.4, skillTreeViewState.scale));
    skillTreeViewState.scale = clamped;
    if (canvas.style) canvas.style.transform = `translate(${skillTreeViewState.offsetX}px, ${skillTreeViewState.offsetY}px) scale(${clamped})`;
    if (viewport.classList && typeof viewport.classList.toggle === "function") {
      viewport.classList.toggle("is-dragging", skillTreeViewState.dragging);
    } else if (viewport.setAttribute) {
      viewport.setAttribute("data-dragging", skillTreeViewState.dragging ? "true" : "false");
    }
  }

  function setupSkillTreeViewport() {
    const viewport = $("skillTreeViewport");
    const canvas = $("skillTreeCanvas");
    if (!viewport || !canvas) return;

    if (!viewport.addEventListener || !canvas.style) return;

    if (!skillTreeViewState.initialized) {
      resetSkillTreeViewport(viewport);
      skillTreeViewState.initialized = true;
    } else {
      applySkillTreeTransform();
    }
    if (!skillTreeViewState.resizeListenerBound && window.addEventListener) {
      window.addEventListener("resize", () => {
        if (!skillTreeViewState.userInteracted) resetSkillTreeViewport($("skillTreeViewport"));
      });
      skillTreeViewState.resizeListenerBound = true;
    }

    const clampOffset = () => {
      const minX = Math.min(0, viewport.clientWidth - 921 * skillTreeViewState.scale);
      const minY = Math.min(0, viewport.clientHeight - 923 * skillTreeViewState.scale);
      const maxX = Math.max(0, viewport.clientWidth - 921 * skillTreeViewState.scale);
      const maxY = Math.max(0, viewport.clientHeight - 923 * skillTreeViewState.scale);
      skillTreeViewState.offsetX = Math.max(minX, Math.min(maxX, skillTreeViewState.offsetX));
      skillTreeViewState.offsetY = Math.max(minY, Math.min(maxY, skillTreeViewState.offsetY));
    };

    viewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const previousScale = skillTreeViewState.scale;
      const nextScale = Math.min(2, Math.max(0.4, previousScale * (event.deltaY < 0 ? 1.12 : 0.89)));
      const worldX = (pointerX - skillTreeViewState.offsetX) / previousScale;
      const worldY = (pointerY - skillTreeViewState.offsetY) / previousScale;
      skillTreeViewState.scale = nextScale;
      skillTreeViewState.offsetX = pointerX - worldX * nextScale;
      skillTreeViewState.offsetY = pointerY - worldY * nextScale;
      skillTreeViewState.userInteracted = true;
      clampOffset();
      applySkillTreeTransform();
    }, { passive: false });

    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !event.isPrimary || skillTreeViewState.dragging) return;
      if (event.target.closest("[data-skill-id]")) return;
      event.preventDefault();
      skillTreeViewState.dragging = true;
      skillTreeViewState.pointerId = event.pointerId;
      skillTreeViewState.pointerStartX = event.clientX;
      skillTreeViewState.pointerStartY = event.clientY;
      skillTreeViewState.originX = skillTreeViewState.offsetX;
      skillTreeViewState.originY = skillTreeViewState.offsetY;
      skillTreeViewState.userInteracted = true;
      try {
        viewport.setPointerCapture?.(event.pointerId);
      } catch {
        skillTreeViewState.dragging = false;
        skillTreeViewState.pointerId = null;
        applySkillTreeTransform();
      }
      if (skillTreeViewState.dragging) applySkillTreeTransform();
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!skillTreeViewState.dragging || event.pointerId !== skillTreeViewState.pointerId) return;
      const deltaX = event.clientX - skillTreeViewState.pointerStartX;
      const deltaY = event.clientY - skillTreeViewState.pointerStartY;
      skillTreeViewState.offsetX = skillTreeViewState.originX + deltaX;
      skillTreeViewState.offsetY = skillTreeViewState.originY + deltaY;
      clampOffset();
      applySkillTreeTransform();
    });

    const stopDrag = (event) => {
      if (!skillTreeViewState.dragging) return;
      if (event && event.pointerId !== skillTreeViewState.pointerId) return;
      const pointerId = skillTreeViewState.pointerId;
      skillTreeViewState.dragging = false;
      skillTreeViewState.pointerId = null;
      if (pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
      applySkillTreeTransform();
    };

    viewport.addEventListener("pointerup", stopDrag);
    viewport.addEventListener("pointercancel", stopDrag);
    viewport.addEventListener("lostpointercapture", stopDrag);

    if ($("skillTree").querySelector) {
      $("skillTree").querySelector("[data-reset-view]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        resetSkillTreeViewport($("skillTreeViewport"));
      });
    }
  }

  function setFilterOptions() {
    const sourceItems = state.pickerMode === "rune" ? activeRunes() : activeItems();
    const rarities = [...new Set(sourceItems.map((item) => item.rarity).filter(Boolean))];
    $("rarityFilter").innerHTML =
      `<option value="">${t("page.characterBuild.allRarities")}</option>${rarities.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
    $("rarityFilter").value = state.rarity;
  }

  function matchingItems() {
    const query = normalize(state.search);
    const sourceItems = state.pickerMode === "rune" ? activeRunes() : slotItems();
    return sourceItems.filter((item) => {
      const textMatch = !query || item.searchText.includes(query);
      const rarityMatch = !state.rarity || item.rarity === state.rarity;
      const levelMatch = item.levelRequirement === null || item.levelRequirement <= state.level;
      return textMatch && rarityMatch && levelMatch;
    });
  }

  function renderItems() {
    const items = matchingItems();
    const slot = state.pickerMode === "rune" ? slotById(state.pickerArmorSlot) : slotById(state.pickerSlot);
    $("itemList").innerHTML = items.length
      ? items
          .map((item) => {
            const effects = item.effects.length
              ? `<p class="item-effect">${escapeHtml(item.effects.map(localizeItemEffect).join(" / "))}</p>`
              : "";
            const level =
              item.levelRequirement === null
                ? ""
                : `<span>${escapeHtml(t("page.characterBuild.itemLevel", { level: item.levelRequirement }))}</span>`;
            const classes = item.classLabel ? `<span>${escapeHtml(localizeClassLabel(item.classLabel))}</span>` : "";
            const set = item.set
              ? `<span>${escapeHtml(t("page.ecompendium.labels.set"))}: ${escapeHtml(window.SAOContentTranslations?.translateKnownTerms?.(item.set, i18n?.getLanguage?.()) || item.set)}</span>`
              : "";
            return `<article class="item-card"><div class="item-icon" aria-hidden="true">${item.type ? iconForType(item.type) : window.CharacterBuildIcons.markup("rune")}</div><div><h3>${escapeHtml(displayText(item, "name") || item.name)}</h3><div class="item-meta"><span>${state.pickerMode === "rune" ? t("page.characterBuild.rune") : escapeHtml(item.type)}</span>${item.rarity ? `<span class="${rarityClass(item.rarity)}">${escapeHtml(localizeRarity(item.rarity))}</span>` : ""}${level}${classes}${set}</div>${effects}${item.description ? `<p class="item-description">${escapeHtml(displayText(item, "description") || item.description)}</p>` : ""}</div><button class="equip-button" type="button" data-${state.pickerMode === "rune" ? "rune" : "item"}-id="${item.id}">${t("page.characterBuild.select")}</button></article>`;
          })
          .join("")
      : `<div class="empty-state">${escapeHtml(t("page.characterBuild.noMatchingItems", { slot: slot?.name || "rune", level: state.level }))}</div>`;
  }

  function openPicker(slotId) {
    state.pickerMode = "equipment";
    state.pickerSlot = slotId;
    state.pickerArmorSlot = null;
    state.pickerRuneIndex = null;
    const slot = slotById(slotId);
    state.search = "";
    state.rarity = "";
    $("dialogTitle").textContent = t("page.characterBuild.selectSlot", { slot: localizeSlot(slot) });
    $("itemSearch").value = "";
    $("pickerNotice").textContent = "";
    setFilterOptions();
    renderItems();
    $("equipmentDialog").showModal();
    requestAnimationFrame(() => $("itemSearch").focus());
  }

  function openRunePicker(armorSlotId, runeIndex) {
    const armor = activeBuild()[armorSlotId];
    if (!armor || runeIndex >= adapter.getRuneSlots(armor)) return;
    state.pickerMode = "rune";
    state.pickerSlot = null;
    state.pickerArmorSlot = armorSlotId;
    state.pickerRuneIndex = runeIndex;
    state.search = "";
    state.rarity = "";
    $("dialogTitle").textContent = t("page.characterBuild.selectRuneFor", {
      number: runeIndex + 1,
      slot: localizeSlot(slotById(armorSlotId))
    });
    $("itemSearch").value = "";
    $("pickerNotice").textContent = "";
    setFilterOptions();
    renderItems();
    $("equipmentDialog").showModal();
    requestAnimationFrame(() => $("itemSearch").focus());
  }

  function equipItem(itemId) {
    const item = slotItems().find((entry) => entry.id === itemId);
    if (!item || !state.pickerSlot || !itemIsClassCompatible(item, state.classId)) return;
    const weaponSlot = item.type === "Main Weapon" || item.type === "Offhand";
    const otherSlot = state.pickerSlot === "main-weapon" ? "offhand" : "main-weapon";
    if (weaponSlot && activeBuild()[otherSlot]?.equipmentKey === item.equipmentKey) {
      $("pickerNotice").textContent = t("page.characterBuild.weaponAlreadyEquipped");
      return;
    }
    activeBuild()[state.pickerSlot] = item;
    saveState();
    renderSlots();
    renderStats();
    $("equipmentDialog").close();
  }

  function equipRune(runeId) {
    const armor = activeBuild()[state.pickerArmorSlot];
    const rune = activeRunes().find((item) => item.id === runeId);
    if (!armor || !rune || state.pickerRuneIndex === null || state.pickerRuneIndex >= adapter.getRuneSlots(armor))
      return;
    if (!activeSkillState().runes || typeof activeSkillState().runes !== "object") activeSkillState().runes = {};
    const selected = Array.isArray(activeSkillState().runes[state.pickerArmorSlot])
      ? [...activeSkillState().runes[state.pickerArmorSlot]]
      : [];
    selected[state.pickerRuneIndex] = rune;
    activeSkillState().runes[state.pickerArmorSlot] = selected;
    saveState();
    renderSlots();
    renderStats();
    $("equipmentDialog").close();
  }

  function removeIncompatibleEquipment() {
    const equipment = activeBuild();
    Object.keys(equipment).forEach((slotId) => {
      if (!itemIsClassCompatible(equipment[slotId], state.classId)) delete equipment[slotId];
    });
  }

  function unlockSkill(skillId) {
    const node = currentSkillTree().find((item) => item.id === skillId);
    if (!node) return;
    if (node.center) {
      renderSkillDetail(skillId);
      return;
    }
    const status = skillNodeState(node);
    if (status.name === "selected") {
      delete activeSkillState().selectedSkills[node.id];
      pruneInvalidSelectedSkills();
    } else if (status.name === "available") {
      activeSkillState().selectedSkills[node.id] = true;
      pruneInvalidSelectedSkills();
    } else {
      renderSkillDetail(skillId);
      return;
    }
    saveState();
    updateSkillTreeState(skillId);
    renderStats();
  }

  function resetBuild() {
    const active = activeSkillState();
    resetBuildState(active);
    syncActiveConfiguration();
    saveState();
    renderConfiguration();
    renderSlots();
    renderStats();
    renderSkills();
    if ($("equipmentDialog").open) $("equipmentDialog").close();
  }

  function ensureWalkthroughDialog() {
    const dialog = $("equipmentDialog");
    if (dialog?.open) return;
    const firstSlot = document.querySelector(
      "#armorSlots [data-slot-id], #accessorySlots [data-slot-id], #weaponSlots [data-slot-id]"
    );
    firstSlot?.click();
    walkthroughOpenedDialog = Boolean(dialog?.open);
  }

  function closeWalkthroughDialog() {
    if (walkthroughOpenedDialog && $("equipmentDialog")?.open) $("equipmentDialog").close();
  }

  function buildWalkthroughSteps() {
    return [
      {
        selector: "[data-walkthrough='character-build-title']",
        title: t("page.characterBuild.walkthrough.step1Title"),
        body: t("page.characterBuild.walkthrough.step1Body")
      },
      {
        /* The whole level section: the level bar plus its label and the level numbers. */
        selector: ".level-control",
        title: t("page.characterBuild.walkthrough.step2Title"),
        body: t("page.characterBuild.walkthrough.step2Body")
      },
      {
        selector: "#equipmentHeading",
        title: t("page.characterBuild.walkthrough.step3Title"),
        body: t("page.characterBuild.walkthrough.step3Body")
      },
      {
        selector: "#armorSlots",
        title: t("page.characterBuild.walkthrough.step4Title"),
        body: t("page.characterBuild.walkthrough.step4Body")
      },
      {
        selector: "#equipmentDialog .dialog-shell",
        title: t("page.characterBuild.walkthrough.step5Title"),
        body: t("page.characterBuild.walkthrough.step5Body"),
        onEnter: ensureWalkthroughDialog
      },
      {
        selector: "#rarityFilter",
        title: t("page.characterBuild.walkthrough.step6Title"),
        body: t("page.characterBuild.walkthrough.step6Body"),
        onEnter: ensureWalkthroughDialog,
        onExit: closeWalkthroughDialog
      },
      {
        selector: "#statsHeading",
        title: t("page.characterBuild.walkthrough.step7Title"),
        body: t("page.characterBuild.walkthrough.step7Body")
      },
      {
        selector: "#skillsHeading",
        title: t("page.characterBuild.walkthrough.step8Title"),
        body: t("page.characterBuild.walkthrough.step8Body")
      },
      {
        selector: "#buildSlot",
        title: t("page.characterBuild.walkthrough.step9Title"),
        body: t("page.characterBuild.walkthrough.step9Body")
      },
      {
        selector: ".source-control",
        title: t("page.characterBuild.walkthrough.step10Title"),
        body: t("page.characterBuild.walkthrough.step10Body")
      },
      {
        selector: ".page-header",
        title: t("page.characterBuild.walkthrough.step11Title"),
        body: t("page.characterBuild.walkthrough.step11Body")
      }
    ];
  }

  function startGuidedWalkthrough(options) {
    return walkthroughController?.start(options) || false;
  }

  function bindEvents() {
    const pageUtils = window.SAOPageUtils;
    if (pageUtils && typeof pageUtils.attachSectionNavButtons === "function") {
      pageUtils.attachSectionNavButtons(".nav", null);
    }
    $("armorSlots").addEventListener("click", (event) => {
      const runeButton = event.target.closest("[data-rune-slot]");
      if (runeButton) return openRunePicker(runeButton.dataset.armorSlot, Number(runeButton.dataset.runeSlot));
      const button = event.target.closest("[data-slot-id]");
      if (button) openPicker(button.dataset.slotId);
    });
    $("accessorySlots").addEventListener("click", (event) => {
      const button = event.target.closest("[data-slot-id]");
      if (button) openPicker(button.dataset.slotId);
    });
    $("weaponSlots").addEventListener("click", (event) => {
      const button = event.target.closest("[data-slot-id]");
      if (button) openPicker(button.dataset.slotId);
    });
    document.querySelectorAll("[data-source]").forEach((button) =>
      button.addEventListener("click", () => {
        state.source = button.dataset.source;
        activeSkillState().source = state.source;
        renderConfiguration();
        ensureEquipmentDataLoaded(
          state.source,
          () => {
            setFilterOptions();
            renderConfiguration();
            renderSlots();
            renderStats();
            if ($("equipmentDialog").open) renderItems();
            saveState();
          },
          () => renderConfiguration()
        );
        saveState();
      })
    );
    $("characterLevel").addEventListener("input", (event) => {
      state.level = Number(event.target.value);
      activeSkillState().level = state.level;
      renderConfiguration();
      renderStats();
      if ($("equipmentDialog").open) renderItems();
      saveState();
    });
    $("characterLevel").addEventListener("pointerdown", (event) => {
      if (event.button === 0) setLevelFromPointer(event);
    });
    $("characterClass").addEventListener("change", (event) => {
      state.classId = event.target.value;
      activeSkillState().classId = state.classId;
      activeSkillState().selectedSkills = {};
      removeIncompatibleEquipment();
      renderConfiguration();
      renderSlots();
      renderStats();
      renderSkills();
      if ($("equipmentDialog").open) renderItems();
      saveState();
    });
    $("buildSlot").addEventListener("change", (event) => {
      if (!Object.prototype.hasOwnProperty.call(buildSlots, event.target.value)) return;
      state.activeSlot = event.target.value;
      syncActiveConfiguration();
      pruneInvalidSelectedSkills();
      setFilterOptions();
      renderConfiguration();
      renderSlots();
      renderStats();
      renderSkills();
      saveState();
    });
    document.addEventListener("sao:languagechange", () => {
      renderConfiguration();
      renderSlots();
      renderStats();
      renderSkills();
      if ($("equipmentDialog").open) renderItems();
    });
    $("resetBuild").addEventListener("click", resetBuild);
    $("closeDialog").addEventListener("click", () => $("equipmentDialog").close());
    $("equipmentDialog").addEventListener("click", (event) => {
      if (event.target === $("equipmentDialog")) $("equipmentDialog").close();
    });
    $("itemSearch").addEventListener("input", (event) => {
      state.search = event.target.value;
      renderItems();
    });
    $("rarityFilter").addEventListener("change", (event) => {
      state.rarity = event.target.value;
      renderItems();
    });
    $("itemList").addEventListener("click", (event) => {
      const runeButton = event.target.closest("[data-rune-id]");
      if (runeButton) return equipRune(runeButton.dataset.runeId);
      const button = event.target.closest("[data-item-id]");
      if (button) equipItem(button.dataset.itemId);
    });
    $("skillTree").addEventListener("click", (event) => {
      const button = event.target.closest("[data-skill-id]");
      if (button) unlockSkill(button.dataset.skillId);
    });
    $("skillTree").addEventListener("pointerover", (event) => {
      const button = event.target.closest("[data-skill-id]");
      if (button) renderSkillDetail(button.dataset.skillId);
    });
    $("skillTree").addEventListener("focusin", (event) => {
      const button = event.target.closest("[data-skill-id]");
      if (button) renderSkillDetail(button.dataset.skillId);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.createWalkthroughController === "function") {
      walkthroughController = window.createWalkthroughController({
        document,
        window,
        storage: window.SAOStorage,
        storageKey: walkthroughStorageKey,
        getSteps: buildWalkthroughSteps,
        translate: t,
        onClose: () => {
          if (walkthroughOpenedDialog && $("equipmentDialog")?.open) $("equipmentDialog").close();
          walkthroughOpenedDialog = false;
        }
      });
      document.addEventListener("sao:walkthroughrestart", () => startGuidedWalkthrough({ force: true }));
    }
    mountIcons();
    registerCharacterBuildTranslations();
    loadState();
    renderConfiguration();
    renderSlots();
    renderStats();
    renderSkills();
    bindEvents();
    ensureEquipmentDataLoaded(
      state.source,
      () => {
        setFilterOptions();
        renderConfiguration();
        renderSlots();
        renderStats();
        renderSkills();
      },
      () => renderConfiguration()
    );
    if (walkthroughController) startGuidedWalkthrough();
  });
})();
