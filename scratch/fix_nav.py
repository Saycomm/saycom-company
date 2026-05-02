import glob
import re

html_files = glob.glob('*.html')

# Regex to find the dropdown we just added and revert it to the original link
dropdown_regex = re.compile(
    r'<div class="nav-dropdown" style="position: relative; display: flex; align-items: center;">\s*<a href="/installation-services"[^>]*>Услуги\s*монтажа <i class="fa-solid fa-chevron-down"[^>]*></i></a>\s*<div class="dropdown-menu"[^>]*>.*?</div>\s*<style>.*?</style>\s*</div>',
    re.DOTALL
)

original_link = '<a href="/installation-services" data-i18n="nav_install" class="nav-link" data-filename="installation-services.html" style="padding: 15px 0; color: var(--text-muted); border-bottom: 2px solid transparent; position: relative; transition: 0.2s;">Услуги монтажа</a>'

# Regex to find the end of the main nav and insert the sub-nav
main_nav_end_regex = re.compile(r'</nav>')

sub_nav_html = """</nav>

    <!-- Sub Navigation for Installations -->
    <nav class="sub-nav" style="background: rgba(13, 20, 33, 0.5); border-bottom: 1px solid var(--border-color); padding: 10px 0;">
        <div class="container" style="display: flex; gap: 20px; font-size: 13px; font-weight: 500; justify-content: center;">
            <a href="/install-ac.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Установка кондиционеров</a>
            <span style="color: var(--border-color);">|</span>
            <a href="/install-cctv.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Установка видеонаблюдения</a>
            <span style="color: var(--border-color);">|</span>
            <a href="/install-gates.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Установка автоматических ворот</a>
            <span style="color: var(--border-color);">|</span>
            <a href="/install-intercom.html" style="color: var(--text-muted); text-decoration: none; transition: 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">Установка домофонов</a>
        </div>
    </nav>"""

for file in html_files:
    if file.startswith('admin_'):
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Revert dropdown
    if "nav-dropdown" in content:
        content = dropdown_regex.sub(original_link, content)
        
    # 2. Add sub-nav if not exists
    if "Sub Navigation for Installations" not in content:
        # replace the FIRST </nav> with </nav> + sub_nav_html
        content = content.replace('</nav>', sub_nav_html, 1)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Skipped {file}")
