import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve('public/hooks-data.json');

async function autoAdjustStart() {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    for (const hook of data) {
        if (hook.words && hook.words.length > 0) {
            const firstWordStart = hook.words[0].start;
            // Pad slightly (0.05s) to avoid clipping the very first millisecond
            hook.startFromSeconds = Math.max(0, firstWordStart - 0.05);
            console.log(`Adjusted ${hook.artist}: ${hook.startFromSeconds}s`);
        }
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log('Finished updating start times.');
}

autoAdjustStart().catch(console.error);
