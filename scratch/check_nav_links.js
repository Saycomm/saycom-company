const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const files = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.html') && !f.startsWith('admin_') && !f.startsWith('yandex_'));

console.log(`Checking nav links for ${files.length} HTML files:`);

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // Find all links inside the nav-container
    const links = [];
    $('.nav-container a.nav-link').each((i, el) => {
        links.push({
            text: $(el).text().trim(),
            href: $(el).attr('href'),
            i18n: $(el).attr('data-i18n'),
            filename: $(el).attr('data-filename')
        });
    });
    
    console.log(`\nFile: ${file} (found ${links.length} nav links)`);
    links.forEach((link, idx) => {
        console.log(`  [${idx}] "${link.text}" | href="${link.href}" | data-i18n="${link.i18n}" | data-filename="${link.filename}"`);
    });
});
