import re

def main():
    # 1. Read spare-parts.html to extract header and footer HTML
    with open('spare-parts.html', 'r', encoding='utf-8') as f:
        spare_parts_content = f.read()
    
    # Extract header (from <!-- Top Bar --> to <!-- Page Content -->)
    header_pattern = re.compile(r'(<!-- Top Bar -->.*?)(?=\s*<!-- Page Content -->)', re.DOTALL)
    header_match = header_pattern.search(spare_parts_content)
    if not header_match:
        print("Error: Could not find header pattern in spare-parts.html")
        return
    header_html = header_match.group(1)
    
    # Extract footer (from <!-- Footer --> to </footer>)
    footer_pattern = re.compile(r'(<!-- Footer -->.*?</footer>)', re.DOTALL)
    footer_match = footer_pattern.search(spare_parts_content)
    if not footer_match:
        print("Error: Could not find footer pattern in spare-parts.html")
        return
    footer_html = footer_match.group(1)
    
    # 2. Inject into target files
    targets = ['cart.html', 'wishlist.html']
    for target in targets:
        with open(target, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace placeholders
        new_content = content
        if 'id="header-placeholder"' in new_content:
            new_content = re.sub(r'<div id="header-placeholder"></div>', header_html, new_content)
            print(f"Injected header into {target}")
        if 'id="footer-placeholder"' in new_content:
            new_content = re.sub(r'<div id="footer-placeholder"></div>', footer_html, new_content)
            print(f"Injected footer into {target}")
            
        with open(target, 'w', encoding='utf-8') as f:
            f.write(new_content)

if __name__ == '__main__':
    main()
