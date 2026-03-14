const db = require('./db');
db.query('ALTER TABLE bookstore_items RENAME COLUMN name TO item_name', (err) => console.log(err||'renamed name'));
db.query('ALTER TABLE bookstore_items RENAME COLUMN stock TO quantity', (err) => { console.log(err||'renamed stock'); process.exit(); });
