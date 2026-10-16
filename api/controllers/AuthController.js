const bcrypt = require('bcryptjs');

module.exports = {
  register: async function (req, res) {
    // Check if user is already logged in
    if (req.session.user) {
      return res.redirect('/dashboard');
    }

    // 1. Handle GET: Render view
    if (req.method === 'GET') {
      return res.view('pages/auth/register', {
        no_layout: true,
        errors: {},
        form_data: {}
      });
    }

    // 2. Handle POST: Form submission
    if (req.method === 'POST') {
      const full_name = req.param('full_name');
      const email = req.param('email');
      const phone = req.param('phone');
      const password = req.param('password');
      const confirm_password = req.param('confirm_password');
      const role_selection = req.param('role') || 'office';

      let errors = {};
      let form_data = { full_name, email, phone, role_selection };

      // Validations
      if (!full_name || full_name.trim() === '') {errors.full_name = 'Họ tên không được để trống.';}
      if (!email || !email.includes('@')) {errors.email = 'Email không hợp lệ.';}
      if (!phone || phone.length < 8) {errors.phone = 'Số điện thoại không hợp lệ.';}
      if (!password || password.length < 6) {errors.password = 'Mật khẩu phải từ 6 ký tự.';}
      if (password !== confirm_password) {errors.confirm_password = 'Mật khẩu xác nhận không khớp.';}

      // Check unique email and phone
      if (!errors.email) {
        const existing_email = await User.findOne({ email });
        if (existing_email) {errors.email = 'Email này đã được sử dụng.';}
      }
      if (!errors.phone) {
        const existing_phone = await User.findOne({ phone });
        if (existing_phone) {errors.phone = 'Số điện thoại này đã được sử dụng.';}
      }

      if (Object.keys(errors).length > 0) {
        return res.view('pages/auth/register', { no_layout: true, errors, form_data });
      }

      // Hash password using bcryptjs
      const password_hash = await bcrypt.hash(password, 10);

      // Create user record
      const new_user = await User.create({
        full_name,
        email,
        phone,
        password_hash,
        status: 'active'
      }).fetch();

      // Ensure roles exist in DB (Dynamic seeding)
      const role_ids = ['admin', 'manager', 'training', 'office', 'sales', 'assets'];
      const role_names = {
        admin: 'Quản trị hệ thống',
        manager: 'Ban Giám đốc',
        training: 'Cán bộ Đào tạo',
        office: 'Văn thư / Hành chính',
        sales: 'Nhân viên Kinh doanh',
        assets: 'Quản lý Tài sản'
      };

      for (const rid of role_ids) {
        const check_role = await Role.findOne({ id: rid });
        if (!check_role) {
          await Role.create({
            id: rid,
            name: role_names[rid],
            is_system_role: true
          });
        }
      }

      // Associate user with role
      await UserRole.create({
        user_id: new_user.id,
        role_id: role_selection
      });

      req.session.flash = { success_message: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.' };
      return res.redirect('/login');
    }
  },

  login: async function (req, res) {
    // Redirect if already logged in
    if (req.session.user) {
      return res.redirect('/dashboard');
    }

    // 1. Handle GET: Render view
    if (req.method === 'GET') {
      return res.view('pages/auth/login', {
        no_layout: true,
        errors: {},
        form_data: {}
      });
    }

    // 2. Handle POST: Process Login
    if (req.method === 'POST') {
      const email = req.param('email');
      const password = req.param('password');

      let errors = {};
      let form_data = { email };

      if (!email) {errors.email = 'Vui lòng nhập Email.';}
      if (!password) {errors.password = 'Vui lòng nhập Mật khẩu.';}

      if (Object.keys(errors).length > 0) {
        return res.view('pages/auth/login', { no_layout: true, errors, form_data });
      }

      // Query User record
      const user_record = await User.findOne({ email });
      if (!user_record) {
        errors.email = 'Email hoặc mật khẩu không chính xác.';
        return res.view('pages/auth/login', { no_layout: true, errors, form_data });
      }

      if (user_record.status === 'locked') {
        errors.email = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.';
        return res.view('pages/auth/login', { no_layout: true, errors, form_data });
      }

      // Compare password
      const password_match = await bcrypt.compare(password, user_record.password_hash);
      if (!password_match) {
        errors.email = 'Email hoặc mật khẩu không chính xác.';
        return res.view('pages/auth/login', { no_layout: true, errors, form_data });
      }

      // Query roles
      const user_roles = await UserRole.find({ user_id: user_record.id });
      const role_ids = user_roles.map(ur => ur.role_id);

      // Save user info in session
      req.session.user = {
        id: user_record.id,
        full_name: user_record.full_name,
        email: user_record.email,
        roles: role_ids
      };

      // Update last login timestamp
      await User.updateOne({ id: user_record.id }).set({
        last_login_at: Date.now()
      });

      // Audit Log for Login
      await AuditLog.create({
        actor_id: user_record.id,
        action: 'login',
        module: 'auth',
        record_id: user_record.id.toString(),
        after_data: { timestamp: Date.now(), ip: req.ip }
      });

      req.session.flash = { success_message: `Chào mừng ${user_record.full_name} quay trở lại hệ thống.` };
      return res.redirect('/dashboard');
    }
  },

  logout: async function (req, res) {
    if (req.session && req.session.user) {
      const user_id = req.session.user.id;

      // Audit Log for Logout
      await AuditLog.create({
        actor_id: user_id,
        action: 'logout',
        module: 'auth',
        record_id: user_id.toString(),
        after_data: { timestamp: Date.now() }
      });

      // Destroy session
      req.session.user = null;
    }

    return res.redirect('/login');
  }
};
