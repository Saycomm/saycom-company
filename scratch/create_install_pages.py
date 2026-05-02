import os

template = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE} - SAYCOM</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body style="background: var(--bg-color); color: white;">
    <!-- Include the header here -->
    
    <div style="padding: 100px 20px; max-width: 800px; margin: auto;">
        <h1 style="font-size: 36px; margin-bottom: 20px;">{TITLE}</h1>
        <p id="dyn_desc" style="color: var(--text-muted); line-height: 1.8; margin-bottom: 40px;">Загрузка описания...</p>
        
        <div style="background: rgba(255,255,255,0.03); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color);">
            <h2 style="margin-bottom: 20px; font-size: 24px;">Прайс-лист</h2>
            
            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <strong style="font-size: 18px;">Базовая установка:</strong>
                <span id="dyn_base_price" style="font-size: 18px; color: var(--primary); font-weight: 700;">... ₸</span>
            </div>
            
            <div id="dyn_options" style="margin-top: 20px;">
                <!-- Options will be loaded here -->
            </div>
        </div>
    </div>

    <script>
        async function loadData() {
            try {
                const res = await fetch('/api/installations');
                const result = await res.json();
                const data = result.data['install_{KEY}'] || {};
                
                document.getElementById('dyn_desc').innerText = data.description || 'Описание пока не добавлено.';
                document.getElementById('dyn_base_price').innerText = (data.base_price || '0') + ' ₸';
                
                if (data.options && data.options.length > 0) {
                    const optsHtml = data.options.map(opt => `
                        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); color: #94A3B8;">
                            <span>${opt.name}</span>
                            <span style="color: white; font-weight: 600;">+${opt.price} ₸</span>
                        </div>
                    `).join('');
                    document.getElementById('dyn_options').innerHTML = '<h3 style="margin: 20px 0 15px; font-size: 16px;">Дополнительные работы:</h3>' + optsHtml;
                } else {
                    document.getElementById('dyn_options').innerHTML = '';
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadData();
    </script>
</body>
</html>
"""

pages = {
    'install-ac.html': ('Установка кондиционеров', 'ac'),
    'install-cctv.html': ('Установка видеонаблюдения', 'cctv'),
    'install-gates.html': ('Установка автоматических ворот', 'gates'),
    'install-intercom.html': ('Установка домофонов', 'intercom')
}

for filename, (title, key) in pages.items():
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(template.replace('{TITLE}', title).replace('{KEY}', key))
    print(f"Created {filename}")
