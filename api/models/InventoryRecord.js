module.exports = {
  tableName: 'inventory_record',
  attributes: {
    book_quantity: {
      type: 'number',
      defaultsTo: 1
    },
    actual_quantity: {
      type: 'number',
      defaultsTo: 1
    },
    condition_status: {
      type: 'string',
      required: true
    },
    notes: {
      type: 'string'
    },
    // Relationships
    session_id: {
      model: 'inventorysession',
      required: true
    },
    asset_id: {
      model: 'assetitem',
      required: true
    }
  }
};
