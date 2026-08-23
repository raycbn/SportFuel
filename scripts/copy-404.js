import { copyFileSync, existsSync } from "fs";
import { join } from "path";

const src = join(process.cwd(), "dist", "index.html");
const dst = join(process.cwd(), "dist", "404.html");

if (existsSync(src)) {
  copyFileSync(src, dst);
  console.log(`Copied ${src} → ${dst}`);
} else {
  console.error("dist/index.html not found");
  process.exit(1);
}
