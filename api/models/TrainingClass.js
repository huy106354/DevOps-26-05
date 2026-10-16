module.exports = {
  tableName: 'training_class',
  attributes: {
    class_code: {
      type: 'string',
      required: true,
      unique: true
    },
    name: {
      type: 'string',
      required: true
    },
    location: {
      type: 'string'
    },
    start_time: {
      type: 'number'
    },
    end_time: {
      type: 'number'
    },
    instructor: {
      type: 'string'
    },
    coordinating_unit: {
      type: 'string'
    },
    expected_trainees: {
      type: 'number'
    },
    status: {
      type: 'string',
      isIn: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
      defaultsTo: 'draft'
    },
    // Relationships
    program_id: {
      model: 'trainingprogram',
      required: true
    },
    trainees: {
      collection: 'trainee',
      via: 'class_id'
    },
    sessions: {
      collection: 'attendancesession',
      via: 'class_id'
    },
    certificates: {
      collection: 'certificate',
      via: 'class_id'
    },
    feedbacks: {
      collection: 'trainingfeedback',
      via: 'class_id'
    }
  }
};
