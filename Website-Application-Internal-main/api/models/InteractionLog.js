module.exports = {
  tableName: 'interaction_log',
  attributes: {
    interaction_date: {
      type: 'number',
      required: true
    },
    channel: {
      type: 'string',
      isIn: ['call', 'email', 'meeting', 'demo'],
      required: true
    },
    content: {
      type: 'string',
      required: true
    },
    next_steps: {
      type: 'string'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    },
    user_id: {
      model: 'user',
      required: true
    }
  }
};
