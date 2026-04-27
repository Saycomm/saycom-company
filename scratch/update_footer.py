import os
import re

directory = '/Users/abdullohkhikmatzhanow/saycom-company'
files = [
    'spare-parts.html', 'intercom-systems.html', 'wholesale.html', 
    'automatic-gates.html', 'about-us.html', 'installation-services.html', 
    'air-conditioners.html', 'contact.html', 'all-products.html', 
    'index.html', 'cctv-systems.html'
]

for filename in files:
    file_path = os.path.join(directory, filename)
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match the footer right bottom div and its contents
    pattern = r'<!-- Footer Right Bottom -->\s*<div\s*style="display: flex; justify-content: space-between; align-items: center; color: var\(--text-muted\); font-size: 11px; font-weight: 500;">\s*<div style="display: flex; gap: 25px; align-items:center;">\s*<span (data-i18n="[^"]*")>(.*?)</span>\s*<a href="#" style="color: var\(--text-muted\); text-decoration: none;"\s*(data-i18n="[^"]*")>(.*?)</a>\s*<a href="#" style="color: var\(--text-muted\); text-decoration: none;"\s*(data-i18n="[^"]*")>(.*?)</a>\s*</div>\s*<div style="display: flex; gap: 30px;">\s*<div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-shield-halved"\s*style="font-size: 13px;"></i><span (data-i18n="[^"]*")>(.*?)</span></div>\s*<div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-truck"\s*style="font-size: 13px;"></i><span (data-i18n="[^"]*")>(.*?)</span></div>\s*<div style="display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-headphones"\s*style="font-size: 13px;"></i><span (data-i18n="[^"]*")>(.*?)</span></div>\s*</div>\s*</div>'
    
    # Replacement template using classes
    replacement = r'''<!-- Footer Right Bottom -->
                <div class="footer-right-bottom">
                    <div class="footer-copyright-links">
                        <span \1>\2</span>
                        <a href="#" style="color: var(--text-muted); text-decoration: none;" \3>\4</a>
                        <a href="#" style="color: var(--text-muted); text-decoration: none;" \5>\6</a>
                    </div>
                    <div class="footer-trust-icons">
                        <div class="trust-item"><i class="fa-solid fa-shield-halved"></i><span \7>\8</span></div>
                        <div class="trust-item"><i class="fa-solid fa-truck"></i><span \9>\10</span></div>
                        <div class="trust-item"><i class="fa-solid fa-headphones"></i><span \11>\12</span></div>
                    </div>
                </div>'''
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No match for {filename}")
