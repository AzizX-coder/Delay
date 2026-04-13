const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "..", "public", "logo.png");
const icoPath = path.join(__dirname, "..", "public", "logo.ico");

async function generate() {
  try {
    console.log("Generating icon from:", pngPath);
    const pngToIco = (await import("png-to-ico")).default;
    const buf = await pngToIco(pngPath);
    fs.writeFileSync(icoPath, buf);
    console.log("Successfully created:", icoPath);
  } catch (err) {
    console.warn("ICO generation failed:", err.message);
    // Continue build anyway, as electron-builder might handle the PNG
  }
}

generate();
