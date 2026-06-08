const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const files = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.html') && !f.startsWith('admin_') && !f.startsWith('yandex_'));

console.log('Searching for inline styles containing white color in HTML files:');

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    const elements = [];
    $('[style]').each((i, el) => {
        const style = $(el).attr('style');
        if (/color\s*:\s*(white|#fff|#ffffff|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i.test(style)) {
            // Get element description
            const tagName = el.tagName;
            const text = $(el).text().trim().substring(0, 50);
            const parentClasses = $(el).parent().attr('class') || '';
            elements.push({
                tagName,
                style,
                text,
                parentClasses
            });
        }
    });
    
    if (elements.length > 0) {
        console.log(`\nFile: ${file} (found ${elements.length} elements)`);
        elements.forEach(item => {
            console.log(`  <${item.tagName} style="${item.style}"> "${item.text}" | parent class="${item.parentClasses}"`);
        });
    }
});
