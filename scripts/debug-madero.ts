import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

async function extractAudioPCM(videoPath) {
  const ffmpegPath = ffmpegInstaller.path;
  const raw = execFileSync(ffmpegPath, [
    '-i', videoPath,
    '-f', 's16le',
    '-ar', '16000',
    '-ac', '1',
    '-vn',
    'pipe:1',
  ], { maxBuffer: 100 * 1024 * 1024 });
  const int16 = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  return float32;
}

async function findStart() {
  const videoPath = 'public/GANCHOS SI A TI TE GUSTA/FAN_JOSE_MADERO.mp4';
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
  const audio = await extractAudioPCM(videoPath);
  
  console.log('Transcribiendo todo el video de Jose Madero...');
  const result: any = await transcriber(audio, {
    language: 'es',
    task: 'transcribe',
    return_timestamps: 'word',
  });
  
  console.log('Resultados:');
  const chunks = Array.isArray(result.chunks) ? result.chunks : [];
  chunks.forEach((c: any) => {
    console.log(`[${c.timestamp[0].toFixed(2)}s - ${c.timestamp[1].toFixed(2)}s]: ${c.text}`);
  });
}

findStart().catch(console.error);
