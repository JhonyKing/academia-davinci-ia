import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DATA = path.join(PUBLIC_DIR, 'hooks-data.json');

interface WordSegment {
  word: string;
  start: number; // seconds from the start of the trimmed video
  end: number;
}

async function extractAudioPCM(videoPath: string): Promise<Float32Array> {
  const { execFileSync } = await import('child_process');
  const ffmpegPath = (await import('@ffmpeg-installer/ffmpeg')).path;
  
  // Extract raw PCM s16le mono 16KHz audio
  const raw = execFileSync(ffmpegPath, [
    '-i', videoPath,
    '-f', 's16le',
    '-ar', '16000',
    '-ac', '1',
    '-vn',
    'pipe:1',
  ], { maxBuffer: 100 * 1024 * 1024 }); // 100MB max

  const int16 = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

async function transcribeVideo(videoPath: string, startFromSeconds: number): Promise<WordSegment[]> {
  const { pipeline } = await import('@xenova/transformers');
  
  console.log('  -> Cargando modelo Whisper...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
    revision: 'main',
  });

  console.log('  -> Extrayendo audio PCM...');
  const audio = await extractAudioPCM(videoPath);

  // Trim audio to start from when speech begins
  const sampleRate = 16000;
  const startSample = Math.round(startFromSeconds * sampleRate);
  const trimmedAudio = audio.slice(startSample);

  console.log(`  -> Transcribiendo ${(trimmedAudio.length / sampleRate).toFixed(1)}s de audio...`);
  const result: any = await transcriber(trimmedAudio, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: 'es',
    task: 'transcribe',
    return_timestamps: 'word',
  });

  const chunks = Array.isArray(result.chunks) ? result.chunks : [];
  
  const words: WordSegment[] = chunks.map((c: any) => ({
    word: c.text.trim(),
    start: c.timestamp[0] ?? 0,
    end: c.timestamp[1] ?? c.timestamp[0] + 0.5,
  })).filter((w: WordSegment) => w.word.length > 0);

  return words;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DATA)) {
    console.error('No se encontró hooks-data.json. Ejecuta process-hooks.ts primero.');
    return;
  }

  const hooks = JSON.parse(fs.readFileSync(OUTPUT_DATA, 'utf-8'));

  for (const hook of hooks) {
    if (hook.words && hook.words.length > 0) {
      console.log(`\n[${hook.artist}] Ya tiene transcripción. Saltando.`);
      continue;
    }
    
    const videoPath = path.join(PUBLIC_DIR, hook.videoPath);
    console.log(`\n===========================`);
    console.log(`Transcribiendo: ${hook.artist}`);
    console.log(`===========================`);
    
    try {
      hook.words = await transcribeVideo(videoPath, hook.startFromSeconds);
      console.log(`  -> ${hook.words.length} palabras detectadas`);
      fs.writeFileSync(OUTPUT_DATA, JSON.stringify(hooks, null, 2));
    } catch (e: any) {
      console.error(`  -> Error transcribiendo: ${e.message}`);
      hook.words = [];
      fs.writeFileSync(OUTPUT_DATA, JSON.stringify(hooks, null, 2));
    }
  }

  console.log('\n¡Transcripción completa!');
}

main().catch(console.error);
