module.exports = async function (req, res, proceed) {
  // Check if session contains logged-in user
  if (req.session.user) {
    // Make user object available in EJS templates automatically
    res.locals.current_user = req.session.user;
    return proceed();
  }

  // If request wants JSON (API), return 401
  if (req.wantsJSON) {
    return res.status(401).json({ error: 'unauthorized', message: 'Yêu cầu đăng nhập hệ thống.' });
  }

  // Otherwise, redirect to login page
  return res.redirect('/login');
};
