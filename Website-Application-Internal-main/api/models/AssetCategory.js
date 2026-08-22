module.exports = {
  tableName: 'asset_category',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    },
    // Relationships
    items: {
      collection: 'assetitem',
      via: 'category_id'
    }
  }
};
