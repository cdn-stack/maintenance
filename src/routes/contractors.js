const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/contractors — list all, with optional search & trade filter
router.get('/api/contractors', (req, res) => {
  const { search, trade } = req.query;
  let query = 'SELECT * FROM contractors WHERE 1=1';
  const params = [];
  if (trade) { query += ' AND trade = ?'; params.push(trade); }
  if (search) {
    query += ' AND (name LIKE ? OR trade LIKE ? OR areas LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY name ASC';
  res.json(db.prepare(query).all(...params));
});

// GET /api/contractors/:id
router.get('/api/contractors/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Contractor not found' });
  res.json(c);
});

// POST /api/contractors
router.post('/api/contractors', (req, res) => {
  const { name, trade, phone, email, areas, rate, cert, notes } = req.body;
  if (!name || !trade) return res.status(400).json({ error: 'Name and trade are required' });
  const result = db.prepare(`
    INSERT INTO contractors (name, trade, phone, email, areas, rate, cert, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, trade, phone||null, email||null, areas||null, rate||null, cert||null, notes||null);
  res.status(201).json(db.prepare('SELECT * FROM contractors WHERE id = ?').get(result.lastInsertRowid));
});

// PATCH /api/contractors/:id
router.patch('/api/contractors/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Contractor not found' });
  const allowed = ['name','trade','phone','email','areas','rate','cert','notes'];
  const updates = {};
  for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE contractors SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);
  res.json(db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id));
});

// DELETE /api/contractors/:id
router.delete('/api/contractors/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Contractor not found' });
  db.prepare('DELETE FROM contractors WHERE id = ?').run(req.params.id);
  res.json({ message: `Contractor "${c.name}" removed` });
});

module.exports = router;
