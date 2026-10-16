module.exports = {
  tableName: 'contract',
  attributes: {
    contract_number: {
      type: 'string',
      required: true,
      unique: true
    },
    contract_value: {
      type: 'number',
      required: true
    },
    start_date: {
      type: 'number'
    },
    end_date: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'completed', 'liquidated', 'cancelled'],
      defaultsTo: 'draft'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    }
  }
};
