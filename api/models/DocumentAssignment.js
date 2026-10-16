module.exports = {
  tableName: 'document_assignment',
  attributes: {
    instructions: {
      type: 'string'
    },
    deadline: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['pending', 'ongoing', 'completed', 'overdue'],
      defaultsTo: 'pending'
    },
    // Relationships
    document_id: {
      model: 'documentrecord',
      required: true
    },
    assigned_by: {
      model: 'user',
      required: true
    },
    assigned_to: {
      model: 'user',
      required: true
    }
  }
};
