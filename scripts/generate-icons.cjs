const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const src = path.join(__dirname, '../public/logo.png')
const sizes = [192, 512]

async function generate() {
  for (const size of sizes) {
    const out = path.join(__dirname, `../public/logo-${size}.png`)
    if (!fs.existsSync(out)) {
      await sharp(src).resize(size, size).toFile(out)
      console.log(`Generated logo-${size}.png`)
    } else {
      console.log(`logo-${size}.png already exists, skipping`)
    }
  }
}
generate().catch(console.error)
