const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const initialHints = [
    "Кондиционер Daikin",
    "Камера Hikvision",
    "Домофон Comelit",
    "Автоматика CAME",
    "Монтаж видеонаблюдения",
    "Запчасти для ворот",
    "Умный дом",
    "IP камера 4K",
    "Инверторный кондиционер",
    "Пульт для ворот",
    "Видеозвонок",
    "Система безопасности"
];

db.serialize(() => {
    db.run("DELETE FROM search_hints"); // Clear existing
    const stmt = db.prepare("INSERT INTO search_hints (text) VALUES (?)");
    initialHints.forEach(hint => {
        stmt.run(hint);
    });
    stmt.finalize();
    console.log("✅ Search hints seeded successfully!");
    db.close();
});
