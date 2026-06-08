require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const initSchema = require('./db/schema');
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const contractorRoutes = require('./routes/contractors');
const photoRoutes = require('./routes/photos');
const requireAuth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form submissions and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup — keeps a user logged in across page loads
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12, // Stay logged in for 12 hours
    httpOnly: true,
  }
}));

// Serve static files (logo, favicon, CSS etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded photos (protected — only logged-in users can view)
// We wire this AFTER requireAuth below so it's not public

// Initialise DB tables on startup
initSchema();

// Public routes — no login needed
app.use(authRoutes);

// Health check (also public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'CDN Maintenance', timestamp: new Date().toISOString() });
});

// Everything below this line requires login
app.use(requireAuth);

// Serve uploaded photos — protected, login required
app.use('/uploads', express.static(path.resolve('./data/uploads')));

// Protected API routes
app.use(issueRoutes);
app.use(contractorRoutes);
app.use(photoRoutes);

// Main app — serve the frontend
app.get('/', (req, res) => {
  res.sendFile('app.html', { root: path.join(__dirname, 'public') });
});

app.listen(PORT, () => {
  console.log(`CDN Maintenance running on http://localhost:${PORT}`);
});
