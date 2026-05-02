import os
import re

def aggressive_clean():
    directory = '.'
    files = [f for f in os.listdir(directory) if f.endswith('.html')]
    
    # Common classes that should be handled by style.css globally on mobile
    target_classes = [
        r'\.header-container', r'\.logo', r'\.search-wrap', r'\.header-actions',
        r'\.nav-container', r'\.sub-nav', r'\.user-btn-desktop', r'\.main-nav',
        r'\.nav-link', r'\.search-bar', r'\.top-bar', r'\.top-bar-container',
        r'\.action-btn'
    ]
    
    for filename in files:
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to find @media (max-width: 768px) { ... } and clean it
        # This is tricky with regex, so we'll look for specific rules inside style tags
        
        new_content = content
        
        # Remove entire rule blocks for the target classes inside any <style> tags
        for cls in target_classes:
            # Match .class-name { ... } including nested braces if any (simple version)
            pattern = rf'{cls}\s*\{{[^}}]+\}}'
            new_content = re.sub(pattern, '', new_content, flags=re.DOTALL)
            
        # Also remove the specific /* Header stacking */ comments if any left
        new_content = re.sub(r'/\* Header stacking \*/', '', new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned {filename}")

if __name__ == "__main__":
    aggressive_clean()
