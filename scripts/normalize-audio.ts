import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const VIDEO_DIR = path.resolve('public/hooks_videos');
const TEMP_DIR = path.resolve('public/temp_norm');

async function normalizeAudio() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.mp4'));

  for (const file of files) {
    const inputPath = path.join(VIDEO_DIR, file);
    const outputPath = path.join(TEMP_DIR, file);

    const ffmpegPath = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
    console.log(`Normalizing: ${file}...`);
    try {
      // Apply loudnorm filter
      const cmd = `"${ffmpegPath}" -i "${inputPath}" -af loudnorm -c:v copy -y "${outputPath}"`;
      execSync(cmd, { stdio: 'inherit' });
      
      // Replace original with normalized
      fs.copyFileSync(outputPath, inputPath);
      console.log(`  ✓ Normalized: ${file}`);
    } catch (e) {
      console.error(`  ✗ Failed to normalize: ${file}`, e);
    }
  }

  // Cleanup temp dir
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('All done!');
}

normalizeAudio().catch(console.error);
