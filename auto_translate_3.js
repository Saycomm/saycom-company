const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html') && file !== 'admin_s_66_66.html');

let translations = { en: {}, ru: {}, kz: {} };

htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });
    let fileModified = false;
    let count = 0;

    $('*').contents().each(function() {
        if (this.type === 'text') {
            const text = $(this).text().trim();
            // Ignore text that is purely whitespace, numbers, or simple punctuation
            if (text.length > 1 && !/^[\s0-9.,!?:;%()+-]+$/.test(text)) {
                const parent = $(this).parent();
                const tag = parent.prop('tagName');
                if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'NOSCRIPT' && tag !== 'SPAN') {
                    // Check if parent or any ancestor has data-i18n
                    if (parent.closest('[data-i18n]').length === 0) {
                        const key = `auto_mixed_${file.replace('.html', '')}_${count++}`;
                        translations.ru[key] = text;
                        translations.en[key] = text; 
                        translations.kz[key] = text; 
                        
                        // We replace the node with a span wrapping the ORIGINAL text (including spaces)
                        const originalText = $(this).text();
                        $(this).replaceWith(`<span data-i18n="${key}">${originalText}</span>`);
                        fileModified = true;
                    }
                }
            }
        }
    });

    if (fileModified) {
        fs.writeFileSync(path.join(__dirname, file), $.html());
        console.log(`Processed mixed content in ${file}`);
    }
});

fs.writeFileSync(path.join(__dirname, 'new_translations_3.json'), JSON.stringify(translations, null, 4));
console.log('Done generating mixed translations.');
