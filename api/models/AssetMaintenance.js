module.exports = {
  tableName: 'asset_maintenance',
  attributes: {
    maintenance_date: {
      type: 'number',
      required: true
    },
    work_description: {
      type: 'string',
      required: true
    },
    cost: {
      type: 'number',
      defaultsTo: 0
    },
    vendor: {
      type: 'string'
    },
    result: {
      type: 'string',
      isIn: ['success', 'failed'],
      defaultsTo: 'success'
    },
    // Relationships
    asset_id: {
      model: 'assetitem',
      required: true
    }
  }
};
