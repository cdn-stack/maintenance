const express = require('express');
const router = express.Router();

// GET /login — show the login page
router.get('/login', (req, res) => {
  // If already logged in, go straight to the app
  if (req.session && req.session.loggedIn) {
    return res.redirect('/');
  }
  res.sendFile('login.html', { root: './src/public' });
});

// POST /login — check the password
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/');
  } else {
    // Wrong password — send them back to login with an error flag
    res.redirect('/login?error=1');
  }
});

// GET /logout — clear the session and go back to login
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
