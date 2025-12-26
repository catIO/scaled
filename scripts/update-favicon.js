import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import toIco from 'to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../public');
const svgPath = join(publicDir, 'favicon.svg');

const svgBuffer = readFileSync(svgPath);

// Generate PNG buffers for different sizes
const sizes = [16, 32, 48, 64];
const pngBuffers = await Promise.all(
  sizes.map(async (size) => {
    const buffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    return { size, buffer };
  })
);

// Convert to ICO format
const icoBuffer = await toIco(
  pngBuffers.map(({ buffer }) => buffer),
  { sizes: sizes.map(s => [s, s]) }
);

// Write favicon.ico
writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);

console.log('✅ Generated favicon.ico from favicon.svg');

