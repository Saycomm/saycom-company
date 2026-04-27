const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='faqs'", (err, rows) => {
    if (err) {
        console.error("Error checking tables:", err);
    } else if (rows.length > 0) {
        console.log("SUCCESS: 'faqs' table exists.");
        db.all("PRAGMA table_info(faqs)", (err, columns) => {
            console.log("Columns:", columns.map(c => c.name).join(', '));
            process.exit(0);
        });
    } else {
        console.error("FAIL: 'faqs' table DOES NOT exist.");
        process.exit(1);
    }
});
