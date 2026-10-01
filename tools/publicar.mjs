// Publica la web en la rama "web" de GitHub. Hostinger la tiene conectada
// con "Despliegue desde GitHub" (hPanel > Avanzado > Git): cada envío a esa
// rama se copia a public_html.
//
//   1. Copia solo lo que se sirve (ni herramientas, ni originales de fotos).
//   2. Pone una versión nueva (?v=) a styles.css y main.js para que nadie
//      vea la versión anterior guardada en caché.
//   3. Hace un commit en la rama "web" y lo envía a GitHub.
//
// Uso: node tools/publicar.mjs ["mensaje"]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRABAJO = path.join(RAIZ, ".web");
const RAMA = "web";
const sh = (cmd, cwd = RAIZ) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

// Lo que se publica
const PUBLICO = [
  "index.html", "styles.css", "main.js", ".htaccess", "robots.txt", "sitemap.xml",
  "favicon.svg", "apple-touch-icon.png", "assets/img", "assets/fonts",
];

const mensaje = process.argv[2] || "Publicar: " + sh("git log -1 --format=%s");

if (!fs.existsSync(TRABAJO)) {
  const existe = sh(`git ls-remote --heads origin ${RAMA}`);
  if (existe) {
    sh(`git fetch origin ${RAMA}:${RAMA}`);
    sh(`git worktree add "${TRABAJO}" ${RAMA}`);
  } else {
    sh(`git worktree add --detach "${TRABAJO}"`);
    sh(`git checkout --orphan ${RAMA}`, TRABAJO);
  }
}

for (const n of fs.readdirSync(TRABAJO)) if (n !== ".git") fs.rmSync(path.join(TRABAJO, n), { recursive: true, force: true });
for (const p of PUBLICO) {
  const origen = path.join(RAIZ, p);
  if (fs.existsSync(origen)) fs.cpSync(origen, path.join(TRABAJO, p), { recursive: true });
}

const v = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
const html = path.join(TRABAJO, "index.html");
fs.writeFileSync(html, fs.readFileSync(html, "utf8").replace(/\?v=\d+/g, "?v=" + v));

sh("git add -A", TRABAJO);
if (!sh("git status --porcelain", TRABAJO)) { console.log("Nada nuevo que publicar."); process.exit(0); }
execSync(`git commit -q -m ${JSON.stringify(mensaje)}`, { cwd: TRABAJO, stdio: "inherit" });
execSync(`git push -q -u origin ${RAMA}`, { cwd: TRABAJO, stdio: "inherit" });
console.log(`Enviado a GitHub (rama ${RAMA}). Hostinger lo publica en unos segundos.`);
