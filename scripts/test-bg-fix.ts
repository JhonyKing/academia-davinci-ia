import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const ARTISTS_DIR = path.resolve('public/artists/');

async function testSingle() {
  const tempPath = path.join(ARTISTS_DIR, 'bunkers_fixed.png');
  const finalPath = path.join(ARTISTS_DIR, 'FAN_LOS_BUNKERS.png');

  console.log(`Testing background removal on ${tempPath}...`);
  try {
    const imageBuffer = fs.readFileSync(tempPath);
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    const removedBackgroundBlob = await removeBackground(blob);
    const arrayBuffer = await removedBackgroundBlob.arrayBuffer();
    fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));
    console.log(`✓ Successfully processed!`);
  } catch (e: any) {
    console.error(`✗ Error: ${e.message}`);
  }
}

testSingle().catch(console.error);
