/**
 * make-icons.mjs
 * Builds the site's favicon set from the brand type and colours: a gold
 * Cormorant italic "G" on near-black.
 *
 *   node scripts/make-icons.mjs
 *
 * Writes, all picked up by the Next.js app router automatically:
 *   src/app/favicon.ico      16, 32 and 48 px (browser tabs, Google results)
 *   src/app/icon.png         512 px (modern browsers, Android)
 *   src/app/apple-icon.png   180 px (iOS home screen and bookmarks)
 *
 * Needs network access once, to fetch the Cormorant font from Google Fonts.
 */

import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import React from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..", "src", "app");

const NEAR_BLACK = "#242020";
const GOLD = "#C9A84C";

async function loadFont(family) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((r) => r.text());
  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`No font file found for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

/** One square master; every size is scaled down from it. */
async function master(size, { rounded }) {
  const font = await loadFont("Cormorant+Garamond:ital,wght@1,500");
  const h = React.createElement;
  const res = new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: NEAR_BLACK,
          borderRadius: rounded ? size * 0.22 : 0,
        },
      },
      h(
        "div",
        {
          style: {
            fontFamily: "Cormorant",
            fontStyle: "italic",
            fontSize: size * 0.84,
            lineHeight: 1,
            color: GOLD,
            // Optical centring: the italic G sits low and to the left.
            marginTop: -size * 0.1,
            marginLeft: size * 0.02,
          },
        },
        "G"
      )
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Cormorant", data: font, style: "italic", weight: 500 }],
    }
  );
  return Buffer.from(await res.arrayBuffer());
}

/** An .ico that stores PNG images, which every current browser accepts. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const rounded = await master(512, { rounded: true });
// iOS rounds the corners itself and shows transparency as black, so the
// apple icon is a full square.
const square = await master(512, { rounded: false });

const resize = (buf, size) => sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const icoSizes = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await resize(rounded, size) })));
writeFileSync(join(APP_DIR, "favicon.ico"), ico(icoSizes));
writeFileSync(join(APP_DIR, "icon.png"), await resize(rounded, 512));
writeFileSync(join(APP_DIR, "apple-icon.png"), await resize(square, 180));

console.log("Wrote favicon.ico (16, 32, 48), icon.png (512) and apple-icon.png (180) to src/app/");
