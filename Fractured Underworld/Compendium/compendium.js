const params = new URLSearchParams(window.location.search);
const floor = params.get("floor");
const list = document.getElementById("entryList");
const status = document.getElementById("status");
const listTitle = document.getElementById("listTitle");
const categoryNav = document.getElementById("categoryNav");
const searchInput = document.getElementById("compendiumSearch");
const i18n = window.SAOI18n || null;
const t = (key, params) => (i18n ? i18n.t(key, params) : key);
const content = (key, fallback) => (i18n && typeof i18n.content === "function"
  ? i18n.content(key, fallback)
  : fallback);

let activeCategory = "";
let activeEntries = [];

function safeText(value) {
  return String(value ?? "");
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyContentId(value) {
  return safeText(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function localizeCategory(category) {
  const normalized = slugifyContentId(category).replace(/-([a-z])/g, (_match, character) => character.toUpperCase());
  const key = `page.uwcompendium.categories.${normalized}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

function getEntryId(entry) {
  return entry.id || slugifyContentId(entry.name);
}

function getEntryText(entry, field) {
  const value = safeText(entry[field]);
  return content(`uwcompendium.${getEntryId(entry)}.${field}`, value);
}

function buildNavUrl(target) {
  const paths = {
    towerDefense: "../Tower Defense/towerdefense.html",
    compendium: "compendium.html",
    mainui: "../Main UI/mainui.html"
  };
  const url = new URL(paths[target], window.location.href);
  if (floor) url.searchParams.set("floor", floor);
  return url.href;
}

function getCategories(entries) {
  return [...new Set(entries.map(entry => safeText(entry.category).trim()).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second));
}

function renderCategories(entries) {
  if (!categoryNav) return;

  const categories = getCategories(entries);
  if (!categories.includes(activeCategory)) {
    activeCategory = categories[0] || "";
  }

  categoryNav.replaceChildren(...categories.map(category => {
    const button = document.createElement("button");
    const isActive = category === activeCategory;
    button.type = "button";
    button.className = `category-tab${isActive ? " is-active" : ""}`;
    button.dataset.category = category;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
    button.textContent = localizeCategory(category);
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories(entries);
      renderEntries(entries);
    });
    return button;
  }));
}

function getSearchableText(entry) {
  return [
    entry.name,
    entry.category,
    entry.type,
    entry.description,
    entry.details,
    entry.cost,
    entry.requirement,
    getEntryText(entry, "name"),
    getEntryText(entry, "category"),
    getEntryText(entry, "description"),
    getEntryText(entry, "details")
  ].map(safeText).join(" ").toLowerCase();
}

function renderOptionalField(label, value) {
  if (value === undefined || value === null || value === "") return "";
  return `<div class="entry-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderObjectSection(title, value) {
  if (!value || typeof value !== "object") return "";
  const rows = Object.entries(value).map(([key, item]) =>
    `<li><span>${escapeHtml(key)}</span><strong>${escapeHtml(item)}</strong></li>`
  ).join("");
  return rows ? `<section class="entry-section"><h3>${escapeHtml(title)}</h3><ul class="entry-stats">${rows}</ul></section>` : "";
}

function renderEntryCard(entry) {
  const name = getEntryText(entry, "name") || t("page.uwcompendium.unknown");
  const category = localizeCategory(getEntryText(entry, "category"));
  const description = getEntryText(entry, "description");
  const details = getEntryText(entry, "details");
  const stats = renderObjectSection(t("page.uwcompendium.statistics"), entry.stats);
  const knownFields = ["name", "category", "type", "description", "details", "stats"];
  const extraFields = Object.entries(entry)
    .filter(([key, value]) => !knownFields.includes(key) && value !== undefined && value !== null && value !== "" && typeof value !== "object")
    .map(([key, value]) => renderOptionalField(key, value))
    .join("");

  return `
    <article class="entry-card">
      <div class="entry-card-header">
        <div>
          <p class="entry-kicker">${escapeHtml(category)}</p>
          <h2>${escapeHtml(name)}</h2>
        </div>
        ${renderOptionalField(t("page.uwcompendium.type"), entry.type)}
      </div>
      ${renderOptionalField(t("page.uwcompendium.category"), category)}
      ${renderOptionalField(t("page.uwcompendium.costRequirement"), entry.cost || entry.requirement)}
      ${description ? `<section class="entry-section"><h3>${escapeHtml(t("page.uwcompendium.description"))}</h3><p>${escapeHtml(description)}</p></section>` : ""}
      ${details ? `<section class="entry-section"><h3>${escapeHtml(t("page.uwcompendium.details"))}</h3><p>${escapeHtml(details)}</p></section>` : ""}
      ${stats}
      ${extraFields ? `<div class="entry-fields">${extraFields}</div>` : ""}
    </article>
  `;
}

function renderEntries(entries) {
  const categoryEntries = entries.filter(entry => safeText(entry.category).trim() === activeCategory);
  const query = safeText(searchInput?.value).trim().toLowerCase();
  const visibleEntries = categoryEntries.filter(entry => getSearchableText(entry).includes(query));

  if (status) {
    status.textContent = t("page.uwcompendium.statusShown", {
      visible: visibleEntries.length,
      total: categoryEntries.length
    });
  }
  if (listTitle) listTitle.textContent = activeCategory ? localizeCategory(activeCategory) : t("page.uwcompendium.entries");

  if (!visibleEntries.length) {
    list.innerHTML = `<p class="empty-state">${escapeHtml(t("page.uwcompendium.noEntries"))}</p>`;
    return;
  }

  list.innerHTML = visibleEntries.map(renderEntryCard).join("");
}

function render() {
  if (window.SAODatasets?.getDatasetFromLocation() !== "current") {
    if (status) status.textContent = t("page.uwcompendium.unavailable");
    if (list) list.innerHTML = `<p class="empty-state">${escapeHtml(t("page.uwcompendium.insufficientInfo"))}</p>`;
    return;
  }

  activeEntries = Array.isArray(window.SAO_CURRENT_FU_COMPENDIUM_DATA)
    ? window.SAO_CURRENT_FU_COMPENDIUM_DATA
    : [];
  renderCategories(activeEntries);
  renderEntries(activeEntries);
}

document.querySelector(".top-nav")?.addEventListener("click", event => {
  const button = event.target.closest("button[data-nav-target]");
  if (!button) return;
  const target = button.dataset.navTarget;
  const url = buildNavUrl(target);
  if (window.SAODatasets?.affectedSections.has(target)) {
    event.preventDefault();
    window.SAODatasets.installStyles();
    window.SAODatasets.navigate({ section: target, url, title: button.textContent.trim() });
    return;
  }
  window.location.href = url;
});

searchInput?.addEventListener("input", () => renderEntries(activeEntries));
document.addEventListener("sao:languagechange", render);
render();
