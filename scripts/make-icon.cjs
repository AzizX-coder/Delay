const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "..", "src", "assets", "logo.png");
const icoPath = path.join(__dirname, "..", "src", "assets", "logo.ico");

async function generate() {
  try {
    const pngToIco = (await import("png-to-ico")).default;
    const buf = await pngToIco(pngPath);
    fs.writeFileSync(icoPath, buf);
    console.log("Created", icoPath);
  } catch (err) {
    console.warn("ICO generation skipped or failed:", err.message);
    // Don't exit with error to avoid breaking the build if the ICO is not critical
    // electron-builder can often generate icons from PNGs
  }
}

generate();
