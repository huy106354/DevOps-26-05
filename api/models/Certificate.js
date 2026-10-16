module.exports = {
  tableName: 'certificate',
  attributes: {
    certificate_code: {
      type: 'string',
      required: true,
      unique: true
    },
    issue_date: {
      type: 'number',
      required: true
    },
    file_path: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['issued', 'revoked'],
      defaultsTo: 'issued'
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
