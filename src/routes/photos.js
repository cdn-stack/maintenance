const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const MAX_PHOTOS = 5;
const UPLOAD_DIR = path.resolve('./data/uploads');

// Multer config — saves files to data/uploads/ with a unique name
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `issue-${req.params.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per photo
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg','.jpeg','.png','.webp','.heic'];
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed (JPG, PNG, WEBP, HEIC)'));
  }
});

// ─────────────────────────────────────────────
// GET /api/issues/:id/photos
// Returns all photos for an issue
// ─────────────────────────────────────────────
router.get('/api/issues/:id/photos', (req, res) => {
  const issue = db.prepare('SELECT id FROM issues WHERE id = ?').get(req.params.id);
  if(!issue) return res.status(404).json({ error: 'Issue not found' });
  const photos = db.prepare('SELECT * FROM photos WHERE issue_id = ? ORDER BY uploaded_at ASC').all(req.params.id);
  res.json(photos);
});

// ─────────────────────────────────────────────
// POST /api/issues/:id/photos
// Upload up to 5 photos for an issue
// ─────────────────────────────────────────────
router.post('/api/issues/:id/photos', (req, res) => {
  const issue = db.prepare('SELECT id FROM issues WHERE id = ?').get(req.params.id);
  if(!issue) return res.status(404).json({ error: 'Issue not found' });

  // Check how many photos already exist
  const existing = db.prepare('SELECT COUNT(*) as count FROM photos WHERE issue_id = ?').get(req.params.id);
  const remaining = MAX_PHOTOS - existing.count;

  if(remaining <= 0) {
    return res.status(400).json({ error: `Maximum of ${MAX_PHOTOS} photos already reached for this issue` });
  }

  // Use multer to handle the upload (limit to remaining slots)
  const uploadMiddleware = upload.array('photos', remaining);

  uploadMiddleware(req, res, (err) => {
    if(err) {
      return res.status(400).json({ error: err.message });
    }
    if(!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Save each file to the database
    const insertPhoto = db.prepare('INSERT INTO photos (issue_id, filename, original_name) VALUES (?, ?, ?)');
    const saved = [];

    for(const file of req.files) {
      const result = insertPhoto.run(req.params.id, file.filename, file.originalname);
      saved.push({ id: result.lastInsertRowid, filename: file.filename, original_name: file.originalname });
    }

    // Log in activity trail
    db.prepare('INSERT INTO activity_log (issue_id, action, new_value) VALUES (?, ?, ?)').run(
      req.params.id, 'Photos added', `${saved.length} photo(s) uploaded`
    );

    res.status(201).json({ uploaded: saved.length, photos: saved });
  });
});

// ─────────────────────────────────────────────
// DELETE /api/photos/:id
// Delete a single photo
// ─────────────────────────────────────────────
router.delete('/api/photos/:id', (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
  if(!photo) return res.status(404).json({ error: 'Photo not found' });

  // Delete the file from disk
  const filePath = path.join(UPLOAD_DIR, photo.filename);
  if(fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Remove from database
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  res.json({ message: 'Photo deleted' });
});

module.exports = router;
