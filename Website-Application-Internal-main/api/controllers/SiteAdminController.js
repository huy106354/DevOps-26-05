module.exports = {
  index: async function (req, res) {
    // 1. Fetch departments from Cache (Master Data Caching!)
    let departments = await CacheService.get('master_departments');
    let is_cached = true;

    if (!departments) {
      // Cache miss, fetch from database
      departments = await Department.find()
        .populate('manager_id')
        .populate('parent_id')
        .sort('name ASC');

      // Save to cache for 10 minutes (600 seconds)
      await CacheService.set('master_departments', departments, 600);
      is_cached = false;
    }

    // 2. Fetch list of active users to populate manager select dropdown
    const active_users = await User.find({ status: 'active' }).sort('full_name ASC');

    // 3. Fetch system settings or statistics
    const total_audit_logs = await AuditLog.count();
    const system_roles = await Role.find();

    return res.view('pages/site_admin/index', {
      title: 'Quản trị Hệ thống - VN168',
      departments,
      active_users,
      total_audit_logs,
      system_roles,
      cache_status: {
        is_cached,
        engine: process.env.REDIS_URL ? 'Redis Server' : 'In-Memory Store'
      }
    });
  },

  clear_cache: async function (req, res) {
    // Audit Log for sensitive action
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'clear_cache',
      module: 'admin',
      record_id: 'SYSTEM',
      after_data: { timestamp: Date.now() }
    });

    // Invalidate/Clear all cache keys
    await CacheService.clear();

    req.session.flash = { success_message: 'Đã xóa sạch toàn bộ bộ nhớ đệm cache hệ thống thành công (Redis/In-Memory).' };
    return res.redirect('/admin/system');
  },

  create_department: async function (req, res) {
    const name = req.param('name');
    const parent_id = req.param('parent_id') || null;
    const manager_id = req.param('manager_id') || null;

    if (!name || name.trim() === '') {
      req.session.flash = { error_message: 'Tên phòng ban không được để trống.' };
      return res.redirect('/admin/system');
    }

    // Create Department
    const new_dept = await Department.create({
      name,
      parent_id: parent_id ? parent_id : undefined,
      manager_id: manager_id ? manager_id : undefined
    }).fetch();

    // Invalidate cache since master data has changed!
    await CacheService.delete('master_departments');

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'create_department',
      module: 'admin',
      record_id: new_dept.id.toString(),
      after_data: new_dept
    });

    req.session.flash = { success_message: `Đã khởi tạo phòng ban "${name}" thành công và làm mới cache master data.` };
    return res.redirect('/admin/system');
  }
};
