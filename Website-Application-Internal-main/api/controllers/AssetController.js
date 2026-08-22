module.exports = {
  list: async function (req, res) {
    const count = await AssetItem.count();
    if (count === 0) {
      let cat1 = await AssetCategory.findOne({ name: 'Thiết bị Đào tạo' });
      if (!cat1) {
        cat1 = await AssetCategory.create({
          name: 'Thiết bị Đào tạo',
          description: 'Máy chiếu, bảng viết, loa đài'
        }).fetch();
      }

      let cat2 = await AssetCategory.findOne({ name: 'Thiết bị Công nghệ' });
      if (!cat2) {
        cat2 = await AssetCategory.create({
          name: 'Thiết bị Công nghệ',
          description: 'Máy tính laptop phục vụ giảng dạy AI'
        }).fetch();
      }

      await AssetItem.create({
        asset_code: 'TS-PROJECTOR-01',
        name: 'Máy chiếu Epson EB-X51',
        serial_number: 'EPSON89765432',
        purchase_date: Date.now() - 365 * 24 * 60 * 60 * 1000,
        purchase_value: 15500000,
        status: 'available',
        location: 'Phòng học lý thuyết A',
        category_id: cat1.id
      });

      await AssetItem.create({
        asset_code: 'TS-LAPTOP-AI-01',
        name: 'Laptop ASUS ROG RTX 4060 (AI Lab)',
        serial_number: 'ASUSAI20260601',
        purchase_date: Date.now() - 100 * 24 * 60 * 60 * 1000,
        purchase_value: 32000000,
        status: 'assigned',
        location: 'Phòng máy thực hành AI',
        category_id: cat2.id
      });

      await AssetItem.create({
        asset_code: 'TS-SOUND-MIC-02',
        name: 'Bộ microphone không dây Shure',
        serial_number: 'SHURE554321',
        purchase_date: Date.now() - 200 * 24 * 60 * 60 * 1000,
        purchase_value: 8500000,
        status: 'maintenance',
        location: 'Kho thiết bị đào tạo',
        category_id: cat1.id
      });
    }

    const assets_raw = await AssetItem.find().populate('category_id');

    // Automation 7: Dynamic straight-line financial depreciation (5-Year scale = 1825 Days)
    let assets = [];
    for (const item of assets_raw) {
      const days_passed = Math.floor((Date.now() - item.purchase_date) / (24 * 60 * 60 * 1000));

      let depreciation_percentage = 100;
      let book_value = item.purchase_value || 0;

      if (days_passed >= 1825) {
        depreciation_percentage = 0;
        book_value = 0;
      } else if (days_passed > 0) {
        const remaining_factor = 1 - (days_passed / 1825);
        depreciation_percentage = Math.round(remaining_factor * 100);
        book_value = Math.round((item.purchase_value || 0) * remaining_factor);
      }

      assets.push({
        ...item,
        depreciation_percentage,
        book_value
      });
    }

    return res.view('pages/asset/list', {
      title: 'Quản lý Tài sản - VN168',
      assets
    });
  },

  create: async function (req, res) {
    const asset_code = req.param('asset_code');
    const name = req.param('name');
    const category_name = req.param('category_name') || 'Thiết bị văn phòng';
    const serial_number = req.param('serial_number') || '';
    const purchase_value = parseInt(req.param('purchase_value')) || 0;
    const location = req.param('location') || 'Kho hành chính';
    const status = req.param('status') || 'available';

    if (!asset_code || asset_code.trim() === '') {
      req.session.flash = { error_message: 'Mã tài sản không được để trống.' };
      return res.redirect('/assets/items');
    }
    if (!name || name.trim() === '') {
      req.session.flash = { error_message: 'Tên trang thiết bị tài sản không được để trống.' };
      return res.redirect('/assets/items');
    }

    const existing_code = await AssetItem.findOne({ asset_code });
    if (existing_code) {
      req.session.flash = { error_message: 'Mã tài sản này đã tồn tại trên hệ thống.' };
      return res.redirect('/assets/items');
    }

    let category = await AssetCategory.findOne({ name: category_name });
    if (!category) {
      category = await AssetCategory.create({
        name: category_name,
        description: 'Nhóm thiết bị khởi tạo tự động'
      }).fetch();
    }

    const new_asset = await AssetItem.create({
      asset_code,
      name,
      serial_number,
      purchase_date: Date.now(),
      purchase_value,
      status,
      location,
      category_id: category.id
    }).fetch();

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'create_asset',
      module: 'asset',
      record_id: new_asset.id.toString(),
      after_data: new_asset
    });

    // Automation 8: Automated 6-Month Preventive Maintenance Schedule ngầm
    const maintenance_date = Date.now() + 180 * 24 * 60 * 60 * 1000;
    await AssetMaintenance.create({
      maintenance_date,
      work_description: `Lên lịch bảo dưỡng định kỳ 6 tháng lần đầu cho thiết bị ${name}. Kiểm tra tổng thể phần cứng và vệ sinh bụi.`,
      cost: 0,
      vendor: 'Hành chính VN168',
      result: 'success', // scheduled initial status
      asset_id: new_asset.id
    });

    req.session.flash = { success_message: `Đã hoàn tất đăng ký nhập kho tài sản: ${name} (${asset_code}).` };
    return res.redirect('/assets/items');
  },

  update_status: async function (req, res) {
    const asset_id = req.param('id');
    const status = req.param('status');
    const location = req.param('location');

    if (!asset_id || !status) {
      req.session.flash = { error_message: 'Thông tin thay đổi trạng thái không hợp lệ.' };
      return res.redirect('/assets/items');
    }

    const item = await AssetItem.findOne({ id: asset_id });
    if (!item) {
      req.session.flash = { error_message: 'Tài sản không tồn tại trên hệ thống.' };
      return res.redirect('/assets/items');
    }

    let update_data = { status };
    if (location && location.trim() !== '') {
      update_data.location = location;
    }

    const updated = await AssetItem.updateOne({ id: asset_id }).set(update_data);

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'update_asset_status',
      module: 'asset',
      record_id: item.id.toString(),
      after_data: updated
    });

    req.session.flash = { success_message: `Đã cập nhật trạng thái hoạt động của tài sản ${item.name} thành công.` };
    return res.redirect('/assets/items');
  }
};
