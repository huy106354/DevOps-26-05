module.exports = {
  tableName: 'customer',
  attributes: {
    customer_code: {
      type: 'string',
      required: true,
      unique: true
    },
    company_name: {
      type: 'string',
      required: true
    },
    industry: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    province_city: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['lead', 'prospect', 'active', 'inactive'],
      defaultsTo: 'lead'
    },
    // Relationships
    owner_id: {
      model: 'user'
    },
    contacts: {
      collection: 'contactperson',
      via: 'customer_id'
    },
    opportunities: {
      collection: 'opportunity',
      via: 'customer_id'
    },
    interactions: {
      collection: 'interactionlog',
      via: 'customer_id'
    },
    quotes: {
      collection: 'quote',
      via: 'customer_id'
    },
    contracts: {
      collection: 'contract',
      via: 'customer_id'
    },
    follow_up_tasks: {
      collection: 'followuptask',
      via: 'customer_id'
    }
  }
};
