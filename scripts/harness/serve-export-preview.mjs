import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const host = process.env.SMOKE_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.SMOKE_PORT ?? "3200", 10);
const appBasePath = (process.env.PLAYWRIGHT_APP_BASE_PATH ?? "/ark-str").replace(/^\/+|\/+$/g, "");
const repoRoot = process.cwd();
const exportRoot = path.join(repoRoot, "ark-str-web-app", ".next-export");
const previewRoot = path.join(
  repoRoot,
  "artifacts",
  "playwright",
  `export-preview-${process.pid}`,
);
const previewAppRoot = path.join(previewRoot, appBasePath);

function ensurePreviewTree() {
  if (!fs.existsSync(exportRoot)) {
    throw new Error("ark-str-web-app/.next-export is missing. Run `npm run app:verify` before smoke.");
  }

  fs.mkdirSync(path.dirname(previewAppRoot), { recursive: true });

  try {
    fs.symlinkSync(exportRoot, previewAppRoot, "dir");
  } catch {
    fs.mkdirSync(previewAppRoot, { recursive: true });
    fs.cpSync(exportRoot, previewAppRoot, { recursive: true });
  }
}

function resolveResponsePath(urlPathname) {
  const safePath = path
    .normalize(decodeURIComponent(urlPathname))
    .replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = path.join(previewRoot, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    return path.join(previewAppRoot, "404.html");
  }

  return filePath;
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

ensurePreviewTree();

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  const filePath = resolveResponsePath(requestUrl.pathname);
  const statusCode = filePath.endsWith("404.html") ? 404 : 200;

  try {
    response.writeHead(statusCode, {
      "Content-Type": getContentType(filePath),
    });
    response.end(fs.readFileSync(filePath));
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`export preview server listening on http://${host}:${port}/${appBasePath}/`);
});
