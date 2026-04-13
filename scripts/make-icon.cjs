const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const pngPath = path.join(__dirname, "..", "public", "logo.png");
const icoPath = path.join(__dirname, "..", "public", "logo.ico");

const WINDOWS_ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

async function generate() {
  console.log("Generating multi-size ICO from:", pngPath);
  const pngToIco = (await import("png-to-ico")).default;

  const resizedBuffers = await Promise.all(
    WINDOWS_ICO_SIZES.map((size) =>
      sharp(pngPath)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  const buf = await pngToIco(resizedBuffers);
  fs.writeFileSync(icoPath, buf);
  console.log(`Wrote ${icoPath} with sizes: ${WINDOWS_ICO_SIZES.join(", ")}`);
}

generate().catch((err) => {
  console.error("ICO generation failed:", err);
  process.exit(1);
});
