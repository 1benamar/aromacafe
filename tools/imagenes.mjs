// Genera las imágenes WebP de la web a partir de los originales de
// assets/photos/source (que no se suben). Quita los metadatos de las fotos
// (incluida la ubicación GPS de las de clientes) y deja escrito su origen.
// Uso: node tools/imagenes.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(RAIZ, "assets/photos/source");
const OUT = path.join(RAIZ, "assets/img");
fs.mkdirSync(OUT, { recursive: true });

const G = "Foto de la ficha de Google de Aroma Café Blanes (subida por el negocio o por clientes), usada a petición del propietario de la web.";
const I = "Foto del Instagram público @aroma_cafe_blanes, usada a petición del propietario de la web.";

// nombre, origen, recorte {left, top, width, height} o null, anchos, nota
const LISTA = [
  ["fachada", "google/g01.jpg", null, [2400, 1600, 1000], G],
  ["fachada-movil", "google/g01.jpg", { left: 860, top: 0, width: 860, height: 1350 }, [860, 600], G],
  ["barra", "google/g12.jpg", { left: 0, top: 0, width: 1560, height: 1081 }, [1560, 900], G],
  ["taza", "google/g05.jpg", { left: 160, top: 300, width: 2080, height: 2600 }, [700, 460], G],
  ["manana", "google/g14.jpg", { left: 0, top: 140, width: 2268, height: 2835 }, [1200, 720], G],
  ["mediodia", "google/g03.jpg", { left: 0, top: 120, width: 2400, height: 3000 }, [1200, 720], G],
  ["tarde", "google/g08.jpg", { left: 0, top: 100, width: 2400, height: 3000 }, [1200, 720], G],
  ["interior", "google/g06.jpg", null, [1400, 800], G],
  ["tapas", "google/g16.jpg", { left: 0, top: 200, width: 2400, height: 3000 }, [1000, 600], G],
  ["desayuno", "google/g15.jpg", null, [1000, 600], G],
  ["terraza", "instagram/i08.jpg", null, [640], I],
  ["tostada", "instagram/i06.jpg", null, [640], I],
  ["mojito", "instagram/i13.jpg", null, [512], I],
  ["calle", "google/g02.jpg", null, [1600, 900], G],
];

for (const [nombre, origen, recorte, anchos, nota] of LISTA) {
  for (const w of anchos) {
    let img = sharp(path.join(SRC, origen)).rotate();
    if (recorte) img = img.extract(recorte);
    const archivo = anchos.length > 1 ? `${nombre}-${w}.webp` : `${nombre}.webp`;
    const info = await img
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: w >= 1200 ? 68 : 78, effort: 6 })
      .withExif({ IFD0: { ImageDescription: nota } })
      .toFile(path.join(OUT, archivo));
    console.log(archivo.padEnd(26), `${info.width}x${info.height}`, (info.size / 1024).toFixed(0) + " KB");
  }
}

// Imagen para compartir (WhatsApp, redes): JPG 1200x630
await sharp(path.join(SRC, "google/g01.jpg"))
  .extract({ left: 0, top: 30, width: 2400, height: 1260 })
  .resize(1200, 630)
  .jpeg({ quality: 82, mozjpeg: true })
  .withExif({ IFD0: { ImageDescription: G } })
  .toFile(path.join(OUT, "compartir.jpg"));
console.log("compartir.jpg 1200x630");
