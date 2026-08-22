module.exports = {
  tableName: 'role',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    },
    is_system_role: {
      type: 'boolean',
      defaultsTo: false
    },
    users: {
      collection: 'user',
      via: 'role_id',
      through: 'userrole'
    }
  }
};
