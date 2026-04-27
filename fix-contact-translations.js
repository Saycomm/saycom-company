const fs = require('fs');
let code = fs.readFileSync('js/translations.js', 'utf8');

// The file was messed up slightly.
// 1. Let's find "add_to_cart": "Add to Cart"\n    } and replace with:
// "add_to_cart": "Add to Cart", \n [all English keys] \n }
const engKeys = `
        "contact_subtitle": "We're here to help. Reach out to us for any equipment or installation inquiries.",
        "contact_phone_title": "Call Us By Phone",
        "contact_phone_desc": "Mon-Fri, 9:00 AM - 6:00 PM",
        "contact_email_title": "Send Us an Email",
        "contact_email_desc": "Online support 24/7",
        "contact_office_title": "Visit Our Office",
        "contact_office_desc": "Main Business Center",
        "contact_form_title": "Send a Message",
        "contact_form_subtitle": "Fill out the form below and our team will get back to you shortly.",
        "form_name": "Full Name *",
        "form_email": "Email Address *",
        "form_subject": "Subject Area",
        "subject_1": "Air Conditioners Installation",
        "subject_2": "CCTV Systems Setup",
        "subject_3": "Automatic Gates Engineering",
        "subject_4": "General Inquiry",
        "form_message": "Message *",
        "form_btn": "Securely Send Message"
`;

const ruKeys = `
        "contact_subtitle": "Мы здесь, чтобы помочь. Обращайтесь по любым вопросам оборудования или установки.",
        "contact_phone_title": "Позвоните нам",
        "contact_phone_desc": "Пн-Пт, 9:00 - 18:00",
        "contact_email_title": "Напишите нам",
        "contact_email_desc": "Онлайн поддержка 24/7",
        "contact_office_title": "Наш офис",
        "contact_office_desc": "Главный бизнес-центр",
        "contact_form_title": "Отправить сообщение",
        "contact_form_subtitle": "Заполните форму ниже, и наша команда свяжется с вами в ближайшее время.",
        "form_name": "Полное имя *",
        "form_email": "Адрес эл. почты *",
        "form_subject": "Тема обращения",
        "subject_1": "Установка кондиционеров",
        "subject_2": "Настройка систем видеонаблюдения",
        "subject_3": "Проектирование автоматических ворот",
        "subject_4": "Общие вопросы",
        "form_message": "Сообщение *",
        "form_btn": "Безопасно отправить сообщение"
`;

const kzKeys = `
        "contact_subtitle": "Біз көмектесуге дайынбыз. Жабдық немесе орнату бойынша сұрақтарыңызбен хабарласыңыз.",
        "contact_phone_title": "Бізге қоңырау шалыңыз",
        "contact_phone_desc": "Дүй-Жұма, 9:00 - 18:00",
        "contact_email_title": "Бізге хат жазыңыз",
        "contact_email_desc": "Онлайн қолдау 24/7",
        "contact_office_title": "Біздің кеңсе",
        "contact_office_desc": "Басты бизнес орталығы",
        "contact_form_title": "Хабарлама жіберу",
        "contact_form_subtitle": "Төмендегі пішінді толтырыңыз, біздің команда жақында сізбен байланысады.",
        "form_name": "Толық аты-жөні *",
        "form_email": "Эл. пошта мекенжайы *",
        "form_subject": "Сұрақ тақырыбы",
        "subject_1": "Кондиционерлерді орнату",
        "subject_2": "Бейнебақылауды орнату",
        "subject_3": "Автоматты қақпаларды жобалау",
        "subject_4": "Жалпы сұрақтар",
        "form_message": "Хабарлама *",
        "form_btn": "Қауіпсіз жіберу"
`;

// Clean up messed up inserts (which didn't have commas and were put right before 'ru:{', 'kz:{', and '};')
code = code.replace(/"form_btn": "Securely Send Message"\s*/, '');
code = code.replace(/"contact_subtitle": "We're here to help[^]+?"General Inquiry",\s*"form_message": "Message \*",\s*ru: \{/, 'ru: {');

code = code.replace(/"form_btn": "Безопасно отправить сообщение"\s*/, '');
code = code.replace(/"contact_subtitle": "Мы здесь[^]+?"form_message": "Сообщение \*",\s*kz: \{/, 'kz: {');

code = code.replace(/"form_btn": "Қауіпсіз жіберу"\s*/, '');
code = code.replace(/"contact_subtitle": "Біз көмектесуге дайынбыз[^]+?"form_message": "Хабарлама \*",\s*\};\s*$/, '};\n');

// Real injection inside objects:
code = code.replace(/("add_to_cart": "Add to Cart")\s*\}/, '$1,' + engKeys + '}');
code = code.replace(/("add_to_cart": "В корзину")\s*\}/, '$1,' + ruKeys + '}');
code = code.replace(/("add_to_cart": "Себетке қосу")\s*\}/, '$1,' + kzKeys + '}');

fs.writeFileSync('js/translations.js', code);
