// Generates PWA icons (SVG + PNG) with no dependencies. Run: node scripts/gen-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
mkdirSync(out, { recursive: true });

const BG = [45, 125, 90];
const FG = [250, 250, 248];

// pawn in unit coordinates (before scale k about the centre)
function inPawn(x, y) {
  // head
  if ((x - 0.5) ** 2 + (y - 0.33) ** 2 <= 0.105 ** 2) return true;
  // collar
  if (y >= 0.43 && y <= 0.48 && Math.abs(x - 0.5) <= 0.15) return true;
  // body (trapezoid, narrow top to wide bottom)
  if (y > 0.48 && y <= 0.7) {
    const t = (y - 0.48) / 0.22;
    const half = 0.085 + t * 0.115;
    if (Math.abs(x - 0.5) <= half) return true;
  }
  // base
  if (y > 0.7 && y <= 0.79 && Math.abs(x - 0.5) <= 0.215) return true;
  return false;
}

function inRoundedSquare(x, y, r) {
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function render(size, { maskable, rounded }, k) {
  const px = Buffer.alloc(size * size * 4);
  const SS = 3;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sj = 0; sj < SS; sj++) {
        for (let si = 0; si < SS; si++) {
          const x = (i + (si + 0.5) / SS) / size;
          const y = (j + (sj + 0.5) / SS) / size;
          const inBg = maskable || !rounded ? true : inRoundedSquare(x, y, 0.22);
          if (!inBg) continue;
          const fx = (x - 0.5) / k + 0.5;
          const fy = (y - 0.5) / k + 0.5;
          const c = inPawn(fx, fy) ? FG : BG;
          r += c[0];
          g += c[1];
          b += c[2];
          a += 1;
        }
      }
      const n = SS * SS;
      const o = (j * size + i) * 4;
      if (a > 0) {
        px[o] = Math.round(r / a);
        px[o + 1] = Math.round(g / a);
        px[o + 2] = Math.round(b / a);
        px[o + 3] = Math.round((a / n) * 255);
      }
    }
  }
  return px;
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const jobs = [
  ['icon-192.png', 192, { rounded: true }, 0.9],
  ['icon-512.png', 512, { rounded: true }, 0.9],
  ['maskable-512.png', 512, { maskable: true }, 0.62],
  ['apple-touch-icon.png', 180, { rounded: false }, 0.8],
];
for (const [name, size, opts, k] of jobs) {
  writeFileSync(join(out, name), png(size, render(size, opts, k)));
  console.log('[icons] wrote', name);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="113" fill="rgb(${BG.join(',')})"/>
  <g fill="rgb(${FG.join(',')})" transform="translate(256 256) scale(0.9) translate(-256 -256)">
    <circle cx="256" cy="169" r="54"/>
    <rect x="179" y="220" width="154" height="26"/>
    <path d="M${256 - 0.085 * 512} ${0.48 * 512} L${256 + 0.085 * 512} ${0.48 * 512} L${256 + 0.2 * 512} ${0.7 * 512} L${256 - 0.2 * 512} ${0.7 * 512} Z"/>
    <rect x="${256 - 0.215 * 512}" y="${0.7 * 512}" width="${0.43 * 512}" height="${0.09 * 512}"/>
  </g>
</svg>
`;
writeFileSync(join(out, 'icon.svg'), svg);
console.log('[icons] wrote icon.svg');
