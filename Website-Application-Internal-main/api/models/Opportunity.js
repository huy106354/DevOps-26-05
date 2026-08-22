module.exports = {
  tableName: 'opportunity',
  attributes: {
    requirements: {
      type: 'string',
      required: true
    },
    expected_value: {
      type: 'number'
    },
    stage: {
      type: 'string',
      isIn: ['new', 'contacted', 'demo', 'quoted', 'negotiation', 'won', 'lost'],
      defaultsTo: 'new'
    },
    probability: {
      type: 'number',
      min: 0,
      max: 100,
      defaultsTo: 10
    },
    expected_close_date: {
      type: 'number'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    }
  }
};
