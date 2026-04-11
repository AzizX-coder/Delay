const pngToIco = require("png-to-ico").default;
const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "..", "public", "icon.png");
const icoPath = path.join(__dirname, "..", "public", "icon.ico");

pngToIco(pngPath)
  .then((buf) => {
    fs.writeFileSync(icoPath, buf);
    console.log("Created", icoPath);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
