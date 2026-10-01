// Descarga de OpenStreetMap (Overpass) la costa, playas, puerto y calles del
// centro de Blanes para dibujar la carta. Datos © colaboradores de OpenStreetMap (ODbL).
import fs from "node:fs";
const BBOX = "41.6655,2.7815,41.6800,2.8010"; // sur, oeste, norte, este
const q = `[out:json][timeout:60];
(
  way["natural"="coastline"](${BBOX});
  way["natural"="beach"](${BBOX});
  way["man_made"~"breakwater|pier|groyne"](${BBOX});
  way["harbour"](${BBOX});
  way["leisure"="marina"](${BBOX});
  way["highway"~"primary|secondary|tertiary|residential|pedestrian|living_street|unclassified|service|footway"](${BBOX});
  way["natural"~"bare_rock|cliff|wood|scrub"](${BBOX});
  node["natural"~"peak|rock|cape"](${BBOX});
  node["place"](${BBOX});
);
out geom tags;`;
const r = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "aroma-cafe-web/1.0" },
  body: "data=" + encodeURIComponent(q),
});
if (!r.ok) { console.log("FALLO", r.status, await r.text()); process.exit(1); }
const j = await r.json();
fs.writeFileSync("assets/photos/source/osm/blanes.json", JSON.stringify(j));
const cuenta = {};
for (const e of j.elements) {
  const t = e.tags || {};
  const k = t.natural || t.highway || t.man_made || t.leisure || t.harbour || t.place || "otro";
  cuenta[k] = (cuenta[k] || 0) + 1;
}
console.log(j.elements.length, cuenta);
