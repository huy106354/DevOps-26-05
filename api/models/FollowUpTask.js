module.exports = {
  tableName: 'follow_up_task',
  attributes: {
    task_description: {
      type: 'string',
      required: true
    },
    due_date: {
      type: 'number',
      required: true
    },
    status: {
      type: 'string',
      isIn: ['pending', 'completed', 'overdue'],
      defaultsTo: 'pending'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    },
    user_id: {
      model: 'user',
      required: true
    }
  }
};
