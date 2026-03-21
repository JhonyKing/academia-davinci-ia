import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const ARTISTS_DIR = path.join(PUBLIC_DIR, 'artists');

const replacements = [
  { id: 'FAN_GREEN_DAY', wikiTitle: 'Green Day' },
  { id: 'FAN_JOSE_MADERO', wikiTitle: 'José Madero' },
  { id: 'FAN_LA_LEY', wikiTitle: 'La Ley (banda)' },
  { id: 'FAN_LOS_BUNKERS', wikiTitle: 'Los Bunkers' },
  { id: 'FAN_MANA', wikiTitle: 'Maná (banda)' },
  { id: 'FAN_ZOE', wikiTitle: 'León Larregui' }, // For Zoé, use Leon's picture as requested
  { id: 'FAN_SANTIAGO_CRUZ', wikiTitle: 'Santiago Cruz' },
  { id: 'FAN_RIO_ROMA', wikiTitle: 'Río Roma' },
  { id: 'FAN_PANDA', wikiTitle: 'Pxndx' }, // Pxndx instead of animal Panda
];

async function replaceImage(id: string, title: string) {
  console.log(`\nBuscando reemplazo para [${id}] -> Wiki: "${title}"`);
  
  try {
      const urlE = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
      const res = await fetch(urlE);
      const data = await res.json();
      const pages = data.query?.pages;
      
      let imageUrl = null;
      if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].thumbnail) {
              imageUrl = pages[pageId].thumbnail.source;
          }
      }
      
      // fallback to EN
      if (!imageUrl) {
          const urlEn = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
          const resEn = await fetch(urlEn);
          const dataEn = await resEn.json();
          const pagesEn = dataEn.query?.pages;
          if (pagesEn) {
              const pageIdEn = Object.keys(pagesEn)[0];
              if (pageIdEn !== "-1" && pagesEn[pageIdEn].thumbnail) {
                  imageUrl = pagesEn[pageIdEn].thumbnail.source;
              }
          }
      }

      if (!imageUrl) {
          console.error(`  -> No se encontró imagen en Wikipedia para ${title}. Usando iTunes...`);
          const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=album&limit=1`;
          const resI = await fetch(itunesUrl);
          const dataI = await resI.json();
          if (dataI.results && dataI.results.length > 0) {
              imageUrl = dataI.results[0].artworkUrl100.replace('100x100bb.jpg', '1000x1000bb.jpg');
          }
      }

      if (!imageUrl) {
          console.error(`  -> Fallo final: no se encontró imagen para ${title}`);
          return;
      }
        
      console.log(`  -> Intentando descargar URL... (fondo será removido)`);
        
      try {
          const imageBlob = await removeBackground(imageUrl);
          const arrayBuffer = await imageBlob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const imgPath = path.join(ARTISTS_DIR, `${id}.png`);
          fs.writeFileSync(imgPath, buffer);
          console.log(`  -> ¡EXITO! Imagen reemplazada en ${imgPath}`);
      } catch (e: any) {
          console.error(`  -> Error cortando fondo: ${e.message}`);
      }
  } catch (error) {
    console.error(`  -> Error de búsqueda:`, error);
  }
}

async function main() {
  for (const item of replacements) {
    await replaceImage(item.id, item.wikiTitle);
  }
  console.log('\n¡Reemplazo de 9 imágenes Finalizado!');
}

main().catch(console.error);
