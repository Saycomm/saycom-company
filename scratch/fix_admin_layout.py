import re

with open('admin_s_66_66.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the HTML structure of installations-tab
old_html_regex = re.compile(
    r'<div id="installations-tab" class="tab-content">.*?<div class="admin-layout" id="install-form-container" style="display:none;">',
    re.DOTALL
)

new_html = """<div id="installations-tab" class="tab-content">
            <div class="settings-layout">
                <div class="settings-nav" id="install-nav-items">
                    <div class="s-nav-item active" onclick="loadInstallForm('ac')"><i class="fa-solid fa-wind"></i> Кондиционеры</div>
                    <div class="s-nav-item" onclick="loadInstallForm('cctv')"><i class="fa-solid fa-camera"></i> Видеонаблюдение</div>
                    <div class="s-nav-item" onclick="loadInstallForm('gates')"><i class="fa-solid fa-door-open"></i> Автоматические ворота</div>
                    <div class="s-nav-item" onclick="loadInstallForm('intercom')"><i class="fa-solid fa-phone"></i> Домофоны</div>
                </div>
                
                <div class="settings-main" id="install-form-container" style="display:none;">"""

content = old_html_regex.sub(new_html, content)

# Also need to close the settings-layout div instead of the admin-layout div.
# Currently it is:
#             </form>
#         </div>
#     </div>
# </div>
# Which maps to form-panel -> admin-layout -> tab-content.
# But settings-layout needs an extra div because it's settings-main -> settings-layout -> tab-content.
# Actually, the old structure is:
# <div class="admin-layout"> <div class="form-panel"> ... </div> </div> </div>
# The new structure is:
# <div class="settings-layout"> <div class="settings-nav">...</div> <div class="settings-main"> <div class="form-panel"> ... </div> </div> </div> </div>
# Wait, replacing `<div class="admin-layout" id="install-form-container" style="display:none;">` with `<div class="settings-main" id="install-form-container" style="display:none;">` means the number of divs is exactly the same!
# Let's check:
# Old: tab-content -> admin-layout -> form-panel
# New: tab-content -> settings-layout -> settings-main -> form-panel
# Wait, old has 3 open divs. New has 4 open divs (tab-content, settings-layout, settings-nav[closed], settings-main, form-panel).
# So I need to add one more closing `</div>` right before `</main>`. Or specifically at the end of installations-tab.

# Let's find the end of installations-tab.
end_tab_regex = re.compile(
    r'            </form>\s*</div>\s*</div>\s*</div>\s*</main>',
    re.DOTALL
)

new_end_tab = """            </form>
                </div>
            </div>
        </div>
    </div>
</main>"""

content = end_tab_regex.sub(new_end_tab, content)

# 2. Update the JS for highlighting the active tab
# The old JS does:
#             const buttons = document.querySelectorAll('#installations-tab .btn');
#             buttons.forEach(b => {
#                 b.style.background = 'rgba(255,255,255,0.03)';
#                 b.style.color = 'var(--text-muted)';
#                 b.style.borderColor = 'var(--border-color)';
#                 b.style.boxShadow = 'none';
#             });
#             const activeButton = Array.from(buttons).find(b => b.getAttribute('onclick').includes(key));
#             if (activeButton) { ... }

old_js_regex = re.compile(
    r'// Highlight active button\s*const buttons = document\.querySelectorAll\(.*?if \(activeButton\) \{.*?\n\s*\}',
    re.DOTALL
)

new_js = """// Highlight active button
            const items = document.querySelectorAll('#install-nav-items .s-nav-item');
            items.forEach(item => item.classList.remove('active'));
            const activeItem = Array.from(items).find(item => item.getAttribute('onclick').includes(`'${key}'`));
            if (activeItem) {
                activeItem.classList.add('active');
            }"""

content = old_js_regex.sub(new_js, content)

with open('admin_s_66_66.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated admin layout to match Settings tab design.")
