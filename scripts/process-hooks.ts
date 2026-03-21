import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { removeBackground } from '@imgly/background-removal-node';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const HOOKS_FOLDER = path.join(PUBLIC_DIR, 'GANCHOS SI A TI TE GUSTA');
const ARTISTS_DIR = path.join(PUBLIC_DIR, 'artists');
const OUTPUT_DATA = path.join(PUBLIC_DIR, 'hooks-data.json');

if (!fs.existsSync(ARTISTS_DIR)) {
  fs.mkdirSync(ARTISTS_DIR, { recursive: true });
}

async function fetchItunesImage(artistName: string): Promise<string | null> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=album&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg');
    }
  } catch (e) {
    console.error(`Error with iTunes for ${artistName}:`, e);
  }
  return null;
}

// APIs
async function fetchWikiImage(artistName: string): Promise<string | null> {
  for (const lang of ['es', 'en']) {
    try {
      const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artistName)}&utf8=&format=json`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (!searchData.query?.search?.length) continue;
      const title = searchData.query.search[0].title;
      
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query?.pages;
      if (!pages) continue;
      const pageId = Object.keys(pages)[0];
      if (pageId !== "-1" && pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    } catch (e) {
      console.error(`Error with wiki ${lang} for ${artistName}:`, e);
    }
  }
  return fetchItunesImage(artistName);
}

function getSilenceEnd(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let silenceEnd = 0;
    ffmpeg(filePath)
      .audioFilters('silencedetect=noise=-30dB:d=0.3')
      .outputFormat('null')
      .on('stderr', (line: string) => {
        const match = line.match(/silence_end: ([\d.]+)/);
        if (match) silenceEnd = parseFloat(match[1]);
      })
      .on('end', () => resolve(silenceEnd))
      .on('error', (err: any) => reject(err))
      .save('-');
  });
}

function getRandomDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: any, data: any) => {
      if (err) reject(err);
      else resolve(data.format.duration || 4); // fallback 4
    });
  });
}

async function processVideo(file: string) {
  const filePath = path.join(HOOKS_FOLDER, file);
  const rawName = file.replace('.mp4', '');
  let artistName = rawName.replace('FAN_', '').split('_').join(' ');
  // Minor fix for some artists
  if (artistName === 'JOSE MADERO') artistName = 'José Madero';
  if (artistName === 'SOBER') artistName = 'Sôber';

  console.log(`\nProcesando: ${artistName}`);

  // 1. Detect Audio Start
  console.log('  -> Detectando inicio de voz...');
  let startFromSeconds = await getSilenceEnd(filePath);
  // Default to 0.5 if detection fails or is 0
  if (startFromSeconds === 0) startFromSeconds = 0.5;
  console.log(`  -> Voz detectada en el segundo: ${startFromSeconds}`);

  // Duration
  const duration = await getRandomDuration(filePath);

  // 2. Artist Image
  const imgPath = path.join(ARTISTS_DIR, `${rawName}.png`);
  if (!fs.existsSync(imgPath)) {
    console.log('  -> Buscando imagen en Wikipedia...');
    const url = await fetchWikiImage(artistName);
    if (!url) {
      console.log(`  -> IMAGEN NO ENCONTRADA para ${artistName}. Tendrás que ponerla manualmente.`);
    } else {
      console.log('  -> Imagen encontrada, removiendo fondo...');
      try {
        const imageBlob = await removeBackground(url);
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(imgPath, buffer);
        console.log('  -> Imagen sin fondo guardada exitosamente.');
      } catch (err: any) {
         console.error('  -> Error removiendo fondo:', err?.message || err);
      }
    }
  } else {
    console.log('  -> La imagen sin fondo ya existe.');
  }

  return {
    id: rawName.replace(/[^a-zA-Z0-9-]/g, '-'),
    artist: artistName,
    videoPath: `GANCHOS SI A TI TE GUSTA/${file}`, // Relative path for staticFile
    imageLocalUrl: `artists/${rawName}.png`,
    startFromSeconds,
    durationSeconds: duration
  };
}

async function main() {
  const files = fs.readdirSync(HOOKS_FOLDER).filter(f => f.endsWith('.mp4'));
  const allHooks = [];
  
  for (const file of files) {
    try {
      const result = await processVideo(file);
      allHooks.push(result);
    } catch (e) {
      console.error(`Error procesando ${file}:`, e);
    }
  }

  fs.writeFileSync(OUTPUT_DATA, JSON.stringify(allHooks, null, 2));
  console.log(`\n¡Procesamiento completo! Generados ${allHooks.length} hooks en ${OUTPUT_DATA}`);
}

main().catch(console.error);
