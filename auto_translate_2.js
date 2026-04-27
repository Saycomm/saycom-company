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
            if (text.length > 1 && !/^[0-9\s.,!?:;-]+$/.test(text) && $(this).parent().prop('tagName') !== 'SCRIPT' && $(this).parent().prop('tagName') !== 'STYLE') {
                const parent = $(this).parent();
                if (!parent.attr('data-i18n') && parent.children().length === 0) {
                    const key = `auto_${file.replace('.html', '')}_${count++}`;
                    parent.attr('data-i18n', key);
                    translations.ru[key] = text;
                    translations.en[key] = text; 
                    translations.kz[key] = text; 
                    fileModified = true;
                }
            }
        }
    });

    $('input[placeholder], textarea[placeholder]').each(function() {
        if (!$(this).attr('data-i18n-placeholder')) {
            const placeholder = $(this).attr('placeholder').trim();
            if (placeholder.length > 1) {
                const key = `auto_${file.replace('.html', '')}_${count++}`;
                $(this).attr('data-i18n-placeholder', key);
                translations.ru[key] = placeholder;
                translations.en[key] = placeholder; 
                translations.kz[key] = placeholder; 
                fileModified = true;
            }
        }
    });

    if (fileModified) {
        fs.writeFileSync(path.join(__dirname, file), $.html());
        console.log(`Processed ${file}`);
    }
});

fs.writeFileSync(path.join(__dirname, 'new_translations_2.json'), JSON.stringify(translations, null, 4));
console.log('Done generating new translations.');
