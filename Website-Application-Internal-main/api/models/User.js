module.exports = {
  tableName: 'user',
  attributes: {
    full_name: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true
    },
    phone: {
      type: 'string',
      required: true,
      unique: true
    },
    password_hash: {
      type: 'string',
      required: true
    },
    status: {
      type: 'string',
      isIn: ['active', 'locked'],
      defaultsTo: 'active'
    },
    last_login_at: {
      type: 'number',
      allowNull: true
    },
    // Relationships
    department_id: {
      model: 'department'
    },
    roles: {
      collection: 'role',
      via: 'user_id',
      through: 'userrole'
    }
  }
};
