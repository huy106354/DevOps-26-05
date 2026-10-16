module.exports = async function (req, res, proceed) {
  const allowed_roles = ['admin', 'manager', 'assets'];

  if (req.session.user && req.session.user.roles && req.session.user.roles.some(r => allowed_roles.includes(r))) {
    return proceed();
  }

  if (req.wantsJSON) {
    return res.status(403).json({ error: 'forbidden', message: 'Bạn không có quyền quản lý tài sản.' });
  }

  req.session.flash = { error_message: 'Yêu cầu vai trò Ban Giám đốc hoặc Cán bộ Hành chính.' };
  return res.redirect('/dashboard');
};
