// Copies the web app (../calorie-tracker) into www/ for Capacitor, leaving out dev files.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "calorie-tracker"), DST = path.join(__dirname, "www");
const SKIP = new Set([".git", ".gitignore", "img-originals", "openai-key.txt", "README.md", ".claude"]);
fs.rmSync(DST, { recursive: true, force: true });
function copy(s, d) {
  for (const name of fs.readdirSync(s)) {
    if (SKIP.has(name)) continue;
    const a = path.join(s, name), b = path.join(d, name);
    if (fs.statSync(a).isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); }
    else { fs.mkdirSync(d, { recursive: true }); fs.copyFileSync(a, b); }
  }
}
copy(SRC, DST);
// the native shell must not register the web service worker (Capacitor serves files itself)
const idx = path.join(DST, "index.html");
fs.writeFileSync(idx, fs.readFileSync(idx, "utf8").replace('if("serviceWorker" in navigator && location.protocol.startsWith("http"))', 'if("serviceWorker" in navigator && location.protocol.startsWith("http") && !window.Capacitor)'));
console.log("www ready:", fs.readdirSync(DST).length, "entries");
