import fs from 'fs';
import https from 'https';
import path from 'path';

const artists = [
  { name: 'jose_madero', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Jos%C3%A9_Madero_Vizca%C3%ADno.jpg', ext: 'jpg' },
  { name: 'panda_band', url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/PXNDX.jpg', ext: 'jpg' },
  { name: 'charly_garcia', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Charly_Garc%C3%ADa_70_a%C3%B1os_en_el_CCK_2021.jpg', ext: 'jpg' },
  { name: 'soda_stereo', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Soda_Stereo_en_la_Trastienda_1992.jpg', ext: 'jpg' },
  { name: 'la_ley', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/La_Ley_Chile_2016.png', ext: 'png' },
  { name: 'plastilina_mosh', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Plastilina_Mosh_en_el_Woodstock_Plaza.jpg', ext: 'jpg' }
];

const targetDir = path.resolve('public/artists/temp/');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Downloading ${artists.length} images to ${targetDir}...`);

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

artists.forEach(artist => {
  const filePath = path.join(targetDir, `${artist.name}.${artist.ext}`);
  const file = fs.createWriteStream(filePath);
  
  const download = (url: string) => {
    https.get(url, { headers }, (response) => {
      if ((response.statusCode === 301 || response.statusCode === 302) && response.headers.location) {
        console.log(`Redirecting for ${artist.name}...`);
        download(response.headers.location);
        return;
      }
      
      if (response.statusCode !== 200) {
        console.error(`✗ Error downloading ${artist.name}: Status code ${response.statusCode}`);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${artist.name}`);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Error downloading ${artist.name}: ${err.message}`);
    });
  };

  download(artist.url);
});
