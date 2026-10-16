module.exports = {
  tableName: 'asset_item',
  attributes: {
    asset_code: {
      type: 'string',
      required: true,
      unique: true
    },
    name: {
      type: 'string',
      required: true
    },
    serial_number: {
      type: 'string'
    },
    purchase_date: {
      type: 'number'
    },
    purchase_value: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['available', 'assigned', 'maintenance', 'broken', 'lost', 'disposed'],
      defaultsTo: 'available'
    },
    location: {
      type: 'string'
    },
    // Relationships
    category_id: {
      model: 'assetcategory',
      required: true
    },
    assignments: {
      collection: 'assetassignment',
      via: 'asset_id'
    },
    maintenances: {
      collection: 'assetmaintenance',
      via: 'asset_id'
    },
    inventory_records: {
      collection: 'inventoryrecord',
      via: 'asset_id'
    }
  }
};
