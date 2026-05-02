import os
import glob
import re

html_files = glob.glob('*.html')

nav_item_regex = re.compile(
    r'(<a href="/installation-services" data-i18n="nav_install" class="nav-link"\s*data-filename="installation-services\.html"\s*style="[^"]*">Услуги\s*монтажа</a>)',
    re.MULTILINE
)

dropdown_html = """
            <div class="nav-dropdown" style="position: relative; display: flex; align-items: center;">
                <a href="/installation-services" data-i18n="nav_install" class="nav-link"
                    data-filename="installation-services.html"
                    style="padding: 15px 0; color: var(--text-muted); border-bottom: 2px solid transparent; position: relative; transition: 0.2s; display: flex; align-items: center; gap: 5px;">Услуги
                    монтажа <i class="fa-solid fa-chevron-down" style="font-size: 10px;"></i></a>
                <div class="dropdown-menu" style="position: absolute; top: 100%; left: 0; background: rgba(13, 20, 33, 0.95); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 0; min-width: 250px; display: none; flex-direction: column; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                    <a href="/install-ac" class="dropdown-item" style="padding: 10px 20px; color: white; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: 500;">Установка кондиционеров</a>
                    <a href="/install-cctv" class="dropdown-item" style="padding: 10px 20px; color: white; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: 500;">Установка видеонаблюдения</a>
                    <a href="/install-gates" class="dropdown-item" style="padding: 10px 20px; color: white; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: 500;">Установка автоматических ворот</a>
                    <a href="/install-intercom" class="dropdown-item" style="padding: 10px 20px; color: white; text-decoration: none; transition: 0.2s; font-size: 13px; font-weight: 500;">Установка домофонов</a>
                </div>
                <style>
                    .nav-dropdown:hover .dropdown-menu { display: flex !important; }
                    .dropdown-item:hover { background: rgba(16, 185, 129, 0.1) !important; color: var(--primary) !important; }
                </style>
            </div>
""".strip()

for file in html_files:
    if file.startswith('admin_'):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "nav-dropdown" in content and "install-ac" in content:
        print(f"Skipping {file}, already updated.")
        continue
        
    new_content, count = nav_item_regex.subn(dropdown_html, content)
    if count > 0:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"No match found in {file}")

