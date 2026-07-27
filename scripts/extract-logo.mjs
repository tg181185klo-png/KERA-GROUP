import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(
  root,
  "..",
  "..",
  ".cursor",
  "projects",
  "c-Users-User-Desktop-PROGRAM-SALE-Copy-Copy",
  "assets",
  "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Gemini_Generated_Image_6p18mi6p18mi6p18-611f2f9f-09fc-49fe-972d-a9ad32b16f7d.png"
);

// Fallback: workspace assets path from project
const inputAlt = "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-PROGRAM-SALE-Copy-Copy\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Gemini_Generated_Image_6p18mi6p18mi6p18-611f2f9f-09fc-49fe-972d-a9ad32b16f7d.png";

const source = inputAlt;
const outMark = path.join(root, "..", "public", "kera-logo-mark.png");
const outIcon = path.join(root, "..", "src", "app", "icon.png");
const outApple = path.join(root, "..", "src", "app", "apple-icon.png");

function isBackground(r, g, b) {
  // Cream / off-white paper texture from the source image
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

await transparent.clone().trim().png().toFile(outMark);

const markMeta = await sharp(outMark).metadata();
const iconSize = 512;
await sharp(outMark)
  .resize(iconSize, iconSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outIcon);

await sharp(outMark)
  .resize(180, 180, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(outApple);

console.log("Logo extracted:", outMark, markMeta.width, "x", markMeta.height);
