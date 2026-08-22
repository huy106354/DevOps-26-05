module.exports = {
  tableName: 'attendance_session',
  attributes: {
    session_date: {
      type: 'string',
      required: true
    },
    start_time: {
      type: 'number',
      required: true
    },
    end_time: {
      type: 'number',
      required: true
    },
    qr_token: {
      type: 'string',
      required: true
    },
    status: {
      type: 'string',
      isIn: ['open', 'closed', 'expired'],
      defaultsTo: 'open'
    },
    // Relationships
    class_id: {
      model: 'trainingclass',
      required: true
    },
    attendance_records: {
      collection: 'attendancerecord',
      via: 'session_id'
    }
  }
};
