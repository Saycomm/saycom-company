const fs = require('fs');
let code = fs.readFileSync('js/translations.js', 'utf8');

// Fixing the missing closing brackets before comma and 'ru:', 'kz:'
code = code.replace(/"form_message": "Message \*"\s*,/, '"form_message": "Message *"\n    },');
code = code.replace(/"form_message": "Сообщение \*"\s*,/, '"form_message": "Сообщение *"\n    },');
code = code.replace(/"form_message": "Хабарлама \*"\s*,/, '"form_message": "Хабарлама *"\n    },'); // Wait, the last one might just end with }; or we can let it be if it's the last.

// Actually let's look at the end of file for kz:
code = code.replace(/"form_message": "Хабарлама \*"\s*\}\s*;\s*$/, '"form_message": "Хабарлама *"\n    }\n};');

fs.writeFileSync('js/translations.js', code);
