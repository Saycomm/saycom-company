const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const files = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.html') && !f.startsWith('admin_') && !f.startsWith('yandex_'));

const targetStyle = "padding: 15px 0; color: var(--text-muted); border-bottom: 2px solid transparent; position: relative; transition: 0.2s;";

console.log('Standardizing navigation link styles across HTML files:');

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    let html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    let updated = false;
    $('.nav-container a.nav-link').each((i, el) => {
        const style = $(el).attr('style');
        if (style && style.trim() !== targetStyle) {
            $(el).attr('style', targetStyle);
            updated = true;
        }
    });
    
    if (updated) {
        fs.writeFileSync(filePath, $.html(), 'utf8');
        console.log(`Updated nav styles in: ${file}`);
    } else {
        console.log(`Skipped (already correct): ${file}`);
    }
});
