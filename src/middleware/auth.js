// This runs before every protected page/route.
// If the user isn't logged in, they get sent to /login instead.
function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next(); // They're logged in — let them through
  }
  res.redirect('/login');
}

module.exports = requireAuth;
