const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { PROPERTY_DATA, PROPERTIES } = require('../config/properties');

// ─────────────────────────────────────────────
// GET /api/properties
// Returns full property list with addresses
// ─────────────────────────────────────────────
router.get('/api/properties', (req, res) => {
  res.json(PROPERTY_DATA);
});

// ─────────────────────────────────────────────
// GET /api/issues
// List all issues — supports filtering & search
//
// Query params (all optional):
//   ?property=Flat 4 Shoreditch
//   ?status=open
//   ?priority=urgent
//   ?search=boiler
// ─────────────────────────────────────────────
router.get('/api/issues', (req, res) => {
  const { property, status, priority, search } = req.query;

  let query = 'SELECT * FROM issues WHERE 1=1';
  const params = [];

  if (property) {
    query += ' AND property = ?';
    params.push(property);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (search) {
    query += ' AND (title LIKE ? OR notes LIKE ? OR guest LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY priority DESC, created_at DESC';
  // "urgent" sorts before "normal" alphabetically — keeps urgent issues at the top

  const issues = db.prepare(query).all(...params);
  res.json(issues);
});

// ─────────────────────────────────────────────
// GET /api/issues/:id
// Get a single issue plus its full activity log
// ─────────────────────────────────────────────
router.get('/api/issues/:id', (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const activity = db.prepare(
    'SELECT * FROM activity_log WHERE issue_id = ? ORDER BY logged_at ASC'
  ).all(req.params.id);

  res.json({ ...issue, activity });
});

// ─────────────────────────────────────────────
// POST /api/issues
// Log a new issue
// ─────────────────────────────────────────────
router.post('/api/issues', (req, res) => {
  const { title, property, source, priority, status, date, guest, notes } = req.body;

  // Basic validation
  if (!title || !property) {
    return res.status(400).json({ error: 'Title and property are required' });
  }
  if (!PROPERTIES.includes(property)) {
    return res.status(400).json({ error: 'Invalid property name' });
  }

  const result = db.prepare(`
    INSERT INTO issues (title, property, source, priority, status, date, guest, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    property,
    source || null,
    priority || 'normal',
    status  || 'open',
    date    || new Date().toISOString().split('T')[0],
    guest   || null,
    notes   || null
  );

  // Log the creation in the activity trail
  db.prepare(`
    INSERT INTO activity_log (issue_id, action, new_value)
    VALUES (?, 'Issue logged', ?)
  `).run(result.lastInsertRowid, `Status: open | Priority: ${priority || 'normal'}`);

  const newIssue = db.prepare('SELECT * FROM issues WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newIssue);
});

// ─────────────────────────────────────────────
// PATCH /api/issues/:id
// Update any field on an issue.
// Automatically logs activity when status or cost changes.
// ─────────────────────────────────────────────
router.patch('/api/issues/:id', (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const allowed = ['title', 'property', 'source', 'priority', 'status', 'date', 'cost', 'invoice', 'guest', 'notes'];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // Build dynamic UPDATE query from whatever fields were sent
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE issues SET ${setClauses} WHERE id = ?`).run(...values);

  // Record activity for key changes
  if (updates.status && updates.status !== issue.status) {
    db.prepare(`
      INSERT INTO activity_log (issue_id, action, old_value, new_value)
      VALUES (?, 'Status changed', ?, ?)
    `).run(req.params.id, issue.status, updates.status);
  }
  if (updates.priority && updates.priority !== issue.priority) {
    db.prepare(`
      INSERT INTO activity_log (issue_id, action, old_value, new_value)
      VALUES (?, 'Priority changed', ?, ?)
    `).run(req.params.id, issue.priority, updates.priority);
  }
  if (updates.cost && updates.cost !== issue.cost) {
    db.prepare(`
      INSERT INTO activity_log (issue_id, action, old_value, new_value)
      VALUES (?, 'Cost updated', ?, ?)
    `).run(req.params.id, issue.cost ? `£${issue.cost}` : 'none', `£${updates.cost}`);
  }

  const updated = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ─────────────────────────────────────────────
// DELETE /api/issues/:id
// Remove an issue (and its activity log via CASCADE)
// ─────────────────────────────────────────────
router.delete('/api/issues/:id', (req, res) => {
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
  res.json({ message: `Issue "${issue.title}" deleted` });
});

module.exports = router;
