import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@xenova/transformers';

const ARTISTS_DIR = path.resolve('public/artists/');

async function fixSpecificBackgrounds() {
    console.log('Loading background removal model (RMBG-1.4)...');
    // Using AutoProcessor and AutoModel might be more robust if pipeline fails
    const remover = await pipeline('image-segmentation', 'Xenova/rmbg-1.4');

    const targets = [
        { src: '475794280_1269213621234339_4579619851001772274_n.jpg', dest: 'FAN_JOSE_MADERO.png' },
        { src: 'FAN_RIO_ROMA.png', dest: 'FAN_RIO_ROMA_new.png' } // Save to new name to avoid conflict during read
    ];

    for (const target of targets) {
        const inputPath = path.join(ARTISTS_DIR, target.src);
        const outputPath = path.join(ARTISTS_DIR, target.dest);
        
        if (!fs.existsSync(inputPath)) {
            console.warn(`Source not found: ${target.src}`);
            continue;
        }

        console.log(`Processing ${target.src} -> ${target.dest}...`);
        try {
            const image = await RawImage.read(inputPath);
            const outputs = await remover(image);
            const mask = outputs[0].mask;
            
            // For rmbg-1.4, the output is a mask that can be used to remove background
            // We can convert to canvas and apply alpha
            const canvas = image.toCanvas();
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Resize mask to match image if necessary
            const maskData = mask.data;
            
            // Mask is usually 1-channel, Alpha is the 4th channel
            for (let i = 0; i < imageData.data.length; i += 4) {
                // maskData is [0-255]. We use it directly as alpha.
                imageData.data[i + 3] = maskData[i / 4];
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Save to PNG
            const outBuffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, outBuffer);
            console.log(`  ✓ Finished: ${target.dest}`);
        } catch (e) {
            console.error(`  ✗ Failed: ${target.dest}`, e);
        }
    }
}

fixSpecificBackgrounds().catch(console.error);
