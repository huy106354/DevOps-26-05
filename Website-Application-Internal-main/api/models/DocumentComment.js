module.exports = {
  tableName: 'document_comment',
  attributes: {
    comment_text: {
      type: 'string',
      required: true
    },
    comment_time: {
      type: 'number',
      required: true
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
