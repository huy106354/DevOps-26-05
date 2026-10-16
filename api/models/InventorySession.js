module.exports = {
  tableName: 'inventory_session',
  attributes: {
    session_name: {
      type: 'string',
      required: true
    },
    start_date: {
      type: 'number',
      required: true
    },
    end_date: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['draft', 'in_progress', 'completed', 'approved'],
      defaultsTo: 'draft'
    },
    // Relationships
    inspector_id: {
      model: 'user',
      required: true
    },
    records: {
      collection: 'inventoryrecord',
      via: 'session_id'
    }
  }
};
