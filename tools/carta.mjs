// Dibuja la carta de la Badia de Blanes (SVG) a partir de los datos de
// OpenStreetMap descargados con tools/osm-descargar.mjs.
// Datos © colaboradores de OpenStreetMap (ODbL). Uso: node tools/carta.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, "assets/photos/source/osm/blanes.json"), "utf8"));

// Ventana: 1 unidad = 1 metro. Norte arriba.
const W = 1800, H = 1000;
const LON0 = 2.7795, LAT0 = 41.6773;
const KX = 111320 * Math.cos((41.673 * Math.PI) / 180), KY = 110540;
const X = lon => (lon - LON0) * KX;
const Y = lat => (LAT0 - lat) * KY;
const P = p => [X(p.lon), Y(p.lat)];
const r1 = n => Math.round(n * 10) / 10;

// Simplificación Douglas-Peucker
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const [p0, pn] = [pts[0], pts[pts.length - 1]];
  if (p0[0] === pn[0] && p0[1] === pn[1] && pts.length > 4) {
    // anillo cerrado: se parte por el punto más lejano para no colapsarlo
    let lejos = 1, dm = 0;
    pts.forEach((q, i) => { const dd = Math.hypot(q[0] - p0[0], q[1] - p0[1]); if (dd > dm) { dm = dd; lejos = i; } });
    return simplificar(pts.slice(0, lejos + 1), tol).slice(0, -1).concat(simplificar(pts.slice(lejos), tol));
  }
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const d = Math.abs((b[1] - a[1]) * x - (b[0] - a[0]) * y + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [a, b];
  return simplificar(pts.slice(0, idx + 1), tol).slice(0, -1).concat(simplificar(pts.slice(idx), tol));
}
const dentro = pts => pts.some(([x, y]) => x > -150 && x < 1800 + 150 && y > -150 && y < 1000 + 150);
const d = (pts, cerrar) => "M" + pts.map(([x, y]) => r1(x) + " " + r1(y)).join("L") + (cerrar ? "Z" : "");

// ---------- Costa ----------
const clave = p => p.lat.toFixed(7) + "," + p.lon.toFixed(7);
let tramos = datos.elements.filter(e => e.tags && e.tags.natural === "coastline").map(e => e.geometry.slice());
const cadenas = [];
while (tramos.length) {
  let c = tramos.shift(), creció = true;
  while (creció) {
    creció = false;
    for (let i = 0; i < tramos.length; i++) {
      const t = tramos[i];
      if (clave(t[0]) === clave(c[c.length - 1])) { c = c.concat(t.slice(1)); tramos.splice(i, 1); creció = true; break; }
      if (clave(t[t.length - 1]) === clave(c[0])) { c = t.concat(c.slice(1)); tramos.splice(i, 1); creció = true; break; }
    }
  }
  cadenas.push(c);
}
const principal = cadenas.reduce((a, b) => (b.length > a.length ? b : a));
const costa = simplificar(principal.map(P), 0.8);
const islotes = cadenas.filter(c => c !== principal && clave(c[0]) === clave(c[c.length - 1])).map(c => simplificar(c.map(P), 0.5));
// La costa va de suroeste a noreste con el mar a la derecha (sureste).
const [ini, fin] = [costa[0], costa[costa.length - 1]];
const tierra = costa.concat([[fin[0] + 4000, fin[1]], [fin[0] + 4000, -4000], [ini[0] - 4000, -4000], [ini[0] - 4000, ini[1]]]);

// ---------- Calles ----------
const calles = { mayor: [], menor: [], peatonal: [] };
let dintre = [];
for (const e of datos.elements) {
  const t = e.tags || {};
  if (!t.highway || !e.geometry) continue;
  const pts = simplificar(e.geometry.map(P), 1.2);
  if (!dentro(pts)) continue;
  if (t.name === "Passeig de Dintre") dintre.push(pts);
  if (/secondary|tertiary|primary/.test(t.highway)) calles.mayor.push(pts);
  else if (/pedestrian|living_street|footway/.test(t.highway)) calles.peatonal.push(pts);
  else calles.menor.push(pts);
}
// Passeig de Dintre (zona peatonal): eje recto entre sus extremos, desplazado tierra adentro para el rótulo
const ptsDintre = dintre.flat();
const dir = [Math.SQRT1_2, -Math.SQRT1_2]; // de suroeste a noreste
const proy = q => q[0] * dir[0] + q[1] * dir[1];
const pa = ptsDintre.reduce((a, b) => (proy(b) < proy(a) ? b : a));
const pb = ptsDintre.reduce((a, b) => (proy(b) > proy(a) ? b : a));
const nor = [-dir[1] * -1, -dir[0]]; // perpendicular hacia el noroeste
const eje = [[pa[0] - 22 * Math.SQRT1_2, pa[1] - 22 * Math.SQRT1_2], [pb[0] - 22 * Math.SQRT1_2, pb[1] - 22 * Math.SQRT1_2]];

// Espigones del puerto
const espigones = datos.elements.filter(e => e.tags && /pier|breakwater|groyne/.test(e.tags.man_made || "")).map(e => e.geometry.map(P));

// ---------- Puntos con nombre ----------
const nodo = n => datos.elements.find(e => e.type === "node" && e.tags && e.tags.name === n);
const palomera = P(nodo("sa Palomera"));
const aroma = [X(2.7910103), Y(41.6731067)];

// ---------- Rosa de los vientos (geometría) ----------
function rosa(cx, cy, r) {
  let s = `<g class="rosa" transform="translate(${cx} ${cy})">`;
  s += `<circle r="${r}" /><circle r="${r - 9}" /><circle r="${r * 0.28}" />`;
  for (let a = 0; a < 360; a += 5) {
    const l = a % 30 === 0 ? 9 : a % 10 === 0 ? 6 : 3.5;
    const rad = (a - 90) * Math.PI / 180;
    s += `<line x1="${r1(Math.cos(rad) * (r - 9))}" y1="${r1(Math.sin(rad) * (r - 9))}" x2="${r1(Math.cos(rad) * (r - 9 + l))}" y2="${r1(Math.sin(rad) * (r - 9 + l))}" />`;
    if (a % 30 === 0) s += `<text x="${r1(Math.cos(rad) * (r + 11))}" y="${r1(Math.sin(rad) * (r + 11) + 3)}">${a}</text>`;
  }
  const k = r * 0.78, q = r * 0.1;
  s += `<path class="rosa__estrella" d="M0 ${-k}L${q} 0L0 ${k}L${-q} 0Z M${-k} 0L0 ${q}L${k} 0L0 ${-q}Z" />`;
  s += `<path class="rosa__norte" d="M0 ${-k}L${q} 0L0 0Z" />`;
  s += `<text class="rosa__n" y="${-r - 24}">N</text></g>`;
  return s;
}

// ---------- Retícula (meridianos y paralelos reales) ----------
const reticula = [];
for (const lon of [2.78333333, 2.79166667, 2.8]) reticula.push({ x: X(lon), t: lon === 2.8 ? "2°48′E" : lon > 2.79 ? "2°47′30″E" : "2°47′E" });
for (const lat of [41.675, 41.6708333]) reticula.push({ y: Y(lat), t: lat === 41.675 ? "41°40′30″N" : "41°40′15″N" });

// Ángulo de la playa entre el café y el puerto para rotular
const tramoPlaya = costa.filter(([x]) => x > 900 && x < 1250);
const angPlaya = Math.atan2(tramoPlaya[tramoPlaya.length - 1][1] - tramoPlaya[0][1], tramoPlaya[tramoPlaya.length - 1][0] - tramoPlaya[0][0]) * 180 / Math.PI;
const medPlaya = tramoPlaya[Math.floor(tramoPlaya.length / 2)];

// Rumbos reales: del café al punto de costa más cercano y a sa Palomera (en metros)
const playa = costa.filter(([x, y]) => y > aroma[1] - 200 && x < 1300)
  .reduce((a, b) => (Math.hypot(b[0] - aroma[0], b[1] - aroma[1]) < Math.hypot(a[0] - aroma[0], a[1] - aroma[1]) ? b : a));
const redondea = m => Math.round(m / 10) * 10;
const distPlaya = redondea(Math.hypot(playa[0] - aroma[0], playa[1] - aroma[1]));
const distPalomera = redondea(Math.hypot(palomera[0] - aroma[0], palomera[1] - aroma[1]));

let svg = `<svg class="carta-nautica" viewBox="0 0 ${W} ${H}" data-dist-playa="${distPlaya}" data-dist-palomera="${distPalomera}" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="carta-titulo">
<title id="carta-titulo">Carta del centro de Blanes con Aroma Café en el Passeig de Dintre, a una calle de la playa</title>
<defs>
  <clipPath id="ventana"><rect width="${W}" height="${H}"/></clipPath>
  <path id="eje-dintre" d="${d(eje)}"/>
</defs>
<g clip-path="url(#ventana)">
<rect class="mar" width="${W}" height="${H}"/>
<path class="bajo bajo--2" d="${d(costa)}"/>
<path class="bajo bajo--1" d="${d(costa)}"/>
<path class="sonda" pathLength="1" d="${d(costa)}"/>
<g class="plancha">
  <path class="tierra" d="${d(tierra, true)}"/>
  ${islotes.map(i => `<path class="tierra islote" d="${d(i, true)}"/>`).join("")}
  <path class="calle calle--menor" d="${calles.menor.map(p => d(p)).join("")}"/>
  <path class="calle calle--peatonal" d="${calles.peatonal.map(p => d(p)).join("")}"/>
  <path class="calle calle--mayor" d="${calles.mayor.map(p => d(p)).join("")}"/>
  <path class="dintre" d="${dintre.map(p => d(p, true)).join("")}"/>
  <path class="espigon" pathLength="1" d="${espigones.map(p => d(p)).join("")}"/>
  <path class="linea-costa" pathLength="1" d="${d(costa)}"/>
  ${islotes.map(i => `<path class="linea-costa" pathLength="1" d="${d(i, true)}"/>`).join("")}
</g>
${reticula.map(g => g.x != null ? `<line class="reticula" x1="${r1(g.x)}" y1="0" x2="${r1(g.x)}" y2="${H}"/>` : `<line class="reticula" x1="0" y1="${r1(g.y)}" x2="${W}" y2="${r1(g.y)}"/>`).join("")}
<text class="rot rot--pueblo" x="1120" y="120">BLANES</text>
<text class="rot rot--barrio" x="726" y="560">SA MAÇANEDA</text>
<text class="rot rot--calle" text-anchor="middle"><textPath href="#eje-dintre" startOffset="50%">PASSEIG DE DINTRE</textPath></text>
<text class="rot rot--agua rot--bahia" x="1250" y="905">Badia de Blanes</text>
<text class="rot rot--agua" transform="translate(1181 458) rotate(-31)">Platja de Blanes</text>
<text class="rot rot--puerto" x="1520" y="150">PORT DE BLANES</text>
<g class="cima" transform="translate(${r1(palomera[0])} ${r1(palomera[1])})"><g class="cima__cuerpo"><path d="M0 -7L6 4H-6Z"/><text x="12" y="5">sa Palomera</text></g></g>
<text class="rot rot--agua rot--peq" x="${r1(palomera[0] + 40)}" y="${r1(palomera[1] + 70)}">inicio de la Costa Brava</text>
${rosa(1620, 760, 74)}
<g class="rumbos">
  <path class="rumbo" pathLength="1" d="M${r1(aroma[0])} ${r1(aroma[1])}L${r1(playa[0])} ${r1(playa[1])}"/>
  <path class="rumbo" pathLength="1" d="M${r1(aroma[0])} ${r1(aroma[1])}L${r1(palomera[0])} ${r1(palomera[1] - 10)}"/>
  <text class="rumbo__txt" transform="translate(${r1(playa[0] + 14)} ${r1(playa[1] + 26)})">${distPlaya} m a la playa</text>
  <text class="rumbo__txt" transform="translate(${r1((aroma[0] + palomera[0]) / 2 - 150)} ${r1((aroma[1] + palomera[1]) / 2 + 6)})">${distPalomera} m a sa Palomera</text>
</g>
<g class="punto" data-punto="playa" tabindex="0" role="button" aria-label="Platja de Blanes" transform="translate(${r1(playa[0] + 60)} ${r1(playa[1] + 40)})"><circle class="punto__zona" r="26"/><circle class="punto__aro" r="9"/><path class="punto__cruz" d="M-15 0H15M0 -15V15"/></g>
<g class="punto" data-punto="palomera" tabindex="0" role="button" aria-label="sa Palomera" transform="translate(${r1(palomera[0] + 40)} ${r1(palomera[1] + 20)})"><circle class="punto__zona" r="26"/><circle class="punto__aro" r="9"/><path class="punto__cruz" d="M-15 0H15M0 -15V15"/></g>
<g class="punto" data-punto="puerto" tabindex="0" role="button" aria-label="Port de Blanes" transform="translate(1560 420)"><circle class="punto__zona" r="26"/><circle class="punto__aro" r="9"/><path class="punto__cruz" d="M-15 0H15M0 -15V15"/></g>
<g class="recuadro" transform="translate(1040 168)">
  <path class="recuadro__guia" pathLength="1" d="M0 186L${r1(aroma[0] - 1040 + 10)} ${r1(aroma[1] - 168 - 12)}"/>
  <rect class="recuadro__marco" x="-8" y="-8" width="296" height="198"/>
  <image href="assets/img/fachada-1000.webp" x="0" y="0" width="280" height="158" preserveAspectRatio="xMidYMid slice"/>
  <rect class="recuadro__filete" x="0" y="0" width="280" height="158"/>
  <text class="recuadro__pie" x="0" y="180">Vista A · la fachada en el Passeig de Dintre</text>
</g>
<g class="faro punto punto--faro" data-punto="aroma" tabindex="0" role="button" aria-label="Aroma Café, Passeig de Dintre 4" transform="translate(${r1(aroma[0])} ${r1(aroma[1])})"><g class="faro__cuerpo"><circle class="punto__zona" r="30"/>
  <path class="faro__destello" d="M0 0C10 -18 30 -34 44 -40C40 -26 24 -8 0 0Z"/>
  <circle class="faro__halo" r="15"/>
  <circle class="faro__punto" r="6.5"/>
  <text class="faro__nombre" x="18" y="34">AROMA CAFÉ</text>
  <text class="faro__estado" x="18" y="56" data-estado-carta="">Luz verde de 8:30 a 23:00</text>
</g></g>
</g>
</svg>`;

fs.writeFileSync(path.join(RAIZ, "tools/carta.svg"), svg);
console.log("carta.svg", (svg.length / 1024).toFixed(0), "KB · costa", costa.length, "pts · calles", calles.menor.length + calles.peatonal.length + calles.mayor.length, "· ángulo playa", angPlaya.toFixed(1));

// Inserta la carta en index.html entre las marcas <!--carta:inicio--> y <!--carta:fin-->
const indice = path.join(RAIZ, "index.html");
if (fs.existsSync(indice)) {
  const html = fs.readFileSync(indice, "utf8");
  const nuevo = html.replace(/<!--carta:inicio-->[\s\S]*?<!--carta:fin-->/, `<!--carta:inicio-->\n${svg}\n<!--carta:fin-->`);
  if (nuevo !== html) { fs.writeFileSync(indice, nuevo); console.log("carta insertada en index.html"); }
}
