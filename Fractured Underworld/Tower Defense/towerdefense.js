const openInfoSheetButtons = document.querySelectorAll(".chapter-button[data-open-info-sheet='true']");
const closeInfoSheetButton = document.getElementById("closeInfoSheetButton");
const infoSheet = document.getElementById("towerDefenseInfoSheet");
const infoSheetTitle = document.getElementById("infoSheetTitle");
const infoSheetContent = document.getElementById("towerDefenseInfoSheetContent");
const shopList = document.getElementById("towerDefenseShopList");
const shopCount = document.getElementById("towerDefenseShopCount");
const toast = document.getElementById("towerDefenseToast");
const backButton = document.getElementById("towerDefenseBackButton");
const isCurrentDataset = window.SAODatasets?.getDatasetFromLocation() === "current";

if (backButton) {
  const floor = new URLSearchParams(window.location.search).get("floor");
  if (floor) {
    backButton.href = `../Main UI/mainui.html?${new URLSearchParams({ floor }).toString()}`;
  }
}
let toastTimeoutId = null;
let lastFocusedElement = null;
const i18n = window.SAOI18n || null;
const t = (key, params) => (i18n ? i18n.t(key, params) : key);
const content = (key, fallback) => (i18n && typeof i18n.content === "function"
  ? i18n.content(key, fallback)
  : fallback);

function localizeChapterButtons() {
  openInfoSheetButtons.forEach(button => {
    button.textContent = t("page.towerdefense.chapter", {
      number: button.dataset.chapter || ""
    });
  });
}

function getTowerDefenseId(item) {
  if (item.id) return item.id;
  const legacyIds = {
    "Mage Skeleton": "mageSkeleton",
    "Archer Skeleton": "archerSkeleton",
    "Swordsman Skeleton": "swordsmanSkeleton"
  };
  if (legacyIds[item.name]) return legacyIds[item.name];
  return String(item.name || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function getTowerDefenseText(item, field, fallback) {
  const itemId = getTowerDefenseId(item);
  const legacyField = field === "universalUpgradeCosts" ? "upgradeCosts" : field;
  const legacyKey = `page.towerdefense.shopItems.${itemId}.${legacyField}`;
  const legacyValue = t(legacyKey);
  const canonicalValue = fallback === undefined ? item[field] : fallback;
  return content(`towerDefense.${itemId}.${field}`, legacyValue === legacyKey ? canonicalValue : legacyValue);
}

function showToast(message) {
  if (!toast || !message) return;

  toast.textContent = message;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");

  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 2600);
}

function buildDefaultInfoSheetMarkup() {
  if (isCurrentDataset) {
    const selectedEntry = activeTowerDefenseEntries.find(entry => entry.chapter === selectedChapterForSheet);
    if (!selectedEntry) {
      return `<p>${t("page.towerdefense.insufficientInfo")}</p>`;
    }
    const chapterId = `chapter-${selectedEntry.chapter}`;
    return `
      <table class="info-table">
        <thead><tr><th>${t("page.towerdefense.arcHead")}</th><th>${t("page.towerdefense.rewardsHead")}</th><th>${t("page.towerdefense.wavesHead")}</th></tr></thead>
        <tbody><tr><td>${content(`towerDefense.${chapterId}.arc`, selectedEntry.arc)}</td><td>${content(`towerDefense.${chapterId}.rewards`, selectedEntry.rewards)}</td><td>${content(`towerDefense.${chapterId}.waves`, selectedEntry.waves)}</td></tr></tbody>
      </table>
    `;
  }

  return `
    <table class="info-table">
      <thead>
        <tr>
          <th>${t("page.towerdefense.arcHead")}</th>
          <th>${t("page.towerdefense.rewardsHead")}</th>
          <th>${t("page.towerdefense.wavesHead")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${t("page.towerdefense.arc1Title")}</td>
          <td>${t("page.towerdefense.arc1Rewards")}</td>
          <td>${t("page.towerdefense.arc1Waves")}</td>
        </tr>
        <tr>
          <td>${t("page.towerdefense.arc2Title")}</td>
          <td>${t("page.towerdefense.arc2Rewards")}</td>
          <td>${t("page.towerdefense.arc2Waves")}</td>
        </tr>
      </tbody>
    </table>
  `;
}

const shopItems = [
  {
    name: "Mage Skeleton",
    unlockRequirement: "5 Mage Scrolls",
    invocationCost: "200 Invocation Cost",
    levelOne: "Lvl 1: 1.1 Attack Speed, 7 Range, 5 Damage",
    progression: [
      "Lvl 1 -> 2: +.1 Attack Speed, +2 Range, +2 Damage (1.2 Attack Speed, 9 Range, 7 Damage)",
      "Lvl 2 -> 3: +.2 Attack Speed, +2 Range, +2 Damage (1.4 Attack Speed, 11 Range, 9 Damage)",
      "Lvl 3 -> 4: +.3 Attack Speed, +2 Range, +3 Damage (1.7 Attack Speed, 13 Range, 12 Damage)",
      "Lvl 4 -> 5 (Max): +.3 Attack Speed, +2 Range, +3 Damage (2 Attack Speed, 15 Range, 15 Damage)",
    ],
    universalUpgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400",
  },
  {
    name: "Archer Skeleton",
    unlockRequirement: "5 Archer Scrolls",
    invocationCost: "150 Invocation Cost",
    levelOne: "Level 1: .4 Attack Speed, 10 Range, 6 Damage",
    progression: [
      "Lvl 1 -> 2: +.1 Attack Speed, +3 Range, +3 Damage (0.5 Attack Speed, 13 Range, 9 Damage)",
      "Lvl 2 -> 3: +3 Range, +4 Damage (.5 Attack Speed, 16 Range, 13 Damage)",
      "Lvl 3 -> 4: N/A (N/A)",
      "Lvl 4 -> 5: N/A (N/A)",
    ],
    universalUpgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400",
  },
  {
    name: "Swordsman Skeleton",
    unlockRequirement: "5 Swordsman Scrolls",
    invocationCost: "100 Invocation Cost",
    levelOne: "Level 1: .7 Attack Speed, 4 Range, 8 Damage",
    progression: [
      "Lvl 1 -> 2: +4 Damage (.7 Attack Speed, 4 Range, 12 Damage)",
      "Lvl 2 -> 3: +.1 Attack Speed, +1 Range, +5 Damage (.8 Attack Speed, 5 Range, 17 Damage)",
      "Lvl 3 -> 4: +7 Damage (.8 Attack Speed, 5 Range, 24 Damage)",
      "Lvl 4 -> 5 (Max): +.1 Attack Speed, +1 Range, +8 Damage",
    ],
    universalUpgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400",
  },
];

const activeTowerDefenseEntries = isCurrentDataset
  ? (window.SAO_CURRENT_TOWER_DEFENSE_DATA?.entries || [])
  : shopItems;
let selectedChapterForSheet = 1;

function renderShopItems() {
  if (!shopList) return;

  if (shopCount) {
    shopCount.textContent = String(activeTowerDefenseEntries.length);
  }

  shopList.innerHTML = activeTowerDefenseEntries.map(item => `
    <article class="shop-item">
      <div class="shop-item-header">
        <div>
          <p class="shop-item-kicker">Unit</p>
          <h3 class="shop-item-name">${getTowerDefenseText(item, "name")}</h3>
        </div>
        <div class="shop-item-cost">
          <span>Invocation</span>
          <strong>${getTowerDefenseText(item, "invocationCost")}</strong>
        </div>
      </div>
      <div class="shop-item-unlock">
        <span>Unlock requirement</span>
        <strong>${getTowerDefenseText(item, "unlockRequirement")}</strong>
      </div>
      <div class="shop-item-section">
        <h4>Base stats</h4>
        <p class="shop-item-base-stat">${getTowerDefenseText(item, "levelOne")}</p>
      </div>
      <div class="shop-item-progression">
        <h4>${t("page.towerdefense.levelProgression")}</h4>
        <ul>
          ${item.progression.map((step, index) => {
            const progressionKey = ["one", "two", "three", "four"][index] || String(index);
            const legacyKey = `page.towerdefense.shopItems.${getTowerDefenseId(item)}.progression.${progressionKey}`;
            const legacyValue = t(legacyKey);
            return `<li>${content(`towerDefense.${getTowerDefenseId(item)}.progression.${index}`, legacyValue === legacyKey ? step : legacyValue)}</li>`;
          }).join("")}
        </ul>
        <div class="shop-item-upgrade-costs"><span>Upgrade costs</span><strong>${getTowerDefenseText(item, "universalUpgradeCosts")}</strong></div>
      </div>
    </article>
  `).join("");
}

function openInfoSheet(event) {
  const button = event.currentTarget;
  const selectedChapter = Number(button.dataset.chapter || 1);
  selectedChapterForSheet = selectedChapter;

  openInfoSheetButtons.forEach(chapterButton => {
    const isActive = chapterButton === button;
    chapterButton.classList.toggle("is-active", isActive);
    chapterButton.setAttribute("aria-pressed", String(isActive));
  });

  if (!infoSheet || !infoSheetTitle || !infoSheetContent) return;

  if (selectedChapter === 1) {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    infoSheetTitle.textContent = t("page.towerdefense.chapter", { number: selectedChapter });
    infoSheetContent.innerHTML = buildDefaultInfoSheetMarkup();
    infoSheet.classList.add("open");
    infoSheet.setAttribute("aria-hidden", "false");
    closeInfoSheetButton?.focus();
    return;
  }

  showToast(t("page.towerdefense.insufficientInfo"));
}

function closeInfoSheet(options = {}) {
  if (!infoSheet) return;
  const shouldRestoreFocus = options.restoreFocus !== false;
  if (!infoSheet.classList.contains("open")) return;
  infoSheet.classList.remove("open");
  infoSheet.setAttribute("aria-hidden", "true");

  if (shouldRestoreFocus && lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
    lastFocusedElement.focus();
  }
}

renderShopItems();
localizeChapterButtons();

openInfoSheetButtons.forEach(button => {
  button.addEventListener("click", openInfoSheet);
});

if (closeInfoSheetButton) {
  closeInfoSheetButton.addEventListener("click", closeInfoSheet);
}

if (infoSheet) {
  infoSheet.addEventListener("click", event => {
    const closeTarget = event.target.closest("[data-close-info-sheet='true']");
    if (closeTarget) {
      closeInfoSheet();
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && infoSheet?.classList.contains("open")) {
    closeInfoSheet();
  }
});

document.addEventListener("sao:languagechange", () => {
  localizeChapterButtons();
  renderShopItems();
  if (infoSheet && infoSheet.classList.contains("open")) {
    infoSheetTitle.textContent = t("page.towerdefense.chapter", { number: selectedChapterForSheet });
    infoSheetContent.innerHTML = buildDefaultInfoSheetMarkup();
  }
});
