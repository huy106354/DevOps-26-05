module.exports = {
  tableName: 'document_record',
  attributes: {
    doc_number: {
      type: 'string',
      required: true
    },
    summary: {
      type: 'string',
      required: true
    },
    doc_type: {
      type: 'string',
      isIn: ['incoming', 'outgoing'],
      required: true
    },
    issued_date: {
      type: 'number'
    },
    received_sent_date: {
      type: 'number'
    },
    issuing_agency: {
      type: 'string'
    },
    urgency: {
      type: 'string',
      isIn: ['low', 'normal', 'high', 'express'],
      defaultsTo: 'normal'
    },
    confidentiality: {
      type: 'string',
      isIn: ['normal', 'confidential', 'top_secret'],
      defaultsTo: 'normal'
    },
    status: {
      type: 'string',
      isIn: ['new', 'assigned', 'processing', 'waiting_approval', 'completed', 'overdue', 'cancelled'],
      defaultsTo: 'new'
    },
    // Relationships
    assignments: {
      collection: 'documentassignment',
      via: 'document_id'
    },
    process_logs: {
      collection: 'documentprocesslog',
      via: 'document_id'
    },
    comments: {
      collection: 'documentcomment',
      via: 'document_id'
    },
    outgoing_details: {
      collection: 'outgoingdocument',
      via: 'document_id'
    }
  }
};
