const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './data/cdn-maintenance.db');

const db = new Database(dbPath, {
  // Logs every SQL statement to stdout during development — remove in prod
  verbose: process.env.NODE_ENV !== 'production' ? console.log : null,
});

// WAL mode gives better read/write concurrency for a local SQLite file
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
