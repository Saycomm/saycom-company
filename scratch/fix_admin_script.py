import re

with open('admin_s_66_66.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the buttons to look correct and active
new_buttons = """<div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px;">
                <button class="btn" style="background: rgba(16, 185, 129, 0.1); color: var(--primary); border: 1px solid var(--primary);" onclick="loadInstallForm('ac')">Кондиционеры</button>
                <button class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border-color);" onclick="loadInstallForm('cctv')">Видеонаблюдение</button>
                <button class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border-color);" onclick="loadInstallForm('gates')">Автоматические ворота</button>
                <button class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border-color);" onclick="loadInstallForm('intercom')">Домофоны</button>
            </div>"""

content = re.sub(
    r'<div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px;">.*?</div>',
    new_buttons,
    content,
    flags=re.DOTALL
)

# 2. Add the missing JS
install_js = """
        // --- INSTALLATIONS JS ---
        function addInstallOptionRow(name='', price='') {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '8px'; div.style.marginBottom = '8px';
            div.innerHTML = `<input type="text" placeholder="Название услуги (напр: Метр магистрали)" value="${name}" style="flex:2;"><input type="number" placeholder="Цена (₸)" value="${price}" style="flex:1;"><button type="button" onclick="this.parentElement.remove()" style="background:#EF4444; border:none; border-radius:6px; color:white; width:34px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>`;
            const container = document.getElementById('inst_options_container');
            if(container) container.appendChild(div);
        }

        async function loadInstallForm(key) {
            document.getElementById('install-form-container').style.display = 'block';
            document.getElementById('inst_key').value = key;
            const titles = {
                'ac': 'Установка кондиционеров',
                'cctv': 'Установка видеонаблюдения',
                'gates': 'Установка автоматических ворот',
                'intercom': 'Установка домофонов'
            };
            document.getElementById('installTitle').innerText = titles[key];
            
            // Highlight active button
            const buttons = document.querySelectorAll('#installations-tab .btn');
            buttons.forEach(b => {
                b.style.background = 'rgba(255,255,255,0.05)';
                b.style.color = 'white';
                b.style.borderColor = 'var(--border-color)';
            });
            const activeButton = Array.from(buttons).find(b => b.getAttribute('onclick').includes(key));
            if (activeButton) {
                activeButton.style.background = 'rgba(16, 185, 129, 0.1)';
                activeButton.style.color = 'var(--primary)';
                activeButton.style.borderColor = 'var(--primary)';
            }
            
            // Clear form
            document.getElementById('inst_desc').value = '';
            document.getElementById('inst_base_price').value = '';
            document.getElementById('inst_options_container').innerHTML = '';
            
            try {
                const res = await fetch('/api/installations');
                const result = await res.json();
                const data = result.data[`install_${key}`] || {};
                
                document.getElementById('inst_desc').value = data.description || '';
                document.getElementById('inst_base_price').value = data.base_price || '';
                if (data.options && Array.isArray(data.options)) {
                    data.options.forEach(opt => addInstallOptionRow(opt.name, opt.price));
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function handleInstallSave(e) {
            e.preventDefault();
            const key = document.getElementById('inst_key').value;
            const description = document.getElementById('inst_desc').value;
            const base_price = document.getElementById('inst_base_price').value;
            
            const options = [];
            document.querySelectorAll('#inst_options_container div').forEach(row => {
                const inputs = row.querySelectorAll('input');
                if(inputs.length >= 2 && inputs[0].value) {
                    options.push({ name: inputs[0].value, price: inputs[1].value });
                }
            });
            
            const payload = { description, base_price, options };
            const btn = document.getElementById('btnInstallSave');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> СОХРАНЕНИЕ...';
            
            try {
                const res = await fetch(`/api/installations/${key}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) alert("Настройки сохранены!");
                else alert("Ошибка сохранения");
            } catch (err) {
                alert("Ошибка соединения");
            } finally {
                btn.innerHTML = 'СОХРАНИТЬ НАСТРОЙКИ';
            }
        }

        // --- TAB SWITCHING LOGIC ---
"""
content = content.replace('// --- TAB SWITCHING LOGIC ---', install_js)

# 3. Modify switchTab to load AC by default
switch_tab_orig = """function switchTab(tab, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            
            const targetTab = document.getElementById(tab + '-tab');
            if (targetTab) targetTab.classList.add('active');
            if (el) el.classList.add('active');"""

switch_tab_new = """function switchTab(tab, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            
            const targetTab = document.getElementById(tab + '-tab');
            if (targetTab) targetTab.classList.add('active');
            if (el) el.classList.add('active');
            
            if (tab === 'installations') {
                loadInstallForm('ac');
            }"""

content = content.replace(switch_tab_orig, switch_tab_new)

with open('admin_s_66_66.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed admin_s_66_66.html script logic and button styles.")
