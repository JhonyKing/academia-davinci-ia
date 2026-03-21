import fs from 'fs';
import path from 'path';
import { pipeline, RawImage } from '@xenova/transformers';

const ARTISTS_DIR = path.resolve('public/artists/');

async function processAll() {
    console.log('Loading background removal model (RMBG-1.4)...');
    const remover = await pipeline('image-segmentation', 'Xenova/rmbg-1.4');

    const files = fs.readdirSync(ARTISTS_DIR).filter(f => f.startsWith('FAN_') && f.endsWith('.png'));

    for (const file of files) {
        const inputPath = path.join(ARTISTS_DIR, file);
        const outputPath = inputPath; // Overwrite or use a temp name? Overwrite for speed.
        
        console.log(`Processing ${file}...`);
        try {
            const image = await RawImage.read(inputPath);
            const { mask } = await remover(image);
            
            // Apply mask to original image to get transparency
            const canvas = image.toCanvas();
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const maskData = await mask.toRawImage().then(m => m.data);
            
            for (let i = 0; i < imageData.data.length; i += 4) {
                // maskData is single channel (0-255), so we use it for alpha
                imageData.data[i + 3] = maskData[i / 4];
            }
            
            ctx.putImageData(imageData, 0, 0);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);
            console.log(`  ✓ Done: ${file}`);
        } catch (e) {
            console.error(`  ✗ Failed: ${file}`, e);
        }
    }
}

processAll().catch(console.error);
