module.exports = {
  tableName: 'quote',
  attributes: {
    quote_number: {
      type: 'string',
      required: true,
      unique: true
    },
    total_amount: {
      type: 'number',
      required: true
    },
    discount: {
      type: 'number',
      defaultsTo: 0
    },
    status: {
      type: 'string',
      isIn: ['draft', 'submitted', 'approved', 'sent', 'accepted', 'rejected', 'expired'],
      defaultsTo: 'draft'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    }
  }
};
