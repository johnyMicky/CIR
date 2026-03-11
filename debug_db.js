
const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
const transactions = db.prepare('SELECT * FROM transactions').all();
console.log(JSON.stringify(transactions, null, 2));
const users = db.prepare('SELECT id, username, role, btc_balance FROM users').all();
console.log(JSON.stringify(users, null, 2));
