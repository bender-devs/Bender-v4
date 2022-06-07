const fs = require("fs");
const { join } = require("path");

const old = join(__dirname, "..", "src", ".env");
if (!fs.existsSync(old)) {
  console.error("no old env found.");
  process.exit(1);
}

fs.copyFileSync(old, join(__dirname, "..", "dist", ".env"));
console.log('success');
