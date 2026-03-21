import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const ARTISTS_DIR = path.resolve('public/artists/');

const targets = [
  { src: 'http://localhost:8080/artists/JOSE%20MADERO.png', dest: 'FAN_JOSE_MADERO.png' },
];

async function run() {
  for (const t of targets) {
    console.log(`Processing ${t.src}...`);
    try {
      const resultBlob = await removeBackground(t.src);
      const arrayBuffer = await resultBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const outPath = path.join(ARTISTS_DIR, t.dest);
      fs.writeFileSync(outPath, buffer);
      console.log(`  ✓ Saved ${t.dest} (${buffer.length} bytes)`);
    } catch (e: any) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
  }
}

run().catch(console.error);
