module.exports = {
  tableName: 'department',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    parent_id: {
      model: 'department'
    },
    manager_id: {
      model: 'user'
    }
  }
};
