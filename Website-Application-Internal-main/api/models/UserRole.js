module.exports = {
  tableName: 'user_role',
  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    role_id: {
      model: 'role',
      required: true
    }
  }
};
