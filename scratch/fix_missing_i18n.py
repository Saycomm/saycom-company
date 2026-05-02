import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# 1. Inject data-i18n into HTML files
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Sub-navigation links
    content = content.replace(
        '<a href="/install-ac.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка кондиционеров</a>',
        '<a href="/install-ac.html" data-i18n="subnav_ac" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка кондиционеров</a>'
    )
    content = content.replace(
        '<a href="/install-cctv.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка видеонаблюдения</a>',
        '<a href="/install-cctv.html" data-i18n="subnav_cctv" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка видеонаблюдения</a>'
    )
    content = content.replace(
        '<a href="/install-gates.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка автоматических ворот</a>',
        '<a href="/install-gates.html" data-i18n="subnav_gates" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка автоматических ворот</a>'
    )
    content = content.replace(
        '<a href="/install-intercom.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка домофонов</a>',
        '<a href="/install-intercom.html" data-i18n="subnav_intercom" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Установка домофонов</a>'
    )
    
    # "Популярные запросы" - wait, my previous script probably added auto_installation-services_6 to it, but let's make sure it has one across all files.
    # Actually, in installation-services.html it has `data-i18n="auto_installation-services_6"`. Let's just create a standardized key for it if needed, or just add the new keys.
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Inject missing keys into translations.js
keys_to_add = {
    'top_bar_delivery': {'ru': 'Бесплатная доставка при заказе от ', 'en': 'Free Delivery for orders over ', 'kz': 'Тегін жеткізу: '},
    'subnav_ac': {'ru': 'Установка кондиционеров', 'en': 'AC Installation', 'kz': 'Кондиционер орнату'},
    'subnav_cctv': {'ru': 'Установка видеонаблюдения', 'en': 'CCTV Installation', 'kz': 'Бейнебақылау орнату'},
    'subnav_gates': {'ru': 'Установка автоматических ворот', 'en': 'Gate Automation', 'kz': 'Автоматты қақпа орнату'},
    'subnav_intercom': {'ru': 'Установка домофонов', 'en': 'Intercom Installation', 'kz': 'Домофон орнату'},
    # These "auto_*" keys might have been created by previous translation scripts but not added to translations.js properly
    'auto_installation-services_6': {'ru': 'Популярные запросы', 'en': 'Popular Searches', 'kz': 'Танымал сұраныстар'},
    'auto_installation-services_0': {'ru': '250 000 ₸', 'en': '250 000 ₸', 'kz': '250 000 ₸'},
}

with open('js/translations.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

for key, langs in keys_to_add.items():
    if f'"{key}"' not in js_content:
        # Inject into RU
        js_content = js_content.replace('ru: {\n', f'ru: {{\n        "{key}": "{langs["ru"]}",\n')
        # Inject into EN
        js_content = js_content.replace('en: {\n', f'en: {{\n        "{key}": "{langs["en"]}",\n')
        # Inject into KZ
        js_content = js_content.replace('kz: {\n', f'kz: {{\n        "{key}": "{langs["kz"]}",\n')

with open('js/translations.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

# 3. Update app.js to call updateUserUI() inside updateTranslations()
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

if 'updateUserUI();' not in app_js.split('function updateTranslations() {')[1].split('}')[0]:
    app_js = app_js.replace(
        'document.title = dict[\'site_title\'] || document.title;\n}',
        'document.title = dict[\'site_title\'] || document.title;\n    updateUserUI();\n}'
    )
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(app_js)

print("Injected missing translations and updated app.js to sync User UI on language change.")
