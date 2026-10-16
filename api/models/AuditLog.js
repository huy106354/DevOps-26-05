module.exports = {
  tableName: 'audit_log',
  attributes: {
    actor_id: {
      model: 'user'
    },
    action: {
      type: 'string',
      required: true
    },
    module: {
      type: 'string',
      required: true
    },
    record_id: {
      type: 'string'
    },
    before_data: {
      type: 'json'
    },
    after_data: {
      type: 'json'
    }
  }
};
