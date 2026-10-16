module.exports = {
  tableName: 'attachment',
  attributes: {
    filename: {
      type: 'string',
      required: true
    },
    path: {
      type: 'string',
      required: true
    },
    mime_type: {
      type: 'string'
    },
    size: {
      type: 'number'
    },
    owner_type: {
      type: 'string',
      required: true
    },
    owner_id: {
      type: 'string',
      required: true
    },
    uploaded_by: {
      model: 'user'
    }
  }
};
