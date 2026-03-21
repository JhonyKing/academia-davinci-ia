import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { removeBackground } from '@imgly/background-removal-node';

const ARTISTS_DIR = path.resolve('public/artists/');
const FFMPEG_PATH = "c:\\Users\\Usuario\\JhonyKingAI_Remotion\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe";

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

async function processAll() {
  for (const [tempName, finalName] of Object.entries(mapping)) {
    const tempPath = path.join(ARTISTS_DIR, tempName);
    const fixedPath = path.join(ARTISTS_DIR, `fixed_${tempName}.png`);
    const finalPath = path.join(ARTISTS_DIR, finalName);

    if (!fs.existsSync(tempPath)) {
      console.log(`Skipping ${tempName}: Not found.`);
      continue;
    }

    console.log(`--- Processing ${tempName} ---`);
    try {
      // 1. Convert to standard PNG
      console.log(`  -> Converting to standard PNG...`);
      execSync(`"${FFMPEG_PATH}" -i "${tempPath}" -y "${fixedPath}"`, { stdio: 'ignore' });

      // 2. Remove background
      console.log(`  -> Removing background...`);
      const imageBuffer = fs.readFileSync(fixedPath);
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      const removedBackgroundBlob = await removeBackground(blob);
      const arrayBuffer = await removedBackgroundBlob.arrayBuffer();
      
      // 3. Save to final location
      fs.writeFileSync(finalPath, Buffer.from(arrayBuffer));
      console.log(`✓ Finished ${finalName}`);

      // Cleanup
      fs.unlinkSync(fixedPath);
    } catch (e: any) {
      console.error(`✗ Error processing ${tempName}: ${e.message}`);
    }
  }
}

processAll().catch(console.error);
