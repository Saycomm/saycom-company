import os
import re

def update_html_files():
    # Find all HTML files in the current directory
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    
    favicon_tags = (
        '    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2">\n'
        '    <link rel="icon" type="image/png" href="/uploads/icon_premium_v2.png">\n'
        '    <link rel="apple-touch-icon" href="/uploads/icon_premium_v2.png">'
    )
    
    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove any existing favicon links to avoid duplicates
        content = re.sub(r'    <link rel="(shortcut )?icon".*?>\n?', '', content)
        content = re.sub(r'    <link rel="apple-touch-icon".*?>\n?', '', content)
        
        # Insert before </head>
        if '</head>' in content:
            # Check if tags already there (though we just subbed them)
            if '/favicon.ico?v=2' not in content:
                content = content.replace('</head>', f'{favicon_tags}\n</head>')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

if __name__ == "__main__":
    update_html_files()
