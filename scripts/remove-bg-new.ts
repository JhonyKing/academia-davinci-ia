import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const ARTISTS_DIR = path.resolve('public/artists/');
const TEMP_DIR = ARTISTS_DIR;

const mapping = {
  'bunkers.png': 'FAN_LOS_BUNKERS.png',
  'foo-fighters-768x512.png': 'FAN_FOO_FIGHTERS.png',
  'green-day-11550724818ampqqwxskx.png': 'FAN_GREEN_DAY.png',
  'juan solo.jpg': 'FAN_JUAN_SOLO.png',
  'mana.png': 'FAN_MANA.png',
  'muse.jpg': 'FAN_MUSE.png',
  'plastilina mosh.jpg': 'FAN_PLASTILINA_MOSH.png',
  'pxndx.jpg': 'FAN_PANDA.png',
  'santiago cruz.webp': 'FAN_SANTIAGO_CRUZ.png',
  'soda.png': 'FAN_SODA_STEREO.png',
  'zoe.jpg': 'FAN_ZOE.png',
  '475794280_1269213621234339_4579619851001772274_n.jpg': 'FAN_JOSE_MADERO.png'
};

async function processImages() {
  for (const [tempName, finalName] of Object.entries(mapping)) {
    const tempPath = path.join(TEMP_DIR, tempName);
    const finalPath = path.join(ARTISTS_DIR, finalName);

    if (!fs.existsSync(tempPath) || tempName === finalName) {
      continue;
    }

    console.log(`Processing ${tempName} -> ${finalName}...`);
    try {
      const url = `http://localhost:8080/artists/${encodeURIComponent(tempName)}`;
      console.log(`URL: ${url}`);
      const removedBackgroundBlob = await removeBackground(url);
      const arrayBuffer = await removedBackgroundBlob.arrayBuffer();
      fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));
      console.log(`✓ Successfully processed ${finalName}`);
    } catch (e: any) {
      console.error(`✗ Error processing ${tempName}: ${e.message}`);
    }
  }
}

processImages().catch(console.error);
