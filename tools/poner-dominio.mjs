// Cuando Aroma Café tenga dominio, ejecuta:
//   node tools/poner-dominio.mjs https://aromacafeblanes.com
// Rellena la URL canónica, og:url, las imágenes absolutas para compartir
// (WhatsApp, redes) y en los datos estructurados, genera sitemap.xml y
// añade el Sitemap a robots.txt. Se puede volver a ejecutar sin problema.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(arg)) {
  console.error("Uso: node tools/poner-dominio.mjs https://tudominio.com");
  process.exit(1);
}
const base = arg + "/";
const archivo = path.join(RAIZ, "index.html");
let h = fs.readFileSync(archivo, "utf8");

h = h.replace(/  <!-- dominio:inicio -->[\s\S]*?<!-- dominio:fin -->\n/, "");
h = h.replace("  <!--DOMINIO-->\n", `  <!--DOMINIO-->
  <!-- dominio:inicio -->
  <link rel="canonical" href="${base}">
  <meta property="og:url" content="${base}">
  <!-- dominio:fin -->
`);
h = h.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${base}assets/img/compartir.jpg">`);
h = h.replace(/"image": "[^"]*compartir\.jpg"/, `"image": "${base}assets/img/compartir.jpg"`);
h = h.replace(/\n    "url": "[^"]*",/, "");
h = h.replace(`"name": "Aroma Café Blanes",`, `"name": "Aroma Café Blanes",\n    "url": "${base}",`);
fs.writeFileSync(archivo, h);

const hoy = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}</loc>
    <lastmod>${hoy}</lastmod>
  </url>
</urlset>
`);
const robots = fs.readFileSync(path.join(RAIZ, "robots.txt"), "utf8").replace(/\nSitemap:.*\n?/g, "\n").trimEnd();
fs.writeFileSync(path.join(RAIZ, "robots.txt"), robots + `\nSitemap: ${base}sitemap.xml\n`);
console.log("Dominio aplicado:", base);
