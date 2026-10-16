module.exports = async function (req, res, proceed) {
  if (req.session.user && req.session.user.roles && req.session.user.roles.includes('admin')) {
    return proceed();
  }

  if (req.wantsJSON) {
    return res.status(403).json({ error: 'forbidden', message: 'Bạn không có quyền thực hiện hành động này.' });
  }

  req.session.flash = { error_message: 'Yêu cầu quyền Quản trị viên để truy cập.' };
  return res.redirect('/dashboard');
};
