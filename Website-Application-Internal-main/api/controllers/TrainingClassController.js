module.exports = {
  list: async function (req, res) {
    const keyword = req.param('keyword') || '';
    const status = req.param('status') || '';
    const page = parseInt(req.param('page')) || 1;
    const limit = parseInt(req.param('limit')) || 5; // 5 classes per page for easy testing
    const skip = (page - 1) * limit;

    let criteria = {};
    if (keyword) {
      criteria.or = [
        { class_code: { contains: keyword } },
        { name: { contains: keyword } },
        { instructor: { contains: keyword } }
      ];
    }
    if (status) {
      criteria.status = status;
    }

    const total_count = await TrainingClass.count(criteria);
    const total_pages = Math.ceil(total_count / limit) || 1;

    const classes = await TrainingClass.find(criteria)
      .populate('program_id')
      .sort('createdAt DESC')
      .skip(skip)
      .limit(limit);

    return res.view('pages/training_class/list', {
      title: 'Quản lý Lớp tập huấn - VN168',
      classes,
      filters: { keyword, status },
      pagination: { page, limit, total_pages, total_count }
    });
  },

  create: async function (req, res) {
    // Seed default program if none exists
    let program = await TrainingProgram.findOne({ name: 'Chương trình Đào tạo Chuyển đổi số VN168' });
    if (!program) {
      program = await TrainingProgram.create({
        name: 'Chương trình Đào tạo Chuyển đổi số VN168',
        objectives: 'Phổ cập kiến thức AI và kỹ năng số nội bộ.',
        duration_hours: 40,
        content: 'Chuyên đề AI, Data Analysis, Web App Development.',
        target_audience: 'Cán bộ kỹ thuật và nghiệp vụ VN168',
        status: 'active'
      }).fetch();
    }

    // 1. Handle GET: Render view
    if (req.method === 'GET') {
      const programs = await TrainingProgram.find({ status: 'active' });
      return res.view('pages/training_class/create', {
        title: 'Tạo lớp tập huấn mới - VN168',
        programs,
        errors: {},
        form_data: {}
      });
    }

    // 2. Handle POST: Form submission
    if (req.method === 'POST') {
      const class_code = req.param('class_code');
      const name = req.param('name');
      const location = req.param('location');
      const start_date_str = req.param('start_time');
      const end_date_str = req.param('end_time');
      const instructor = req.param('instructor');
      const coordinating_unit = req.param('coordinating_unit');
      const expected_trainees = parseInt(req.param('expected_trainees')) || 0;
      const program_id = req.param('program_id');

      let errors = {};
      let form_data = { class_code, name, location, start_time: start_date_str, end_time: end_date_str, instructor, coordinating_unit, expected_trainees, program_id };

      // Validations
      if (!class_code || class_code.trim() === '') {errors.class_code = 'Mã lớp không được trống.';}
      if (!name || name.trim() === '') {errors.name = 'Tên lớp không được trống.';}
      if (!start_date_str) {errors.start_time = 'Vui lòng chọn ngày bắt đầu.';}
      if (!end_date_str) {errors.end_time = 'Vui lòng chọn ngày kết thúc.';}
      if (!instructor) {errors.instructor = 'Vui lòng nhập tên Giảng viên.';}
      if (!program_id) {errors.program_id = 'Vui lòng chọn chương trình đào tạo.';}

      // Check unique class_code
      if (!errors.class_code) {
        const existing_code = await TrainingClass.findOne({ class_code });
        if (existing_code) {errors.class_code = 'Mã lớp tập huấn đã tồn tại.';}
      }

      if (Object.keys(errors).length > 0) {
        const programs = await TrainingProgram.find({ status: 'active' });
        return res.view('pages/training_class/create', { title: 'Tạo lớp tập huấn mới - VN168', programs, errors, form_data });
      }

      // Parse timestamps
      const start_time = new Date(start_date_str).getTime();
      const end_time = new Date(end_date_str).getTime();

      // Create new class
      const new_class = await TrainingClass.create({
        class_code,
        name,
        location,
        start_time,
        end_time,
        instructor,
        coordinating_unit,
        expected_trainees,
        program_id,
        status: 'scheduled'
      }).fetch();

      // Audit Log
      await AuditLog.create({
        actor_id: req.session.user.id,
        action: 'create_class',
        module: 'training',
        record_id: new_class.id.toString(),
        after_data: new_class
      });

      req.session.flash = { success_message: `Đã khởi tạo thành công lớp tập huấn ${name}.` };
      return res.redirect('/training/classes');
    }
  },

  view: async function (req, res) {
    const class_id = req.param('id');

    if (!class_id) {
      req.session.flash = { error_message: 'Mã lớp không hợp lệ.' };
      return res.redirect('/training/classes');
    }

    const class_record = await TrainingClass.findOne({ id: class_id })
      .populate('program_id');

    if (!class_record) {
      req.session.flash = { error_message: 'Lớp tập huấn không tồn tại.' };
      return res.redirect('/training/classes');
    }

    const trainees = await Trainee.find({ class_id: class_record.id }).sort('full_name ASC');
    const sessions = await AttendanceSession.find({ class_id: class_record.id }).sort('createdAt DESC');
    const certificates = await Certificate.find({ class_id: class_record.id }).populate('trainee_id');

    const total_sessions = sessions.length;
    let trainees_stat = [];

    for (const trainee of trainees) {
      let valid_checkins = 0;
      if (total_sessions > 0) {
        const checkins = await AttendanceRecord.find({
          trainee_id: trainee.id,
          status: 'valid'
        });
        valid_checkins = checkins.length;
      }

      const attendance_rate = total_sessions > 0
        ? Math.round((valid_checkins / total_sessions) * 100)
        : 0;

      const cert = certificates.find(c => c.trainee_id.id === trainee.id && c.status === 'issued');

      trainees_stat.push({
        ...trainee,
        valid_checkins,
        attendance_rate,
        has_certificate: !!cert,
        certificate_code: cert ? cert.certificate_code : null
      });
    }

    return res.view('pages/training_class/view', {
      title: `${class_record.name} - VN168`,
      class_record,
      trainees: trainees_stat,
      sessions,
      certificates,
      total_sessions
    });
  },

  import_trainees: async function (req, res) {
    const class_id = req.param('id');
    const import_data_raw = req.param('import_data');

    if (!class_id || !import_data_raw) {
      req.session.flash = { error_message: 'Thông tin import không hợp lệ.' };
      return res.redirect(`/training/classes/${class_id}`);
    }

    const class_record = await TrainingClass.findOne({ id: class_id });
    if (!class_record) {
      req.session.flash = { error_message: 'Lớp tập huấn không tồn tại.' };
      return res.redirect('/training/classes');
    }

    const lines = import_data_raw.split('\n');
    let imported_count = 0;
    let skipped_duplicates_in_class = 0;
    let system_duplicates_warned = [];

    for (const line of lines) {
      if (!line || line.trim() === '' || !line.includes(',')) {continue;}

      const parts = line.split(',');
      const full_name = parts[0] ? parts[0].trim() : '';
      const unit = parts[1] ? parts[1].trim() : '';
      const position = parts[2] ? parts[2].trim() : '';
      const phone = parts[3] ? parts[3].trim() : '';
      const email = parts[4] ? parts[4].trim() : '';
      const target_group = parts[5] ? parts[5].trim() : 'Nhóm đối tượng A';

      if (!full_name || !phone) {continue;}

      // 1. Check duplicate inside the SAME class
      const duplicate_in_class = await Trainee.findOne({
        class_id,
        or: [{ phone }, { email }]
      });

      if (duplicate_in_class) {
        skipped_duplicates_in_class++;
        continue;
      }

      // 2. Check duplicate in the WHOLE SYSTEM
      const duplicate_in_system = await Trainee.findOne({
        class_id: { '!=': class_id },
        or: [{ phone }, { email }]
      });

      if (duplicate_in_system) {
        system_duplicates_warned.push(`${full_name} (${phone})`);
      }

      await Trainee.create({
        full_name,
        unit,
        position,
        phone,
        email,
        target_group,
        status: 'active',
        class_id
      });

      imported_count++;
    }

    let flash_msg = `Import thành công ${imported_count} học viên.`;
    if (skipped_duplicates_in_class > 0) {
      flash_msg += ` Bỏ qua ${skipped_duplicates_in_class} học viên bị trùng trong lớp này.`;
    }

    if (system_duplicates_warned.length > 0) {
      req.session.flash = {
        success_message: flash_msg,
        warning_message: `Phát hiện ${system_duplicates_warned.length} học viên đã tồn tại ở lớp học khác: ${system_duplicates_warned.join(', ')}. Hãy kiểm tra kỹ thông tin tránh trùng lặp.`
      };
    } else {
      req.session.flash = { success_message: flash_msg };
    }

    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'import_trainees',
      module: 'training',
      record_id: class_id.toString(),
      after_data: { imported_count, skipped_duplicates_in_class, system_duplicates_warned }
    });

    return res.redirect(`/training/classes/${class_id}`);
  },

  open_attendance: async function (req, res) {
    const class_id = req.param('id');

    if (!class_id) {
      req.session.flash = { error_message: 'Lớp học không hợp lệ.' };
      return res.redirect('/training/classes');
    }

    const class_record = await TrainingClass.findOne({ id: class_id });
    if (!class_record) {
      req.session.flash = { error_message: 'Lớp học không tồn tại.' };
      return res.redirect('/training/classes');
    }

    // 1. Handle GET: Render active QR page
    if (req.method === 'GET') {
      const session_id = req.param('session_id');
      const active_session = await AttendanceSession.findOne({ id: session_id });

      if (!active_session) {
        req.session.flash = { error_message: 'Phiên điểm danh không tồn tại.' };
        return res.redirect(`/training/classes/${class_id}`);
      }

      const checkin_url = `${req.baseUrl}/attendance/${active_session.id}/checkin?token=${active_session.qr_token}`;

      return res.view('pages/training_class/attendance_qr', {
        title: `Điểm danh QR: ${class_record.name} - VN168`,
        class_record,
        session: active_session,
        checkin_url
      });
    }

    // 2. Handle POST: Create new session
    if (req.method === 'POST') {
      const session_date = req.param('session_date') || new Date().toLocaleDateString('vi-VN');
      const duration_minutes = parseInt(req.param('duration')) || 15;

      const qr_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const start_time = Date.now();
      const end_time = start_time + (duration_minutes * 60 * 1000);

      const new_session = await AttendanceSession.create({
        session_date,
        start_time,
        end_time,
        qr_token,
        status: 'open',
        class_id
      }).fetch();

      await AuditLog.create({
        actor_id: req.session.user.id,
        action: 'open_attendance',
        module: 'training',
        record_id: new_session.id.toString(),
        after_data: new_session
      });

      return res.redirect(`/training/classes/${class_id}/attendance/open?session_id=${new_session.id}`);
    }
  },

  checkin_attendance: async function (req, res) {
    const session_id = req.param('sessionId');
    const token = req.param('token');

    if (!session_id || !token) {
      return res.status(400).send('Đường dẫn điểm danh không hợp lệ.');
    }

    const session_record = await AttendanceSession.findOne({ id: session_id })
      .populate('class_id');

    if (!session_record) {
      return res.status(404).send('Phiên điểm danh không tồn tại.');
    }

    if (session_record.qr_token !== token) {
      return res.status(403).send('Mã QR điểm danh không chính xác.');
    }

    const is_expired = Date.now() > session_record.end_time || session_record.status !== 'open';
    const trainees = await Trainee.find({ class_id: session_record.class_id.id }).sort('full_name ASC');

    // 1. Handle GET
    if (req.method === 'GET') {
      return res.view('pages/training_class/mock_checkin', {
        no_layout: true,
        title: `Quét mã Điểm danh - VN168`,
        session: session_record,
        trainees,
        is_expired,
        success_checkin: false,
        error_message: null
      });
    }

    // 2. Handle POST
    if (req.method === 'POST') {
      const trainee_id = req.param('trainee_id');

      if (!trainee_id) {
        return res.view('pages/training_class/mock_checkin', {
          no_layout: true,
          session: session_record,
          trainees,
          is_expired,
          success_checkin: false,
          error_message: 'Vui lòng chọn học viên.'
        });
      }

      if (is_expired) {
        return res.view('pages/training_class/mock_checkin', {
          no_layout: true,
          session: session_record,
          trainees,
          is_expired,
          success_checkin: false,
          error_message: 'Phiên điểm danh này đã hết hạn hiệu lực.'
        });
      }

      const existing_checkin = await AttendanceRecord.findOne({
        trainee_id,
        session_id: session_record.id
      });

      if (existing_checkin) {
        return res.view('pages/training_class/mock_checkin', {
          no_layout: true,
          session: session_record,
          trainees,
          is_expired,
          success_checkin: false,
          error_message: 'Bạn đã thực hiện điểm danh cho buổi học này rồi!'
        });
      }

      const record = await AttendanceRecord.create({
        checkin_time: Date.now(),
        device_ip: req.ip || '127.0.0.1',
        device_info: req.headers['user-agent'] || 'Mozilla/5.0 Mock Mobile',
        status: 'valid',
        trainee_id,
        session_id: session_record.id
      }).fetch();

      // Automation 1: Dynamic Certificate auto-issuance check
      const sessions = await AttendanceSession.find({ class_id: session_record.class_id.id });
      const checkins = await AttendanceRecord.find({ trainee_id, status: 'valid' });
      const total_sessions = sessions.length;
      const valid_checkins = checkins.length; // includes the one we just created
      const attendance_rate = total_sessions > 0 ? Math.round((valid_checkins / total_sessions) * 100) : 0;

      let auto_issued_cert = null;
      if (attendance_rate >= 80) {
        const existing_cert = await Certificate.findOne({
          trainee_id,
          class_id: session_record.class_id.id,
          status: 'issued'
        });

        if (!existing_cert) {
          const rand_num = Math.floor(1000 + Math.random() * 9000);
          const certificate_code = `VN168-TR-${session_record.class_id.class_code}-${trainee_id}-${rand_num}`;

          await Certificate.create({
            certificate_code,
            issue_date: Date.now(),
            status: 'issued',
            trainee_id,
            class_id: session_record.class_id.id
          });

          await Trainee.updateOne({ id: trainee_id }).set({ status: 'passed' });
          auto_issued_cert = certificate_code;
        }
      }

      const trainee_record = await Trainee.findOne({ id: trainee_id });

      // Automation 2: Automated checkin in-app push notification
      await Notification.create({
        title: 'Điểm danh QR thành công 📅',
        content: `Học viên ${trainee_record.full_name} đã điểm danh buổi học "${session_record.session_date}".${auto_issued_cert ? ` Bạn đã đạt đủ chuyên cần (>=80%) và được TỰ ĐỘNG CẤP chứng nhận số: ${auto_issued_cert}.` : ''}`,
        link: `/training/classes/${session_record.class_id.id}`,
        user_id: req.session && req.session.user ? req.session.user.id : trainee_record.id
      });

      await AuditLog.create({
        actor_id: req.session && req.session.user ? req.session.user.id : null,
        action: 'trainee_checkin',
        module: 'training',
        record_id: record.id.toString(),
        after_data: { trainee_name: trainee_record.full_name, session_id: session_record.id, auto_cert: auto_issued_cert }
      });

      return res.view('pages/training_class/mock_checkin', {
        no_layout: true,
        session: session_record,
        trainees,
        is_expired,
        success_checkin: true,
        trainee_name: trainee_record.full_name,
        error_message: null
      });
    }
  },

  generate_certificates: async function (req, res) {
    const class_id = req.param('id');

    if (!class_id) {
      req.session.flash = { error_message: 'Mã lớp không hợp lệ.' };
      return res.redirect('/training/classes');
    }

    const class_record = await TrainingClass.findOne({ id: class_id });
    if (!class_record) {
      req.session.flash = { error_message: 'Lớp học không tồn tại.' };
      return res.redirect('/training/classes');
    }

    const sessions = await AttendanceSession.find({ class_id: class_record.id });
    const total_sessions = sessions.length;

    if (total_sessions === 0) {
      req.session.flash = { error_message: 'Lớp học chưa tổ chức buổi điểm danh nào. Chưa thể xét duyệt.' };
      return res.redirect(`/training/classes/${class_id}`);
    }

    const trainees = await Trainee.find({ class_id: class_record.id });
    let certificates_generated = 0;
    let already_had_certificates = 0;

    for (const trainee of trainees) {
      const existing_cert = await Certificate.findOne({
        trainee_id: trainee.id,
        class_id: class_record.id,
        status: 'issued'
      });

      if (existing_cert) {
        already_had_certificates++;
        continue;
      }

      const checkins = await AttendanceRecord.find({
        trainee_id: trainee.id,
        status: 'valid'
      });
      const attendance_rate = Math.round((checkins.length / total_sessions) * 100);

      if (attendance_rate >= 80) {
        const rand_num = Math.floor(1000 + Math.random() * 9000);
        const certificate_code = `VN168-TR-${class_record.class_code}-${trainee.id}-${rand_num}`;

        await Certificate.create({
          certificate_code,
          issue_date: Date.now(),
          status: 'issued',
          trainee_id: trainee.id,
          class_id: class_record.id
        });

        await Trainee.updateOne({ id: trainee.id }).set({ status: 'passed' });

        await AuditLog.create({
          actor_id: req.session.user.id,
          action: 'issue_certificate',
          module: 'training',
          record_id: certificate_code,
          after_data: { trainee_name: trainee.full_name, class_name: class_record.name }
        });

        certificates_generated++;
      } else {
        await Trainee.updateOne({ id: trainee.id }).set({ status: 'failed' });
      }
    }

    let success_msg = `Xét duyệt hoàn tất. Đã cấp mới ${certificates_generated} chứng nhận cho các học viên đủ tiêu chuẩn (chuyên cần >= 80%).`;
    if (already_had_certificates > 0) {
      success_msg += ` (${already_had_certificates} học viên đã có chứng nhận).`;
    }

    req.session.flash = { success_message: success_msg };
    return res.redirect(`/training/classes/${class_id}`);
  },

  view_certificate: async function (req, res) {
    const cert_code = req.param('code');

    if (!cert_code) {
      req.session.flash = { error_message: 'Mã chứng nhận không hợp lệ.' };
      return res.redirect('/dashboard');
    }

    const certificate = await Certificate.findOne({ certificate_code: cert_code })
      .populate('trainee_id')
      .populate('class_id');

    if (!certificate || certificate.status !== 'issued') {
      req.session.flash = { error_message: 'Chứng nhận không tồn tại hoặc đã bị thu hồi.' };
      return res.redirect('/dashboard');
    }

    return res.view('pages/training_class/certificate', {
      title: `Chứng nhận VN168 - ${certificate.trainee_id.full_name}`,
      no_layout: true,
      certificate
    });
  }
};
