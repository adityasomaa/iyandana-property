/** Minimal PNG decode/encode for the brand pipeline. No native deps. */
import zlib from "node:zlib";

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Decodes a non-interlaced 8-bit PNG to { width, height, data } RGBA. */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error("not a PNG");
  let pos = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;
  let palette = null;
  let trns = null;
  const idat = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8];
      colorType = body[9];
      if (body[12] !== 0) throw new Error("interlaced PNG unsupported");
    } else if (type === "PLTE") palette = Buffer.from(body);
    else if (type === "tRNS") trns = Buffer.from(body);
    else if (type === "IDAT") idat.push(Buffer.from(body));
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} unsupported`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`color type ${colorType} unsupported`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const lines = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = lines.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? lines.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= channels ? prev[i - channels] : 0;
      let v = src[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) v += paeth(a, b, c);
      cur[i] = v & 0xff;
    }
  }

  const data = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    const s = i * channels;
    const d = i * 4;
    if (colorType === 0) {
      data[d] = data[d + 1] = data[d + 2] = lines[s];
      data[d + 3] = 255;
    } else if (colorType === 4) {
      data[d] = data[d + 1] = data[d + 2] = lines[s];
      data[d + 3] = lines[s + 1];
    } else if (colorType === 2) {
      data[d] = lines[s];
      data[d + 1] = lines[s + 1];
      data[d + 2] = lines[s + 2];
      data[d + 3] = 255;
    } else if (colorType === 6) {
      data[d] = lines[s];
      data[d + 1] = lines[s + 1];
      data[d + 2] = lines[s + 2];
      data[d + 3] = lines[s + 3];
    } else if (colorType === 3) {
      const p = lines[s] * 3;
      data[d] = palette[p];
      data[d + 1] = palette[p + 1];
      data[d + 2] = palette[p + 2];
      data[d + 3] = trns && lines[s] < trns.length ? trns[lines[s]] : 255;
    }
  }
  return { width, height, data };
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const head = Buffer.concat([Buffer.from(type, "ascii"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(head) >>> 0);
  return Buffer.concat([len, head, crc]);
}

/** Encodes RGBA pixels to a PNG buffer. */
export function encodePng({ width, height, data }) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    PNG_SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Box-filter resample, premultiplied so transparent edges do not darken. */
export function resize(img, w, h) {
  const out = Buffer.alloc(w * h * 4);
  const sx = img.width / w;
  const sy = img.height / h;
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.min(img.height, Math.ceil((y + 1) * sy)));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.min(img.width, Math.ceil((x + 1) * sx)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * img.width + xx) * 4;
          const al = img.data[i + 3] / 255;
          r += img.data[i] * al;
          g += img.data[i + 1] * al;
          b += img.data[i + 2] * al;
          a += img.data[i + 3];
          n++;
        }
      }
      const d = (y * w + x) * 4;
      const alpha = a / n;
      const un = alpha > 0 ? n * (alpha / 255) : 1;
      out[d] = Math.min(255, Math.round(r / un));
      out[d + 1] = Math.min(255, Math.round(g / un));
      out[d + 2] = Math.min(255, Math.round(b / un));
      out[d + 3] = Math.round(alpha);
    }
  }
  return { width: w, height: h, data: out };
}
