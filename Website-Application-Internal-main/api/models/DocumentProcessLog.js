module.exports = {
  tableName: 'document_process_log',
  attributes: {
    action_time: {
      type: 'number',
      required: true
    },
    action_taken: {
      type: 'string',
      required: true
    },
    action_details: {
      type: 'string'
    },
    // Relationships
    document_id: {
      model: 'documentrecord',
      required: true
    },
    user_id: {
      model: 'user',
      required: true
    }
  }
};
