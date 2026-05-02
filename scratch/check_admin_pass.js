const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.get("SELECT value FROM admin_config WHERE key = 'admin_password'", (err, row) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    if (row) {
        console.log("Current Admin Password:", row.value);
    } else {
        console.log("Admin password not set in database.");
        // Let's set a default one if it's missing
        db.run("INSERT INTO admin_config (key, value) VALUES ('admin_password', 'saycom66')", (err) => {
            if (err) console.error(err);
            else console.log("Default password 'saycom66' has been set.");
        });
    }
    db.close();
});
