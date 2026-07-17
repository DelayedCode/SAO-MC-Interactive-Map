const openInfoSheetButtons = document.querySelectorAll(".chapter-button[data-open-info-sheet='true']");
const closeInfoSheetButton = document.getElementById("closeInfoSheetButton");
const infoSheet = document.getElementById("towerDefenseInfoSheet");
const infoSheetTitle = document.getElementById("infoSheetTitle");
const infoSheetContent = document.getElementById("towerDefenseInfoSheetContent");
const shopList = document.getElementById("towerDefenseShopList");
const toast = document.getElementById("towerDefenseToast");
let toastTimeoutId = null;

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

const defaultInfoSheetMarkup = `
  <table class="info-table">
    <thead>
      <tr>
        <th>Arc</th>
        <th>Rewards</th>
        <th>Waves</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Arc 1 - Tutorial (Boar Planes)</td>
        <td>
          Pouch of 100 Col (100%), Utility Crystal (25%), Minor PvE Rune (8%),
          Dungeon Key (4%), Fern (Habitat Item) (30%), Frosted Lantern (Habitat Item) (20%),
          Campfire (Habitat Item) (20%)
        </td>
        <td>5 Waves, On the Fifth wave a reskinned pumba spawns as the boss.</td>
      </tr>
      <tr>
        <td>Arc 2 - Medium (Boar Zones)</td>
        <td>
          500 Col Purse (100%), Utility Crystal (40%), Minor PvE Rune (18%),
          Dungeon Key (12%), Fern (Habitat) (30%), Hay Bale (Habitat) (20%)
        </td>
        <td>6 Waves, On the Sixth wave a reskinned pumba spawns as the boss.</td>
      </tr>
    </tbody>
  </table>
`;

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

function renderShopItems() {
  if (!shopList) return;

  shopList.innerHTML = shopItems.map(item => `
    <article class="shop-item">
      <div class="shop-item-header">
        <h3 class="shop-item-name">${item.name}</h3>
        <span class="shop-item-cost">${item.invocationCost}</span>
      </div>
      <p class="shop-item-meta">Unlock with ${item.unlockRequirement}</p>
      <ul class="shop-item-stats">
        <li>${item.levelOne}</li>
      </ul>
      <div class="shop-item-progression">
        <h4>Level Progression</h4>
        <ul>
          ${item.progression.map(step => `<li>${step}</li>`).join("")}
        </ul>
        <div class="shop-item-upgrade-costs">${item.universalUpgradeCosts}</div>
      </div>
    </article>
  `).join("");
}

function openInfoSheet(event) {
  const button = event.currentTarget;
  const selectedChapter = Number(button.dataset.chapter || 1);

  if (!infoSheet || !infoSheetTitle || !infoSheetContent) return;

  if (selectedChapter === 1) {
    infoSheetTitle.textContent = "Tower Defense Info Sheet";
    infoSheetContent.innerHTML = defaultInfoSheetMarkup;
    infoSheet.classList.add("open");
    infoSheet.setAttribute("aria-hidden", "false");
    return;
  }

  showToast("Not enough information released yet to make a page!");
}

function closeInfoSheet() {
  if (!infoSheet) return;
  infoSheet.classList.remove("open");
  infoSheet.setAttribute("aria-hidden", "true");
}

renderShopItems();

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
  if (event.key === "Escape") {
    closeInfoSheet();
  }
});
