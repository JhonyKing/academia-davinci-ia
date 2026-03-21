import fs from 'fs';
import path from 'path';

const dirs = ['public/GANCHOS SI A TI TE GUSTA', 'public/artists'];
dirs.forEach(dir => {
  console.log(`Contents of ${dir}:`);
  const files = fs.readdirSync(dir);
  files.filter(f => f.includes('JOSE')).forEach(f => {
    console.log(`  "${f}" (${f.length} chars) - Codes: ${[...f].map(c => c.charCodeAt(0)).join(',')}`);
  });
});
