module.exports = {
  tableName: 'permission',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'string',
      required: true
    },
    module: {
      type: 'string',
      required: true
    },
    action: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    }
  }
};
