// One-shot Node script to generate placeholder PWA icons.
// Uses node:buffer + minimal PNG encoding (no deps) so it runs in CI.
//
//   node scripts/make_pwa_icons.js
//
// Output: public/icons/icon-{72,96,128,192,512}.png
//
// Each icon is a #1a56db square with white "PS" centered. Replace these
// with real designed icons before public launch — they exist so the PWA
// manifest validates and "Add to Home Screen" works on day one.

const fs = require('fs');
const path = require('path');
const { createCanvas } = (() => {
  try { return require('canvas'); } catch { return { createCanvas: null }; }
})();

const SIZES = [72, 96, 128, 192, 512];
const OUT = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

function makeWithCanvas(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a56db';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.42)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PS', size / 2, size / 2 + size * 0.04);
  return canvas.toBuffer('image/png');
}

// Fallback if `canvas` isn't installed: hand-encoded solid-color PNG.
// Spec: 8-bit RGB, single IDAT, zero filter on every row.
function makeSolidPng(size, r, g, b) {
  const zlib = require('zlib');

  // raw image data: each row prefixed with filter byte 0x00
  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    row[1 + x * 3 + 0] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.alloc(row.length * size);
  for (let y = 0; y < size; y++) row.copy(raw, y * row.length);

  const idat = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  function crc32(buf) {
    let c;
    if (!crc32.table) {
      crc32.table = new Int32Array(256);
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        crc32.table[n] = c;
      }
    }
    c = 0xffffffff;
    for (const b of buf) c = (crc32.table[(c ^ b) & 0xff] ^ (c >>> 8)) >>> 0;
    return (c ^ 0xffffffff) | 0;
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;     // bit depth
  ihdr[9] = 2;     // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

for (const size of SIZES) {
  const out = path.join(OUT, `icon-${size}.png`);
  let buf;
  if (createCanvas) {
    buf = makeWithCanvas(size);
  } else {
    // Solid PolitiScore-blue square. Good enough for the manifest; ship a
    // real designed icon set before public launch.
    buf = makeSolidPng(size, 0x1a, 0x56, 0xdb);
  }
  fs.writeFileSync(out, buf);
  console.log('wrote', out, buf.length, 'bytes');
}
