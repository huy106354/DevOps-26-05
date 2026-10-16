module.exports = {
  tableName: 'contact_person',
  attributes: {
    full_name: {
      type: 'string',
      required: true
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
    role_description: {
      type: 'string'
    },
    // Relationships
    customer_id: {
      model: 'customer',
      required: true
    }
  }
};
