import os
import re

def clean_html_files():
    directory = '.'
    # This regex looks for the mobile header style block inside <style> tags
    # It targets the specific block starting with /* Header stacking */ and ending at the next @media end or similar
    # However, to be safer, let's just target the specific CSS rules that conflict.
    
    # Actually, the user wants me to fix the header structure too.
    # Let's target the /* Header stacking */ comment and remove the rules following it until the end of that media query section.
    
    files = [f for f in os.listdir(directory) if f.endswith('.html')]
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the conflicting inline mobile styles
        # These blocks usually look like:
        # /* Header stacking */
        # .header-container { ... }
        # .logo { ... }
        # .search-wrap { ... }
        # .header-actions { ... }
        
        # We want to remove these so style.css takes over.
        
        patterns_to_remove = [
            r'/\* Header stacking \*/\s*\.header-container\s*\{[^}]+\}\s*\.logo\s*\{[^}]+\}\s*\.search-wrap\s*\{[^}]+\}\s*\.header-actions\s*\{[^}]+\}',
            r'\.nav-container,\s*\.sub-nav\s*\.container\s*\{[^}]+\}',
            r'\.nav-container::-webkit-scrollbar,\s*\.sub-nav\s*\.container::-webkit-scrollbar\s*\{[^}]+\}',
            r'\.nav-container\s*a,\s*\.sub-nav\s*\.container\s*a\s*\{[^}]+\}'
        ]
        
        new_content = content
        for pattern in patterns_to_remove:
            new_content = re.sub(pattern, '', new_content, flags=re.DOTALL)
            
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned {filename}")

if __name__ == "__main__":
    clean_html_files()
