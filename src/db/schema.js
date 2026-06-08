const db = require('./database');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contractors (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      trade     TEXT    NOT NULL,          -- e.g. "Plumber", "Electrician"
      phone     TEXT,
      email     TEXT,
      areas     TEXT,                      -- comma-separated London areas they cover
      rate      TEXT,                      -- e.g. "£65/hr" or "day rate"
      cert      TEXT,                      -- qualifications / certifications
      notes     TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS issues (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      property   TEXT    NOT NULL,         -- property address or short identifier
      source     TEXT,                     -- e.g. "Airbnb", "Guest call", "Inspection"
      priority   TEXT    DEFAULT 'Medium'
                         CHECK(priority IN ('Urgent','High','Medium','Low')),
      status     TEXT    DEFAULT 'open'
                         CHECK(status IN ('open','in-progress','resolved','pending')),
      assignee   TEXT,   -- team member or contractor name (free text)
      date       TEXT,                     -- ISO 8601 date of the issue
      cost       REAL,                     -- actual cost in GBP
      invoice    TEXT,                     -- invoice reference / URL
      guest      TEXT,                     -- guest name or booking ID
      notes      TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Photos attached to issues (max 5 per issue)
    CREATE TABLE IF NOT EXISTS photos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id      INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      filename      TEXT    NOT NULL,  -- saved filename on disk
      original_name TEXT,             -- original filename from the upload
      uploaded_at   TEXT DEFAULT (datetime('now'))
    );

    -- Tracks every status change on an issue for the activity timeline
    CREATE TABLE IF NOT EXISTS activity_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id   INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      action     TEXT    NOT NULL,   -- e.g. "Status changed", "Cost updated"
      old_value  TEXT,               -- what it was before
      new_value  TEXT,               -- what it changed to
      logged_at  TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('Database schema ready.');
}

module.exports = initSchema;
