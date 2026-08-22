module.exports = {
  tableName: 'outgoing_document',
  attributes: {
    recipient_agency: {
      type: 'string'
    },
    signer_name: {
      type: 'string'
    },
    published_date: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['draft', 'published'],
      defaultsTo: 'draft'
    },
    // Relationships
    document_id: {
      model: 'documentrecord',
      required: true
    }
  }
};
