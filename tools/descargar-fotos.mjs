// Descarga las fotos originales del negocio (Google Maps / Instagram) a
// assets/photos/source/. Herramienta de desarrollo: no se sube al hosting.
// Uso: node tools/descargar-fotos.mjs lista.txt carpeta-destino prefijo
import fs from "node:fs";
import path from "node:path";

const [lista, destino, prefijo = "g"] = process.argv.slice(2);
const urls = fs.readFileSync(lista, "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
fs.mkdirSync(destino, { recursive: true });

let i = 0;
for (const u of urls) {
  i++;
  const nombre = path.join(destino, `${prefijo}${String(i).padStart(2, "0")}.jpg`);
  if (fs.existsSync(nombre)) continue;
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) { console.log("FALLO", r.status, u.slice(0, 80)); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(nombre, buf);
    console.log(path.basename(nombre), (buf.length / 1024).toFixed(0) + " KB");
  } catch (e) {
    console.log("ERROR", e.message, u.slice(0, 80));
  }
}
