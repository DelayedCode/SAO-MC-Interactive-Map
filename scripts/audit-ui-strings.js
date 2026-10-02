const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

// Only check actual UI files (not data files, not scripts, not node_modules)
const uiFiles = [
  "index.html",
  "Aincrad/Bestiary/bestiary.html",
  "Aincrad/Bestiary/bestiary.js",
  "Aincrad/Character Build/character-build.html",
  "Aincrad/Character Build/character-build.js",
  "Aincrad/Map/maps.html",
  "Aincrad/Map/maps.js",
  "Aincrad/eCompendium/ecompendium.html",
  "Aincrad/eCompendium/ecompendium.js",
  "Aincrad/Quests/quests.html",
  "Aincrad/Quests/quests.js",
  "Aincrad/Patchnotes/patchnotes.html",
  "Aincrad/Patchnotes/patchnotes.js",
  "Aincrad/Misc Info/miscinfo.html",
  "Aincrad/Misc Info/miscinfo.js",
  "Fractured Underworld/Main UI/mainui.html",
  "Fractured Underworld/Main UI/mainui.js",
  "Fractured Underworld/Tower Defense/towerdefense.html",
  "Fractured Underworld/Tower Defense/towerdefense.js",
  "Fractured Underworld/Compendium/compendium.html",
  "Fractured Underworld/Compendium/compendium.js"
];

function checkHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines with data-i18n attributes (already localized)
    if (line.includes("data-i18n")) {
      continue;
    }

    // Skip comments
    if (line.includes("<!--")) {
      continue;
    }

    // Skip script tags and their content
    if (line.includes("<script") || line.includes("</script>")) {
      continue;
    }

    // Look for text between tags that might be user-facing
    const textContent = line.match(/>([^<]{4,})</);
    if (textContent) {
      const text = textContent[1].trim();

      // Skip if it's technical content
      const skipPatterns = [
        /^\d+$/,
        /^[a-z\-_]+$/,
        /^(rgba?|hsl|url|path|circle|rect|line|svg|div|span|button|input|label|href|src|alt|id|class|style|width|height|top|left|right|bottom|position|display|flex|grid|background|color|border|padding|margin|overflow|z-index|opacity|transform|transition|animation|filter|cursor|pointer|default|none|block|inline|visible|hidden|scroll|auto|fixed|relative|absolute|sticky|static|inherit|initial|unset|revert|all|contents|webkit|moz|ms|o)/i,
        /^(http|https|www|ftp|file|data|blob|mailto|tel|sms|geo|javascript):/i,
        /^[{};:,\.\-_\[\]()=<>\/"'\s]+$/
      ];

      const shouldSkip = skipPatterns.some((pattern) => pattern.test(text));

      if (!shouldSkip) {
        // Check if it looks like English text (starts with capital letter, contains spaces)
        if (/^[A-Z][a-zA-Z\s]{4,}/.test(text) && text.includes(" ")) {
          issues.push({
            type: "potential-hardcoded-text",
            text: text,
            line: i + 1
          });
        }
      }
    }
  }

  return issues;
}

function checkJsFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines with translations (SAOI18n.t)
    if (line.includes("SAOI18n.t") || line.includes("t(")) {
      continue;
    }

    // Skip comments
    if (line.trim().startsWith("//") || line.includes("/*")) {
      continue;
    }

    // Look for quoted strings that might be user-facing
    const stringMatch = line.match(/["']([A-Z][a-zA-Z\s]{5,}[^"']*)["']/);
    if (stringMatch) {
      const text = stringMatch[1];

      // Skip technical terms
      const skipTerms = [
        "console",
        "error",
        "warn",
        "log",
        "length",
        "height",
        "width",
        "top",
        "left",
        "right",
        "bottom",
        "background",
        "color",
        "border",
        "padding",
        "margin",
        "display",
        "flex",
        "grid",
        "position",
        "absolute",
        "relative",
        "fixed",
        "sticky",
        "none",
        "block",
        "inline",
        "visible",
        "hidden",
        "scroll",
        "auto",
        "overflow",
        "z-index",
        "opacity",
        "transform",
        "transition",
        "animation",
        "filter",
        "cursor",
        "pointer",
        "default",
        "text",
        "input",
        "button",
        "select",
        "textarea",
        "div",
        "span",
        "body",
        "html",
        "document",
        "window",
        "navigator",
        "history",
        "location",
        "localStorage",
        "sessionStorage",
        "JSON",
        "Math",
        "Date",
        "Array",
        "Object",
        "String",
        "Number",
        "Boolean",
        "Promise",
        "Error",
        "function",
        "const",
        "let",
        "var",
        "return",
        "if",
        "else",
        "for",
        "while",
        "switch",
        "case",
        "break",
        "continue",
        "try",
        "catch",
        "finally",
        "throw",
        "new",
        "this",
        "class",
        "extends",
        "super",
        "static",
        "get",
        "set",
        "import",
        "export",
        "default",
        "from",
        "typeof",
        "instanceof",
        "in",
        "of",
        "null",
        "undefined",
        "true",
        "false",
        "NaN",
        "Infinity"
      ];

      if (!skipTerms.includes(text)) {
        // Check if it looks like user-facing text
        if (text.includes(" ") && /^[A-Z]/.test(text)) {
          issues.push({
            type: "potential-hardcoded-js-string",
            text: text,
            line: i + 1
          });
        }
      }
    }
  }

  return issues;
}

console.log("Auditing UI files for hardcoded user-facing strings...\n");

const allIssues = [];

for (const file of uiFiles) {
  const filePath = path.join(root, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${file}`);
    continue;
  }

  let issues = [];

  if (file.endsWith(".html")) {
    issues = checkHtmlFile(filePath);
  } else if (file.endsWith(".js")) {
    issues = checkJsFile(filePath);
  }

  if (issues.length > 0) {
    allIssues.push({
      file: file,
      issues
    });
  }
}

console.log(JSON.stringify({ filesChecked: uiFiles.length, issues: allIssues }, null, 2));

if (allIssues.length === 0) {
  console.log("\n✓ No hardcoded user-facing strings found in UI files.");
  console.log("All user-facing text uses the localization system (data-i18n or SAOI18n.t).");
} else {
  console.log(`\n⚠ Found ${allIssues.length} files with potential hardcoded user-facing strings.`);
  allIssues.forEach(({ file, issues }) => {
    console.log(`\n${file}:`);
    issues.forEach((issue) => {
      console.log(`  - ${issue.type}: "${issue.text}" (line ${issue.line})`);
    });
  });
}

process.exitCode = allIssues.length > 0 ? 1 : 0;
