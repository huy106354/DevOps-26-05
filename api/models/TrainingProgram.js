module.exports = {
  tableName: 'training_program',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    objectives: {
      type: 'string'
    },
    duration_hours: {
      type: 'number'
    },
    content: {
      type: 'string'
    },
    target_audience: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'active'
    },
    // Relationships
    classes: {
      collection: 'trainingclass',
      via: 'program_id'
    }
  }
};
