import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const root = path.dirname(fileURLToPath(import.meta.url));

const source =
  process.argv[2] ??
  path.join(
    root,
    "..",
    "..",
    ".cursor",
    "projects",
    "c-Users-User-Desktop-PROGRAM-SALE-Copy-Copy",
    "assets",
    "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_17b066c1-028b-4847-80aa-c269b0299be0-887f3463-da9e-458c-8b36-91e30e780307.png",
  );

const outMarkPublic = path.join(root, "..", "public", "kera-logo-mark.png");
const outMarkSrc = path.join(root, "..", "src", "assets", "logo-mark.png");
const outIcon = path.join(root, "..", "src", "app", "icon.png");
const outApple = path.join(root, "..", "src", "app", "apple-icon.png");

if (!fs.existsSync(source)) {
  console.error("Logo source not found:", source);
  process.exit(1);
}

function isBackground(r, g, b) {
  const brightness = (r + g + b) / 3;
  if (brightness > 210 && r - b < 25 && g - b < 20) return true;
  if (brightness > 235) return true;
  return false;
}

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = Buffer.from(data);
for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  if (isBackground(r, g, b)) {
    pixels[i + 3] = 0;
  }
}

const transparent = sharp(pixels, {
  raw: { width: info.width, height: info.height, channels: 4 },
});

const markBuffer = await transparent.clone().trim().png().toBuffer();
await sharp(markBuffer).toFile(outMarkPublic);
await sharp(markBuffer).toFile(outMarkSrc);

const markMeta = await sharp(markBuffer).metadata();
const iconSize = 512;
await sharp(markBuffer)
  .resize(iconSize, iconSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outIcon);

await sharp(markBuffer)
  .resize(180, 180, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outApple);

console.log("Logo extracted:", outMarkPublic, markMeta.width, "x", markMeta.height);
