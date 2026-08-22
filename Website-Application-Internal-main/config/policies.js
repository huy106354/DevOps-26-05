module.exports.policies = {
  // Default policy restricts all administrative routes to logged-in users
  '*': 'is_logged_in',

  // Authentication controllers are completely public
  'AuthController': {
    '*': true
  },

  // Training controller restricts most actions but allows checkin publicly
  'TrainingClassController': {
    '*': ['is_logged_in', 'can_manage_training'],
    'checkin_attendance': true // Trainees can scan QR checkin publicly
  },

  // Module specific role policies
  'DocumentController': {
    '*': ['is_logged_in', 'can_manage_documents']
  },
  'CrmCustomerController': {
    '*': ['is_logged_in', 'can_manage_crm']
  },
  'AssetController': {
    '*': ['is_logged_in', 'can_manage_assets']
  },

  // Dashboard
  'DashboardController': {
    '*': 'is_logged_in'
  },

  // Site Admin Panel (Strictly restricted to Admin role)
  'SiteAdminController': {
    '*': ['is_logged_in', 'is_admin']
  }
};
