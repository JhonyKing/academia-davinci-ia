import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTISTS_DIR = path.resolve('public/artists/');
const IMAGE_FILE = '475794280_1269213621234339_4579619851001772274_n.jpg';
const OUTPUT_FILE = 'FAN_JOSE_MADERO.png';

async function removeBg() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const imageBuffer = fs.readFileSync(path.join(ARTISTS_DIR, IMAGE_FILE));
  const base64Image = imageBuffer.toString('base64');

  await page.setContent(`
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/index.js"></script>
      </head>
      <body>
        <script>
          async function process(base64) {
            const imgly = window.imglyBackgroundRemoval || window.imgly || window.imglyConfig;
            if (!imgly) {
               throw new Error('imglyBackgroundRemoval not found in window. Available: ' + 
                 Object.keys(window).filter(k => !k.startsWith('webkit')).join(', '));
            }
            const response = await fetch('data:image/png;base64,' + base64);
            const blob = await response.blob();
            // The library might have removeBackground or a different entry point depending on version
            const removeFn = imgly.removeBackground || imgly;
            const resultBlob = await removeFn(blob);
            const reader = new FileReader();
            return new Promise(resolve => {
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(resultBlob);
            });
          }
        </script>
      </body>
    </html>
  `);

  console.log('Processing in browser...');
  const resultDataUrl = await page.evaluate(async (base64) => {
    // @ts-ignore
    return await process(base64);
  }, base64Image);

  const resultBuffer = Buffer.from(resultDataUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.join(ARTISTS_DIR, OUTPUT_FILE), resultBuffer);
  console.log('Done!');

  await browser.close();
}

removeBg().catch(console.error);
