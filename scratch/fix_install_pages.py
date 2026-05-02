import re

def create_full_pages():
    with open('installation-services.html', 'r', encoding='utf-8') as f:
        template = f.read()

    # We want to replace everything from <section class="service-hero"> down to just before <!-- Footer -->
    pattern = re.compile(r'<section class="service-hero">.*?(?=<!-- Footer -->)', re.DOTALL)
    
    dynamic_content = """
    <!-- Dynamic Installation Content -->
    <section class="service-hero" style="padding: 60px 0; background: linear-gradient(rgba(11, 17, 32, 0.9), rgba(11, 17, 32, 0.95)), url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80'); background-size: cover; background-position: center;">
        <div class="container" style="text-align: center;">
            <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--primary); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 15px; display: inline-block;">УСЛУГИ СЕРВИСА</span>
            <h1 style="color: white; font-size: 42px; margin-bottom: 20px;">{TITLE}</h1>
        </div>
    </section>

    <section class="section" style="padding: 60px 0; min-height: 50vh;">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
            <p id="dyn_desc" style="color: var(--text-muted); font-size: 16px; line-height: 1.8; margin-bottom: 40px; text-align: center;">Загрузка описания...</p>
            
            <div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h2 style="margin-bottom: 25px; font-size: 24px; color: white; display: flex; align-items: center; gap: 10px;"><i class="fa-solid fa-list-check" style="color: var(--primary);"></i> Прайс-лист на работы</h2>
                
                <div style="display: flex; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); align-items: center;">
                    <strong style="font-size: 18px; color: white;">Базовая установка:</strong>
                    <span id="dyn_base_price" style="font-size: 22px; color: var(--primary); font-weight: 800; background: rgba(16, 185, 129, 0.1); padding: 8px 16px; border-radius: 8px;">... ₸</span>
                </div>
                
                <div id="dyn_options" style="margin-top: 30px;">
                    <!-- Options will be loaded here -->
                </div>
                
                <div style="margin-top: 40px; text-align: center;">
                    <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 18px; font-size: 16px;" onclick="window.location.href='/contact.html'">Заказать выезд инженера</button>
                </div>
            </div>
        </div>
    </section>

    <script>
        async function loadData() {
            try {
                const res = await fetch('/api/installations');
                const result = await res.json();
                const data = result.data['install_{KEY}'] || {};
                
                document.getElementById('dyn_desc').innerText = data.description || 'Подробное описание услуги пока не добавлено. Свяжитесь с нами для уточнения деталей.';
                document.getElementById('dyn_base_price').innerText = (data.base_price ? new Intl.NumberFormat('ru-RU').format(data.base_price) : '0') + ' ₸';
                
                if (data.options && data.options.length > 0) {
                    const optsHtml = data.options.map(opt => `
                        <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); color: #94A3B8; align-items: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 15px;">${opt.name}</span>
                            <span style="color: white; font-weight: 600; font-family: 'Courier New', monospace; font-size: 15px;">+${new Intl.NumberFormat('ru-RU').format(opt.price)} ₸</span>
                        </div>
                    `).join('');
                    document.getElementById('dyn_options').innerHTML = '<h3 style="margin: 0 0 20px; font-size: 16px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Дополнительные работы:</h3>' + optsHtml;
                } else {
                    document.getElementById('dyn_options').innerHTML = '';
                }
            } catch (err) {
                console.error(err);
                document.getElementById('dyn_desc').innerText = 'Ошибка при загрузке данных.';
            }
        }
        loadData();
    </script>
    """

    pages = {
        'install-ac.html': ('Установка кондиционеров', 'ac'),
        'install-cctv.html': ('Установка видеонаблюдения', 'cctv'),
        'install-gates.html': ('Установка автоматических ворот', 'gates'),
        'install-intercom.html': ('Установка домофонов', 'intercom')
    }

    for filename, (title, key) in pages.items():
        new_content = pattern.sub(dynamic_content.replace('{TITLE}', title).replace('{KEY}', key), template)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Re-generated {filename} with full layout")

if __name__ == '__main__':
    create_full_pages()
