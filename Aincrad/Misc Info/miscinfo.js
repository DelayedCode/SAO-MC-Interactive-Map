(function () {
  "use strict";

  const i18n = window.SAOI18n || null;
  const { t, content } = window.SAOPageHelpers.createTranslators(i18n);

  /* The UI bundle already carries localized copies of this table, so read it through t() first;
     the content dictionary value and the English literal stay as fallbacks for other datasets. */
  function progressionTableSource() {
    const key = "page.miscinfo.playerLevelsDetails";
    const translated = t(key);
    if (translated !== key) return translated;
    return content(
      key,
      "Level 1 -> 2: 150 XP\nLevel 2 -> 3: 300 XP\nLevel 3 -> 4: 600 XP\nLevel 4 -> 5: 1,350 XP\nLevel 5 -> 6: 2,700 XP\nLevel 6 -> 7: 5,100 XP\nLevel 7 -> 8: 9,000 XP\nLevel 8 -> 9: 15,000 XP\nLevel 9 -> 10: 24,000 XP"
    );
  }

  function renderProgression() {
    const root = document.getElementById("progressionTableRoot");
    if (!root) return;

    const source = progressionTableSource();
    const entries = String(source)
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/(\d+)\s*->\s*(\d+)[^0-9]+([\d.,\s]+)\s*XP/i);
        return match ? { from: match[1], to: match[2], xp: match[3].trim() } : null;
      })
      .filter(Boolean);

    if (!entries.length) {
      root.textContent = source;
      return;
    }

    const rows = entries
      .map((entry) => `<tr><td>${entry.from}</td><td>${entry.to}</td><td>${entry.xp} XP</td></tr>`)
      .join("");
    root.innerHTML = `<table class="progression-table"><thead><tr><th>${t("page.miscinfo.currentLevel")}</th><th>${t("page.miscinfo.nextLevel")}</th><th>${t("page.miscinfo.xpToNextLevel")}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function init() {
    renderProgression();
    document.addEventListener("sao:languagechange", () => {
      renderProgression();
    });
  }

  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
