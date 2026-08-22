module.exports = {
  tableName: 'asset_assignment',
  attributes: {
    assigned_date: {
      type: 'number',
      required: true
    },
    purpose: {
      type: 'string'
    },
    expected_return_date: {
      type: 'number'
    },
    return_date: {
      type: 'number',
      allowNull: true
    },
    status: {
      type: 'string',
      isIn: ['active', 'returned', 'overdue'],
      defaultsTo: 'active'
    },
    // Relationships
    asset_id: {
      model: 'assetitem',
      required: true
    },
    assigned_to: {
      model: 'user',
      required: true
    }
  }
};
