#!/usr/bin/env node

/**
 * ElevenLabs Text-to-Speech Script
 * 
 * Genera audio usando la API de ElevenLabs
 * 
 * Uso:
 *   node scripts/eleven_tts.mjs --text "Tu texto aquí" --voice "voice_id" --out "public/audio/output.mp3"
 * 
 * Argumentos:
 *   --text    Texto a convertir en audio (obligatorio)
 *   --voice   ID o nombre de la voz de ElevenLabs (obligatorio)
 *   --out     Ruta de salida para el archivo MP3 (obligatorio)
 * 
 * Variables de entorno:
 *   ELEVENLABS_API_KEY   Tu API key de ElevenLabs (obligatoria)
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env
config();

// Parsear argumentos de línea de comandos
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        parsed[key] = value;
    }

    return parsed;
}

async function main() {
    // Obtener argumentos
    const args = parseArgs();
    const { text, voice, out } = args;

    // Validar argumentos obligatorios
    if (!text) {
        console.error('❌ Error: Argumento --text es obligatorio');
        console.log('\nUso:');
        console.log('  node scripts/eleven_tts.mjs --text "Texto aquí" --voice "voice_id" --out "public/audio/output.mp3"');
        process.exit(1);
    }

    if (!voice) {
        console.error('❌ Error: Argumento --voice es obligatorio');
        console.log('\nUso:');
        console.log('  node scripts/eleven_tts.mjs --text "Texto aquí" --voice "voice_id" --out "public/audio/output.mp3"');
        process.exit(1);
    }

    if (!out) {
        console.error('❌ Error: Argumento --out es obligatorio');
        console.log('\nUso:');
        console.log('  node scripts/eleven_tts.mjs --text "Texto aquí" --voice "voice_id" --out "public/audio/output.mp3"');
        process.exit(1);
    }

    // Validar API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: ELEVENLABS_API_KEY no encontrada en variables de entorno');
        console.log('\n💡 Asegúrate de:');
        console.log('  1. Crear un archivo .env en la raíz del proyecto');
        console.log('  2. Agregar: ELEVENLABS_API_KEY=tu_api_key_aquí');
        process.exit(1);
    }

    console.log('🎙️  Generando audio con ElevenLabs...\n');
    console.log(`📝 Texto: "${text}"`);
    console.log(`🗣️  Voz: ${voice}`);
    console.log(`📁 Output: ${out}\n`);

    try {
        // Crear cliente de ElevenLabs
        const client = new ElevenLabsClient({
            apiKey: apiKey,
        });

        // Crear directorio de salida si no existe
        const outputDir = dirname(out);
        await mkdir(outputDir, { recursive: true });

        // Generar audio
        console.log('⏳ Solicitando audio a ElevenLabs...');

        const audio = await client.textToSpeech.convert(voice, {
            text: text,
            model_id: 'eleven_multilingual_v2', // Modelo que soporta español
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
            },
        });

        // Guardar archivo
        console.log('💾 Guardando archivo...');
        const writeStream = createWriteStream(out);

        // El audio es un stream, lo escribimos al archivo
        for await (const chunk of audio) {
            writeStream.write(chunk);
        }

        writeStream.end();

        // Esperar a que termine de escribir
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log('\n✅ Audio generado exitosamente!');
        console.log(`📍 Archivo guardado en: ${out}`);
        console.log('\n🎬 Para usar en Remotion:');
        console.log(`   <Audio src={staticFile("${out.replace('public/', '')}")} />`);

    } catch (error) {
        console.error('\n❌ Error al generar audio:');
        console.error(error.message);

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.log('\n💡 Verifica que tu API key sea correcta en el archivo .env');
        } else if (error.message.includes('voice')) {
            console.log('\n💡 El voice ID puede ser inválido. Verifica en https://elevenlabs.io/app/voices');
        }

        process.exit(1);
    }
}

main();
