// Convierte una foto real en ilustración de "etiqueta impresa": se reduce a
// tintas planas mapeando la luminosidad sobre la paleta del cartel.
// Uso: node cartel.mjs origen.jpg salida.webp ancho alto left top width height
import sharp from "sharp";

const [src, out, W, H, l, t, w, h] = process.argv.slice(2);
const ANCHO = Number(W), ALTO = Number(H);
// Rampa de tintas (de sombra a luz): tinta verde, verde, rojo, mostaza, crema
// Tintas planas, de sombra a luz: tinta verde, verde toldo, rojo, mostaza, crema
const TINTAS = [[15, 40, 30], [28, 96, 64], [200, 62, 38], [240, 184, 48], [249, 240, 218]];
const CORTES = [0.22, 0.42, 0.62, 0.82];

let img = sharp(src).rotate();
if (w) img = img.extract({ left: +l, top: +t, width: +w, height: +h });
const { data, info } = await img
  .resize(ANCHO, ALTO, { fit: "cover" })
  .median(5)
  .modulate({ brightness: 1.05 })
  .normalise()
  .raw()
  .toBuffer({ resolveWithObject: true });

const ch = info.channels;
const outBuf = Buffer.alloc(info.width * info.height * 3);
function tinta(v) {
  let i = 0;
  while (i < CORTES.length && v > CORTES[i]) i++;
  return TINTAS[i];
}
for (let p = 0, q = 0; p < data.length; p += ch, q += 3) {
  const lum = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
  const c = tinta(Math.pow(lum, 0.9));
  outBuf[q] = c[0]; outBuf[q + 1] = c[1]; outBuf[q + 2] = c[2];
}
await sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 3 } })
  .median(3)
  .webp({ quality: 86 })
  .withExif({ IFD0: { ImageDescription: "Foto de la ficha de Google de Aroma Café Blanes, convertida a tintas planas de cartel. Usada a petición del propietario de la web." } })
  .toFile(out);
console.log("ok", out);
