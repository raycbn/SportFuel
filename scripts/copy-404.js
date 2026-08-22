import { copyFileSync, existsSync } from "node:fs";

const src = "dist/index.html";
const dest = "dist/404.html";

if (!existsSync(src)) {
  console.error(`Build output missing: ${src}`);
  process.exit(1);
}

copyFileSync(src, dest);

if (!existsSync(dest)) {
  console.error(`Failed to create: ${dest}`);
  process.exit(1);
}

console.log(`Copied ${src} → ${dest}`);
