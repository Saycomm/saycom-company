const fs = require('fs');

let code = fs.readFileSync('js/translations.js', 'utf8');

// For Russian:
code = code.replace(/"form_message": "Сообщение \*"[\s\S]+?ru: \{/, '"form_message": "Сообщение *",\n        "form_btn": "Безопасно отправить сообщение"\n    },\n\n    kz: {');

// For Kazakh
code = code.replace(/"form_message": "Хабарлама \*"[\s\S]+?\}\s*;\s*$/, '"form_message": "Хабарлама *",\n        "form_btn": "Қауіпсіз жіберу"\n    }\n};');

fs.writeFileSync('js/translations.js', code);
