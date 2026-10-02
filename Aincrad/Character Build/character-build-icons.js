(function (global) {
  "use strict";

  const paths = {
    build:
      '<circle cx="9" cy="7" r="3"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="M15 5h6M18 2v6"/>',
    character:
      '<circle cx="12" cy="7" r="3.2"/><path d="M5 20v-1.2A5.8 5.8 0 0 1 10.8 13h2.4A5.8 5.8 0 0 1 19 18.8V20"/>',
    equipment: '<path d="m7 4 5 2 5-2 4 4-2 4-2-1v9H7v-9l-2 1-2-4Z"/><path d="M8 5v6l4 2 4-2V5M12 13v7"/>',
    weapons: '<path d="M4 4 20 20M13 4 4 13M16 8l3-3M6 18l-2 2"/><path d="M10 14 6 18M14 10l4-4"/>',
    armor: '<path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6Z"/><path d="M12 6v12M8 9h8"/>',
    stats:
      '<path d="M5 18.5V9.5M9 18.5V6.5M13 18.5V11.5M17 18.5V8.5"/><path d="M4.5 18.5h15"/><path d="M6.5 7.5 9.5 10.2 12.6 8.4 17.5 5.5"/>',
    skills:
      '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v5M12 12 6 16M12 12l6 4"/>',
    calculations:
      '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h8"/>',
    saved: '<path d="M6 4h12a2 2 0 0 1 2 2v14l-8-4-8 4V6a2 2 0 0 1 2-2Z"/><path d="m9 11 2 2 4-4"/>',
    reset: '<path d="M5 8a8 8 0 1 1-1 7"/><path d="M5 4v4h4"/>',
    current: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    beta: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M8 12h8M12 8v8"/>',
    rune: '<path d="m12 3 7 9-7 9-7-9Z"/><path d="M12 7v10M9 12h6"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>'
  };
  const imagePaths = Object.freeze({
    helmet: "Helmet.png",
    chestplate: "Chestplate.png",
    leggings: "Leggings.png",
    boots: "Boots.png",
    amulet: "Amulet.png",
    ring: "Ring.png",
    bracelet: "Bracelet.png",
    glove: "Glove.png",
    artifact: "Artifact.png",
    shield: "Offhand.png",
    sword: "Main%20Weapon.png"
  });
  const imageClasses = Object.freeze({
    helmet: "cb-icon--helmet",
    chestplate: "cb-icon--chestplate",
    leggings: "cb-icon--leggings",
    boots: "cb-icon--boots",
    amulet: "cb-icon--amulet",
    ring: "cb-icon--ring",
    bracelet: "cb-icon--bracelet",
    glove: "cb-icon--glove",
    artifact: "cb-icon--artifact",
    shield: "cb-icon--shield",
    sword: "cb-icon--sword"
  });

  const skillPaths = {
    root: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4m0 10v4M3 12h4m10 0h4"/>',
    branchA: '<path d="m12 3 3 6 6 .8-4.4 4.3 1 6.1-5.6-2.9-5.6 2.9 1-6.1L3 9.8 9 9Z"/>',
    branchB: '<path d="M12 3v18M5 8h14M7 16h10"/><path d="m5 8 2-3 2 3m8 0 2-3 2 3"/>'
  };

  function markup(name, options = {}) {
    if (imagePaths[name]) {
      return `<img class="cb-icon cb-icon-image ${imageClasses[name]}" src="${imagePaths[name]}" alt="" aria-hidden="true">`;
    }
    const content = paths[name] || paths.build;
    const className = ` class="cb-icon${options.className ? ` ${options.className}` : ""}"`;
    const label = options.label
      ? ` role="img" aria-label="${String(options.label).replace(/"/g, "&quot;")}"`
      : ' aria-hidden="true"';
    return `<svg${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${label}>${content}</svg>`;
  }

  function skill(name) {
    return `<svg class="cb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${skillPaths[name] || skillPaths.root}</svg>`;
  }

  global.CharacterBuildIcons = Object.freeze({ markup, skill, names: Object.freeze(Object.keys(paths)) });
})(window);
