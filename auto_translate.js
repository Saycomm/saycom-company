const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const files = [
    'auth.html', 'cart.html', 'checkout.html', 'faq.html', 
    'profile.html', 'projects.html', 'team.html', 'wishlist.html'
];

let newTranslations = { en: {}, ru: {}, kz: {} };
let counter = 0;

function processFile(filename) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) return;
    
    let html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    
    let modified = false;

    // Helper to add translation
    function addTranslation(text, baseKey) {
        text = text.trim();
        if (!text) return null;
        if (text.match(/^[0-9]+$/)) return null; // Skip pure numbers
        if (text.match(/^[{<]/)) return null; // Skip JSON or HTML snippets
        
        const key = `auto_${filename.replace('.html', '')}_${counter++}`;
        newTranslations.ru[key] = text;
        newTranslations.en[key] = text; // Placeholder
        newTranslations.kz[key] = text; // Placeholder
        return key;
    }

    // Process placeholders
    $('input[placeholder], textarea[placeholder]').each((i, el) => {
        if (!$(el).attr('data-i18n-placeholder')) {
            const p = $(el).attr('placeholder');
            if (p) {
                const key = addTranslation(p, 'placeholder');
                if (key) {
                    $(el).attr('data-i18n-placeholder', key);
                    modified = true;
                }
            }
        }
    });

    // Process text nodes
    $('*').contents().each((i, el) => {
        if (el.type === 'text') {
            const text = $(el).text().trim();
            const parent = $(el).parent();
            
            // Skip script, style, and already translated
            if (parent.is('script, style, noscript') || parent.attr('data-i18n') || !text) return;
            
            // If parent only contains this text
            if (parent.contents().length === 1) {
                const key = addTranslation(text, 'text');
                if (key) {
                    parent.attr('data-i18n', key);
                    modified = true;
                }
            } else {
                // Wrap text node in span
                const key = addTranslation(text, 'text');
                if (key) {
                    const span = $(`<span data-i18n="${key}"></span>`).text(text);
                    $(el).replaceWith(span);
                    modified = true;
                }
            }
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html());
        console.log(`Updated ${filename}`);
    }
}

files.forEach(processFile);

fs.writeFileSync(path.join(__dirname, 'new_translations.json'), JSON.stringify(newTranslations, null, 2));
console.log('Done generating new translations.');
