module.exports = {
  tableName: 'trainee',
  attributes: {
    full_name: {
      type: 'string',
      required: true
    },
    unit: {
      type: 'string'
    },
    position: {
      type: 'string'
    },
    phone: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    target_group: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['active', 'dropped_out', 'passed', 'failed'],
      defaultsTo: 'active'
    },
    // Relationships
    class_id: {
      model: 'trainingclass',
      required: true
    },
    attendance_records: {
      collection: 'attendancerecord',
      via: 'trainee_id'
    },
    certificates: {
      collection: 'certificate',
      via: 'trainee_id'
    },
    feedbacks: {
      collection: 'trainingfeedback',
      via: 'trainee_id'
    }
  }
};
