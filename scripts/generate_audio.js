const fs = require('fs');
const path = require('path');

// Helper to write WAV file
function writeWav(filename, buffer, sampleRate = 44100) {
    const dataSize = buffer.length;
    const fileSize = 36 + dataSize;
    const header = Buffer.alloc(44);

    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);

    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (PCM)
    header.writeUInt16LE(1, 22); // NumChannels (Mono)
    header.writeUInt32LE(sampleRate, 24); // SampleRate
    header.writeUInt32LE(sampleRate * 2, 28); // ByteRate
    header.writeUInt16LE(2, 32); // BlockAlign
    header.writeUInt16LE(16, 34); // BitsPerSample

    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    const fileBuffer = Buffer.concat([header, buffer]);
    fs.writeFileSync(filename, fileBuffer);
    console.log(`Generated: ${filename}`);
}

const SAMPLE_RATE = 44100;

// 1. Generate Intro Background (18s) - Electronic Beat + Drone
function generateIntro() {
    const duration = 18;
    const numSamples = duration * SAMPLE_RATE;
    const buffer = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;

        // Base Drone (low freq sine)
        let sample = Math.sin(2 * Math.PI * 60 * t) * 0.2;

        // Beat (every 0.5s)
        if (t % 0.5 < 0.1) {
            sample += Math.random() * 0.3 * (1 - (t % 0.5) / 0.1); // Kick-ish noise
        }

        // High hat (every 0.25s)
        if (t % 0.25 < 0.05) {
            sample += (Math.random() - 0.5) * 0.1;
        }

        // Riser effect (pitch up over time)
        const riserFreq = 200 + (t / duration) * 800;
        sample += Math.sin(2 * Math.PI * riserFreq * t) * 0.05;

        // Clip
        sample = Math.max(-1, Math.min(1, sample));

        // Write 16-bit PCM
        buffer.writeInt16LE(sample * 32767, i * 2);
    }
    writeWav(path.join(__dirname, '../public/audio/intro.wav'), buffer);
}

// 2. Generate Whoosh (0.5s)
function generateWhoosh() {
    const duration = 0.5;
    const numSamples = duration * SAMPLE_RATE;
    const buffer = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        // White noise with amplitude envelope
        let noise = (Math.random() - 0.5) * 2;

        // Low pass filter effect (simulated by modulating sine freq)
        // Actually just simple amplitude envelope for whoosh 
        // Fade in then Fade out
        let env = 0;
        if (t < duration / 2) {
            env = t / (duration / 2); // Rise
        } else {
            env = 1 - (t - duration / 2) / (duration / 2); // Fall
        }

        let sample = noise * env * 0.5;
        buffer.writeInt16LE(sample * 32767, i * 2);
    }
    writeWav(path.join(__dirname, '../public/audio/whoosh.wav'), buffer);
}

// 3. Generate Click (0.1s)
function generateClick() {
    const duration = 0.1;
    const numSamples = duration * SAMPLE_RATE;
    const buffer = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        // High freq sine short burst
        let sample = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 50);
        buffer.writeInt16LE(sample * 32767, i * 2);
    }
    writeWav(path.join(__dirname, '../public/audio/click.wav'), buffer);
}

// Ensure dir exists
if (!fs.existsSync(path.join(__dirname, '../public/audio'))) {
    fs.mkdirSync(path.join(__dirname, '../public/audio'), { recursive: true });
}

generateIntro();
generateWhoosh();
generateClick();
