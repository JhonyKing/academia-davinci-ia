import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DATA = path.join(PUBLIC_DIR, 'hooks-data.json');
const DEST_FOLDER = path.join(PUBLIC_DIR, 'hooks_videos');

async function main() {
  if (!fs.existsSync(OUTPUT_DATA)) {
    console.error('No hooks-data.json found. Please run process-hooks.ts first.');
    return;
  }

  // Ensure DEST_FOLDER exists
  if (!fs.existsSync(DEST_FOLDER)) fs.mkdirSync(DEST_FOLDER, { recursive: true });

  const hooks = JSON.parse(fs.readFileSync(OUTPUT_DATA, 'utf-8'));

  for (const hook of hooks) {
    // Some IDs might start with FAN-, let's remove it if it exists for the file name, or just use user-requested format
    let fileSuffix = hook.id;
    if (fileSuffix.startsWith('FAN-')) fileSuffix = fileSuffix.replace('FAN-', '');
    if (fileSuffix.startsWith('FAN_')) fileSuffix = fileSuffix.replace('FAN_', '');

    const outPath = path.join(DEST_FOLDER, `hook_${fileSuffix}.mp4`);
    console.log(`\n============================`);
    console.log(`Renderizando: ${hook.artist} -> ${outPath}`);
    console.log(`============================\n`);
    
    // El id en Root.tsx es hook.id (ej. "FAN_ANDRES_CALAMARO")
    const cmd = `npx remotion render src/index.ts ${hook.id} "${outPath}"`;
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Error renderizando ${hook.id}:`, e);
    }
  }

  console.log('\n¡Todos los videos han sido renderizados exitosamente!');
}

main().catch(console.error);
