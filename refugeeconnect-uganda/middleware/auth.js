// middleware/auth.js
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  // If it's an API request, return JSON error
  // NOTE: when mounted under `/api/*`, req.path becomes `/query`, etc.
  const isApiRequest = (req.originalUrl || '').startsWith('/api/');
  if (isApiRequest) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    });
  }

  // Otherwise, redirect to login page
  if (req.session) req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

module.exports = authMiddleware;
