const fs = require('fs');
const path = require('path');

const newTrans = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_translations_3.json')));
const transFile = path.join(__dirname, 'js', 'translations.js');

let currentTransText = fs.readFileSync(transFile, 'utf8');

// Use simple regex to append to en, ru, kz objects
for (const lang of ['en', 'ru', 'kz']) {
    let snippet = '';
    for (const key in newTrans[lang]) {
        let val = newTrans[lang][key].replace(/"/g, '\\"').replace(/\n/g, '\\n');
        snippet += `\n        "${key}": "${val}",`;
    }
    
    // Find where the lang object starts: `en: {` or `"en": {`
    const regex = new RegExp(`(${lang}\\s*:\\s*\\{)`);
    currentTransText = currentTransText.replace(regex, `$1${snippet}`);
}

fs.writeFileSync(transFile, currentTransText);
console.log('Merged translations successfully.');
