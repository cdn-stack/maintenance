const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './data/cdn-maintenance.db');

// Create the data and uploads directories if they don't exist
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.mkdirSync(path.resolve(path.dirname(dbPath), 'uploads'), { recursive: true });

const db = new Database(dbPath, {
  // Logs every SQL statement to stdout during development — remove in prod
  verbose: process.env.NODE_ENV !== 'production' ? console.log : null,
});

// WAL mode gives better read/write concurrency for a local SQLite file
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
