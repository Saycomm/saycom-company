import os

file_path = '/Users/abdullohkhikmatzhanow/saycom-company/js/translations.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

ru_mapping = {
    "My Account": "Мой аккаунт",
    "Sign in": "Войти",
    "Search": "Поиск",
    "Home": "Главная",
    "Search...": "Поиск...",
    "Enter your email": "Введите ваш email",
    "Get updates on new products and exclusive offers": "Получайте новости о новых продуктах и эксклюзивных предложениях",
    "© 2026 SAYCOM. All rights reserved.": "© 2026 SAYCOM. Все права защищены.",
    "Privacy Policy": "Политика конфиденциальности",
    "Terms of Service": "Условия обслуживания",
    "Apply Filters": "Применить фильтры",
    "Reset All": "Сбросить все",
    "Showing 0 products": "Показано 0 товаров",
    "Showing 2 products": "Показано 2 товара",
    "Most Popular": "Самые популярные",
    "Price: Low to High": "Сначала дешевые",
    "Price: High to Low": "Сначала дорогие",
    "Portfolio": "Портфолио",
    "In Stock": "В наличии",
    "sold": "продано",
    "reviews": "отзывов",
    "2 Year Warranty": "2 года гарантии",
    "24/7 Support": "Поддержка 24/7",
    "Free Delivery $500+": "Доставка от 250к ₸",
    "Бесплатная доставка 250 000₸+": "Доставка от 250 000₸"
}

kz_mapping = {
    "My Account": "Менің аккаунтым",
    "Sign in": "Кіру",
    "Search": "Іздеу",
    "Home": "Басты бет",
    "Search...": "Іздеу...",
    "Enter your email": "Электрондық поштаңызды енгізіңіз",
    "Get updates on new products and exclusive offers": "Жаңа өнімдер мен эксклюзивті ұсыныстар туралы жаңартуларды алыңыз",
    "© 2026 SAYCOM. All rights reserved.": "© 2026 SAYCOM. Барлық құқықтар қорғалған.",
    "Privacy Policy": "Құпиялылық саясаты",
    "Terms of Service": "Қызмет көрсету шарттары",
    "Apply Filters": "Сүзгілерді қолдану",
    "Reset All": "Барлығын қайта орнату",
    "Portfolio": "Портфолио",
    "In Stock": "Қоймада бар",
    "sold": "сатылды",
    "reviews": "пікірлер",
    "2 Year Warranty": "2 жылдық кепілдік",
    "24/7 Support": "24/7 қолдау",
    "Free Delivery $500+": "250к ₸-ден бастап тегін жеткізу"
}

current_section = None
new_lines = []

for line in lines:
    if 'ru: {' in line:
        current_section = 'ru'
    elif 'kz: {' in line:
        current_section = 'kz'
    elif 'en: {' in line:
        current_section = 'en'
    
    new_line = line
    if current_section == 'ru':
        for old, new in ru_mapping.items():
            pattern = f': "{old}"'
            if pattern in line:
                new_line = line.replace(f'"{old}"', f'"{new}"')
                break
    elif current_section == 'kz':
        for old, new in kz_mapping.items():
            pattern = f': "{old}"'
            if pattern in line:
                new_line = line.replace(f'"{old}"', f'"{new}"')
                break
    
    new_lines.append(new_line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Finished replacement")
