const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        lat REAL,
        lng REAL,
        message TEXT,
        image_url TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
