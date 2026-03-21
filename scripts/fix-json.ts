import fs from 'fs';
import path from 'path';

const OUTPUT_DATA = path.join(process.cwd(), 'public', 'hooks-data.json');
const hooks = JSON.parse(fs.readFileSync(OUTPUT_DATA, 'utf-8'));

for (const hook of hooks) {
  hook.startFromSeconds = 0;
  hook.words = [];
}

fs.writeFileSync(OUTPUT_DATA, JSON.stringify(hooks, null, 2));
console.log('Fixed hooks-data.json: All start times set to 0 and words cleared.');
