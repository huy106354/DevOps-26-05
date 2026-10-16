module.exports = {
  list: async function (req, res) {
    const count = await Customer.count();
    if (count === 0) {
      const system_user = await User.findOne({ status: 'active' });
      if (system_user) {
        const c1 = await Customer.create({
          customer_code: 'KH-VNPT',
          company_name: 'VNPT Đắk Lắk',
          industry: 'Viễn thông',
          address: '01 Lê Duẩn, Buôn Ma Thuột',
          province_city: 'Đắk Lắk',
          status: 'prospect',
          owner_id: system_user.id
        }).fetch();

        const c2 = await Customer.create({
          customer_code: 'KH-SXD',
          company_name: 'Sở Xây dựng tỉnh Đắk Lắk',
          industry: 'Cơ quan nhà nước',
          address: '15 Hùng Vương, Buôn Ma Thuột',
          province_city: 'Đắk Lắk',
          status: 'active',
          owner_id: system_user.id
        }).fetch();

        const c3 = await Customer.create({
          customer_code: 'KH-MOCK',
          company_name: 'Tập đoàn Công nghệ MockTech',
          industry: 'Công nghệ thông tin',
          address: '456 Lê Thánh Tông',
          province_city: 'Hà Nội',
          status: 'lead',
          owner_id: system_user.id
        }).fetch();

        await Opportunity.create({
          requirements: 'Hợp đồng đào tạo chuyển đổi số AI cho 100 cán bộ viễn thông',
          expected_value: 120000000,
          stage: 'quoted',
          probability: 70,
          expected_close_date: Date.now() + 10 * 24 * 60 * 60 * 1000,
          customer_id: c1.id
        });

        await Opportunity.create({
          requirements: 'Hệ thống Quản lý Công văn và Hồ sơ Lưu trữ số hóa',
          expected_value: 350000000,
          stage: 'won',
          probability: 100,
          expected_close_date: Date.now() - 2 * 24 * 60 * 60 * 1000,
          customer_id: c2.id
        });

        await Opportunity.create({
          requirements: 'Tư vấn giải pháp Chuyển đổi số doanh nghiệp toàn diện',
          expected_value: 50000000,
          stage: 'new',
          probability: 10,
          expected_close_date: Date.now() + 30 * 24 * 60 * 60 * 1000,
          customer_id: c3.id
        });
      }
    }

    const customers_raw = await Customer.find().populate('owner_id');
    const opportunities = await Opportunity.find().populate('customer_id');

    // Automation 5: Dynamic CRM Forecasting & Customer Tiering calculations
    let total_pipeline_value = 0;
    let total_won_value = 0;
    let weighted_forecast_value = 0;

    for (const opp of opportunities) {
      total_pipeline_value += opp.expected_value || 0;
      if (opp.stage === 'won') {
        total_won_value += opp.expected_value || 0;
      }
      weighted_forecast_value += Math.round((opp.expected_value || 0) * ((opp.probability || 10) / 100));
    }

    let customers = [];
    for (const c of customers_raw) {
      const cust_opps = opportunities.filter(o => o.customer_id && o.customer_id.id === c.id && o.stage === 'won');
      const total_won = cust_opps.reduce((acc, curr) => acc + (curr.expected_value || 0), 0);

      let tier = 'bronze';
      if (total_won >= 200000000) {tier = 'gold';}
      else if (total_won >= 100000000) {tier = 'silver';}

      customers.push({
        ...c,
        total_won,
        tier
      });
    }

    return res.view('pages/crm_customer/list', {
      title: 'CRM Mini - VN168',
      customers,
      opportunities,
      analytics: {
        total_pipeline_value,
        total_won_value,
        weighted_forecast_value
      }
    });
  },

  create_customer: async function (req, res) {
    const customer_code = req.param('customer_code');
    const company_name = req.param('company_name');
    const industry = req.param('industry') || '';
    const address = req.param('address') || '';
    const province_city = req.param('province_city') || 'Đắk Lắk';
    const status = req.param('status') || 'lead';

    if (!customer_code || customer_code.trim() === '') {
      req.session.flash = { error_message: 'Mã khách hàng không được để trống.' };
      return res.redirect('/crm/customers');
    }
    if (!company_name || company_name.trim() === '') {
      req.session.flash = { error_message: 'Tên công ty không được để trống.' };
      return res.redirect('/crm/customers');
    }

    const existing_code = await Customer.findOne({ customer_code });
    if (existing_code) {
      req.session.flash = { error_message: 'Mã khách hàng này đã tồn tại trên hệ thống.' };
      return res.redirect('/crm/customers');
    }

    const system_user = await User.findOne({ status: 'active' });

    const new_cust = await Customer.create({
      customer_code,
      company_name,
      industry,
      address,
      province_city,
      status,
      owner_id: system_user ? system_user.id : req.session.user.id
    }).fetch();

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'create_customer',
      module: 'crm',
      record_id: new_cust.id.toString(),
      after_data: new_cust
    });

    // Automation 6: Automated 3-day Follow-up task scheduler for new prospects (lead)
    if (status === 'lead') {
      const due_date = Date.now() + 3 * 24 * 60 * 60 * 1000;
      await FollowUpTask.create({
        task_description: `Liên hệ khách hàng tiềm năng ${company_name} để khảo sát nhu cầu chuyển đổi số AI & phần mềm.`,
        due_date,
        status: 'pending',
        customer_id: new_cust.id,
        user_id: system_user ? system_user.id : req.session.user.id
      });
    }

    req.session.flash = { success_message: `Đã khởi tạo thành công khách hàng ${company_name} (${customer_code}).` };
    return res.redirect('/crm/customers');
  },

  create_opportunity: async function (req, res) {
    const customer_id = req.param('customer_id');
    const requirements = req.param('requirements');
    const expected_value = parseInt(req.param('expected_value')) || 0;
    const probability = parseInt(req.param('probability')) || 10;
    const stage = req.param('stage') || 'new';

    if (!customer_id) {
      req.session.flash = { error_message: 'Vui lòng lựa chọn khách hàng liên kết.' };
      return res.redirect('/crm/customers');
    }
    if (!requirements || requirements.trim() === '') {
      req.session.flash = { error_message: 'Nhu cầu/Yêu cầu khách hàng không được trống.' };
      return res.redirect('/crm/customers');
    }

    const customer = await Customer.findOne({ id: customer_id });
    if (!customer) {
      req.session.flash = { error_message: 'Khách hàng không tồn tại trên hệ thống.' };
      return res.redirect('/crm/customers');
    }

    const new_opp = await Opportunity.create({
      requirements,
      expected_value,
      stage,
      probability,
      expected_close_date: Date.now() + 30 * 24 * 60 * 60 * 1000,
      customer_id: customer.id
    }).fetch();

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'create_opportunity',
      module: 'crm',
      record_id: new_opp.id.toString(),
      after_data: new_opp
    });

    req.session.flash = { success_message: `Đã khởi tạo thành công cơ hội kinh doanh mới cho ${customer.company_name}.` };
    return res.redirect('/crm/customers');
  }
};
