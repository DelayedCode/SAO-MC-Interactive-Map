const fs = require("fs");
const vm = require("vm");

const source = [
  fs.readFileSync("Aincrad/Map/mapData.js", "utf8"),
  fs.readFileSync("Aincrad/Map/maps_floor1.js", "utf8"),
  fs.readFileSync("Aincrad/Map/maps_floor2.js", "utf8"),
  fs.readFileSync("Aincrad/Map/maps_floor3.js", "utf8"),
  fs.readFileSync("Aincrad/Map/maps_mainquests.js", "utf8"),
  fs.readFileSync("Aincrad/Map/maps_current.js", "utf8")
].join("\n;\n");

const ctx = vm.createContext({ console });
vm.runInContext(`${source}\nthis.__data = DATA;`, ctx);
const data = ctx.__data;
console.log("total markers:", Object.keys(data).length);

const currentMarkers = Object.values(data).filter((m) => m.dataset === "current" && m.coords);
console.log("current markers:", currentMarkers.length);
const other = Object.values(data).filter((m) => !m.dataset || m.dataset !== "current");

console.log("\n=== current markers vs other markers within 40 blocks ===");
for (const cm of currentMarkers) {
  for (const fm of other) {
    if (!fm.coords) continue;
    const dx = fm.coords.x - cm.coords.x;
    const dz = fm.coords.z - cm.coords.z;
    const d = Math.hypot(dx, dz);
    if (d < 40) {
      console.log(
        `current ${cm.title} (${cm.coords.x},${cm.coords.z}) ~ ${fm.title} (${fm.coords.x},${fm.coords.z}) d=${d.toFixed(1)} delta=(${dx},${dz})`
      );
    }
  }
}

console.log("\n=== known .dat landmarks: migrated floor coords vs dat + (2,12) ===");
const datCoords = {
  "Swamp Putride": [1343, 3051],
  Vallhat: [448, 3038],
  Cyclorim: [1165, 3540],
  Hanaka: [1484, 3425],
  "Town of Beginnings": [1800, 4282],
  "Petals Valley": [1007, 4159],
  "Valley of Wolfs": [2553, 3848],
  "Abandoned Castle": [2839, 4682],
  "Ika Archipelago": [3299, 4084],
  Mizunari: [3139, 3673],
  "Geldorak Mine": [4171, 3879],
  "OG District": [2308, 3252]
};
for (const [title, [dx, dz]] of Object.entries(datCoords)) {
  const marker = Object.values(data).find((m) => m.title === title && m.category === "biomes");
  if (!marker) {
    console.log(title, ": marker not found");
    continue;
  }
  const expected = { x: dx + 2, z: dz + 12 };
  const match = marker.coords.x === expected.x && marker.coords.z === expected.z;
  console.log(
    `${title}: floor1=(${marker.coords.x},${marker.coords.z}) dat+2/12=(${expected.x},${expected.z}) ${match ? "MATCH" : "MISMATCH"}`
  );
}
