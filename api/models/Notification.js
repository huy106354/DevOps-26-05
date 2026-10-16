module.exports = {
  tableName: 'notification',
  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    title: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true
    },
    link: {
      type: 'string'
    },
    read_at: {
      type: 'number',
      allowNull: true
    }
  }
};
