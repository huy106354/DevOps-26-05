module.exports = {
  tableName: 'training_feedback',
  attributes: {
    rating: {
      type: 'number',
      required: true
    },
    comments: {
      type: 'string'
    },
    satisfaction_level: {
      type: 'string'
    },
    support_needed: {
      type: 'string'
    },
    // Relationships
    trainee_id: {
      model: 'trainee',
      required: true
    },
    class_id: {
      model: 'trainingclass',
      required: true
    }
  }
};
