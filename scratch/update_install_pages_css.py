import os
import re

def update_installation_pages():
    directory = '.'
    files = [f for f in os.listdir(directory) if f.startswith('install-') and f.endswith('.html')]
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Update the Price List Card
        content = content.replace(
            '<div style="background: rgba(255,255,255,0.02); padding: 40px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">',
            '<div class="price-list-card">'
        )
        
        # 2. Update the Title
        content = content.replace(
            '<h2 style="margin-bottom: 25px; font-size: 24px; color: white; display: flex; align-items: center; gap: 10px;">',
            '<h2 class="price-list-title">'
        )
        
        # 3. Update the Base Price Row
        content = content.replace(
            '<div style="display: flex; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); align-items: center;">',
            '<div class="price-item-main">'
        )
        
        # 4. Update the Base Price Badge
        content = content.replace(
            '<span id="dyn_base_price" style="font-size: 22px; color: var(--primary); font-weight: 800; background: rgba(16, 185, 129, 0.1); padding: 8px 16px; border-radius: 8px;">',
            '<span id="dyn_base_price" class="price-badge">'
        )
        
        # 5. Update the Dynamic Options Logic in JS
        # We need to update the map function in JS to use the new classes
        js_old_opt = 'document.getElementById(\'dyn_options\').innerHTML = \'<h3 style="margin: 0 0 20px; font-size: 16px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Дополнительные работы:</h3>\' + optsHtml;'
        js_new_opt = 'document.getElementById(\'dyn_options\').innerHTML = \'<h3 class="price-options-title">Дополнительные работы:</h3>\' + optsHtml;'
        content = content.replace(js_old_opt, js_new_opt)
        
        js_old_row = '<div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); color: #94A3B8; align-items: center; transition: 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.02)\'" onmouseout="this.style.background=\'transparent\'">'
        js_new_row = '<div class="price-option-row">'
        content = content.replace(js_old_row, js_new_row)
        
        js_old_name = '<span style="font-size: 15px;">${opt.name}</span>'
        js_new_name = '<span class="price-option-name">${opt.name}</span>'
        content = content.replace(js_old_name, js_new_name)
        
        js_old_val = '<span style="color: white; font-weight: 600; font-family: \'Courier New\', monospace; font-size: 15px;">+${new Intl.NumberFormat(\'ru-RU\').format(opt.price)} ₸</span>'
        js_new_val = '<span class="price-option-val">+${new Intl.NumberFormat(\'ru-RU\').format(opt.price)} ₸</span>'
        content = content.replace(js_old_val, js_new_val)
        
        # 6. Update the Button
        content = content.replace(
            '<button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 18px; font-size: 16px;" onclick="window.location.href=\'/contact.html\'">Заказать выезд инженера</button>',
            '<button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="window.location.href=\'contact.html\'">ЗАКАЗАТЬ ВЫЕЗД ИНЖЕНЕРА</button>'
        )

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")

if __name__ == "__main__":
    update_installation_pages()
