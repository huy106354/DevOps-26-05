module.exports = {
  tableName: 'attendance_record',
  attributes: {
    checkin_time: {
      type: 'number',
      required: true
    },
    device_ip: {
      type: 'string'
    },
    device_info: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['valid', 'invalid', 'late', 'excused'],
      defaultsTo: 'valid'
    },
    // Relationships
    trainee_id: {
      model: 'trainee',
      required: true
    },
    session_id: {
      model: 'attendancesession',
      required: true
    }
  }
};
