/* Minimal static file server for the repository.
 *
 * The site is a plain static bundle (no framework, no build step), so the browser suites
 * just need a predictable origin that serves files from the repository root. This uses
 * only Node's built-in modules - no framework and no runtime dependency.
 *
 * Usage:
 *   node scripts/serve-static.js            # http://127.0.0.1:8080
 *   node scripts/serve-static.js 9000       # custom port
 *   PORT=9000 node scripts/serve-static.js  # custom port via env
 *
 * Programmatic use (see scripts/harness-helpers.js and scripts/run-browser-tests.js):
 *   const { startStaticServer, isServerReachable } = require("./serve-static");
 */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8080;

/* MIME types for every extension the repository actually serves. */
const MIME_TYPES = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf"
});
const DEFAULT_MIME = "application/octet-stream";

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || DEFAULT_MIME;
}

/* Maps a request pathname to an absolute file inside rootDir, or null when the path
   escapes the served root (directory traversal) or contains a null byte. */
function resolveRequestPath(rootDir, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;

  const relative = decoded.replace(/^[/\\]+/, "");
  const resolved = path.resolve(rootDir, relative);
  if (resolved !== rootDir && !resolved.startsWith(rootDir + path.sep)) return null;
  return resolved;
}

function sendText(res, status, message) {
  const body = Buffer.from(message, "utf8");
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": String(body.length),
    "Cache-Control": "no-cache"
  });
  res.end(body);
}

function escapeText(value) {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  return String(value).replace(/[&<>"]/g, (character) => replacements[character]);
}

function sendHtml(res, status, title, message) {
  const body = Buffer.from(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body><h1>${title}</h1><p>${message}</p></body></html>`,
    "utf8"
  );
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": String(body.length),
    "Cache-Control": "no-cache"
  });
  res.end(body);
}

function sendNotFound(res, pathname) {
  sendHtml(res, 404, "404 Not Found", `No file was found at ${escapeText(pathname)}`);
}

function sendFile(req, res, filePath, stats) {
  res.writeHead(200, {
    "Content-Type": getMimeType(filePath),
    "Content-Length": String(stats.size),
    "Last-Modified": stats.mtime.toUTCString(),
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) sendText(res, 500, "500 Internal Server Error");
    else res.end();
  });
  stream.pipe(res);
}

async function handleRequest(req, res, rootDir) {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
    res.end("405 Method Not Allowed");
    return;
  }

  const requestUrl = String(req.url || "/");
  let pathname;
  try {
    pathname = new URL(requestUrl, "http://localhost").pathname;
  } catch {
    sendText(res, 400, "400 Bad Request");
    return;
  }

  const resolved = resolveRequestPath(rootDir, pathname);
  if (!resolved) {
    sendText(res, 403, "403 Forbidden");
    return;
  }

  let stats;
  try {
    stats = await fsp.stat(resolved);
  } catch {
    sendNotFound(res, pathname);
    return;
  }

  if (stats.isDirectory()) {
    /* Redirect /dir -> /dir/ (keeping the query) so relative links resolve correctly. */
    if (!pathname.endsWith("/")) {
      const [rawPath, search] = requestUrl.split("?");
      res.writeHead(301, { Location: rawPath + "/" + (search ? "?" + search : "") });
      res.end();
      return;
    }
    const indexPath = path.join(resolved, "index.html");
    let indexStats;
    try {
      indexStats = await fsp.stat(indexPath);
    } catch {
      sendNotFound(res, pathname);
      return;
    }
    if (!indexStats.isFile()) {
      sendNotFound(res, pathname);
      return;
    }
    sendFile(req, res, indexPath, indexStats);
    return;
  }

  if (!stats.isFile()) {
    sendNotFound(res, pathname);
    return;
  }

  sendFile(req, res, resolved, stats);
}

/* Creates the HTTP server. `options.root` defaults to the repository root;
   `options.log` receives a one-line message for unexpected errors only. */
function createStaticServer(options = {}) {
  const rootDir = options.root ? path.resolve(options.root) : REPO_ROOT;
  const log = typeof options.log === "function" ? options.log : () => {};
  return http.createServer((req, res) => {
    handleRequest(req, res, rootDir).catch((error) => {
      log(`500 ${req.method} ${req.url} - ${error.message}`);
      if (!res.headersSent) sendText(res, 500, "500 Internal Server Error");
      else res.end();
    });
  });
}

/* Starts the server and resolves once it is listening.
   Returns { server, host, port, url, close() }. When `unref` is not false the underlying
   server is unref'd, so an embedded server never keeps a script alive. */
function startStaticServer(options = {}) {
  const host = options.host || DEFAULT_HOST;
  const port = options.port === undefined || options.port === null ? DEFAULT_PORT : Number(options.port);
  const unref = options.unref !== false;
  const server = createStaticServer(options);

  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.removeListener("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.removeListener("error", onError);
      const address = server.address();
      const actualPort = address && typeof address === "object" ? address.port : port;
      if (unref) server.unref();
      resolve({
        server,
        host,
        port: actualPort,
        url: `http://${host}:${actualPort}`,
        close: () => new Promise((done) => server.close(() => done()))
      });
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

/* True when something already answers at `url` (for example a developer-run `npm run serve`). */
function isServerReachable(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    let target;
    try {
      target = new URL(url);
    } catch {
      finish(false);
      return;
    }

    const request = http.request(
      {
        method: "HEAD",
        hostname: target.hostname,
        port: target.port || 80,
        path: target.pathname || "/",
        timeout: timeoutMs
      },
      (response) => {
        response.resume();
        finish(true);
      }
    );
    request.on("timeout", () => {
      request.destroy();
      finish(false);
    });
    request.on("error", () => finish(false));
    request.end();
  });
}

if (require.main === module) {
  const cliPort = process.env.PORT || process.argv[2];
  const host = process.env.HOST || DEFAULT_HOST;
  const port = cliPort ? Number(cliPort) : DEFAULT_PORT;
  startStaticServer({ host, port, unref: false })
    .then((handle) => {
      console.log(`Static server running at ${handle.url}`);
      console.log(`Serving root: ${REPO_ROOT}`);
      console.log("Press Ctrl+C to stop.");
    })
    .catch((error) => {
      console.error(`Could not start the static server on ${host}:${port}`);
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  REPO_ROOT,
  DEFAULT_HOST,
  DEFAULT_PORT,
  getMimeType,
  resolveRequestPath,
  createStaticServer,
  startStaticServer,
  isServerReachable
};
