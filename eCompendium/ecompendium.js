const equipmentEntries = [];

function renderEquipmentList(entries) {
  const root = document.getElementById("equipmentRoot");
  if (!root) {
    return;
  }

  if (!entries.length) {
    root.innerHTML = '<p class="empty-state">No equipment entries yet.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach(entry => {
    const card = document.createElement("article");
    card.className = "equipment-card";
    card.textContent = entry.name;
    fragment.appendChild(card);
  });

  root.replaceChildren(fragment);
}

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const equipmentSearch = document.getElementById("equipmentSearch");

  if (status) {
    status.textContent = "Equipment compendium module ready. Add armor, weapons, and stats here.";
  }

  if (!equipmentSearch) {
    renderEquipmentList(equipmentEntries);
    return;
  }

  function updateEquipmentList() {
    const query = equipmentSearch.value.trim().toLowerCase();
    const visibleEntries = query
      ? equipmentEntries.filter(entry => entry.name.toLowerCase().includes(query))
      : equipmentEntries;
    renderEquipmentList(visibleEntries);
  }

  equipmentSearch.addEventListener("input", updateEquipmentList);
  updateEquipmentList();
});
