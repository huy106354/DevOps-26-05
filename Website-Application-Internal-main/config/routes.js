module.exports.routes = {
  // Home & Main Administrative Dashboard
  '/': 'DashboardController.view',
  '/dashboard': 'DashboardController.view',

  // Authentication Flows
  'GET /login': 'AuthController.login',
  'POST /login': 'AuthController.login',
  'GET /auth/register': 'AuthController.register',
  'POST /auth/register': 'AuthController.register',
  'GET /auth/logout': 'AuthController.logout',

  // Module 01: Training Class Management (Hệ thống quản lý tập huấn)
  'GET /training/classes': 'TrainingClassController.list',
  'GET /training/classes/create': 'TrainingClassController.create',
  'POST /training/classes/create': 'TrainingClassController.create',
  'GET /training/classes/:id': 'TrainingClassController.view',
  'POST /training/classes/:id/import-trainees': 'TrainingClassController.import_trainees',
  'GET /training/classes/:id/attendance/open': 'TrainingClassController.open_attendance',
  'POST /training/classes/:id/attendance/open': 'TrainingClassController.open_attendance',
  'GET /attendance/:sessionId/checkin': 'TrainingClassController.checkin_attendance',
  'POST /attendance/:sessionId/checkin': 'TrainingClassController.checkin_attendance',
  'GET /training/classes/:id/certificates/generate': 'TrainingClassController.generate_certificates',
  'GET /attendance/certificates/view': 'TrainingClassController.view_certificate',

  // Module 02: Document Management (Hệ thống quản lý công văn)
  'GET /documents': 'DocumentController.list',
  'GET /documents/create-incoming': 'DocumentController.create_incoming',
  'POST /documents/create-incoming': 'DocumentController.create_incoming',
  'GET /documents/create-outgoing': 'DocumentController.create_outgoing',
  'POST /documents/create-outgoing': 'DocumentController.create_outgoing',
  'GET /documents/:id': 'DocumentController.view',
  'POST /documents/:id/assign': 'DocumentController.assign',
  'POST /documents/:id/comments': 'DocumentController.add_log',
  'POST /documents/:id/close': 'DocumentController.close',

  // Module 03: CRM Mini (Khách hàng CRM)
  'GET /crm/customers': 'CrmCustomerController.list',
  'POST /crm/customers/create': 'CrmCustomerController.create_customer',
  'POST /crm/opportunities/create': 'CrmCustomerController.create_opportunity',

  // Module 04: Asset Management (Quản lý tài sản)
  'GET /assets/items': 'AssetController.list',
  'POST /assets/create': 'AssetController.create',
  'POST /assets/update-status': 'AssetController.update_status',

  // Site Admin Panel (Dynamic settings & Cache purging)
  'GET /admin/system': 'SiteAdminController.index',
  'POST /admin/system/clear-cache': 'SiteAdminController.clear_cache',
  'POST /admin/system/departments': 'SiteAdminController.create_department'
};

