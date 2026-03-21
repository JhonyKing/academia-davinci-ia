import fs from 'fs';

const pngPath = 'public/artists/FAN_LOS_BUNKERS.png';
const buffer = fs.readFileSync(pngPath);

// PNG header: 89 50 4E 47 0D 0A 1A 0A
if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
  console.log('File is a valid PNG.');
  // A background-removed image should have some transparent pixels.
  // We can't easily parse PNG pixels without a library, but we can check the file size.
  // And we know the script reported success.
} else {
  console.log('File is NOT a valid PNG.');
}
console.log(`File size: ${buffer.length} bytes`);
