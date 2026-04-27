const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log("--- PROJECTS ---");
db.all("SELECT id, title, likes, saves, shares, comments_count FROM projects", [], (err, rows) => {
    if (err) console.error(err);
    else console.table(rows);

    console.log("\n--- USER ACTIVITY ---");
    db.all("SELECT * FROM user_activity", [], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);

        console.log("\n--- REVIEWS ---");
        db.all("SELECT * FROM reviews", [], (err, rows) => {
            if (err) console.error(err);
            else console.table(rows);
            db.close();
        });
    });
});
