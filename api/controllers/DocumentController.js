module.exports = {
  list: async function (req, res) {
    const doc_type = req.param('doc_type') || '';
    const status = req.param('status') || '';
    const urgency = req.param('urgency') || '';
    const keyword = req.param('keyword') || '';
    const page = parseInt(req.param('page')) || 1;
    const limit = parseInt(req.param('limit')) || 5;
    const skip = (page - 1) * limit;

    // Automation 3: Automated Assignment Deadline Overdue Scanner ngầm
    const pending_assignments = await DocumentAssignment.find({
      status: 'pending',
      deadline: { '<': Date.now() }
    }).populate('document_id');

    for (const assignment of pending_assignments) {
      await DocumentAssignment.updateOne({ id: assignment.id }).set({ status: 'overdue' });
      if (assignment.document_id && assignment.document_id.status !== 'completed') {
        await DocumentRecord.updateOne({ id: assignment.document_id.id }).set({ status: 'overdue' });
      }

      // Notify Assignee and Assigner
      await Notification.create({
        title: 'Cảnh báo: Công văn trễ hạn xử lý! ⏳',
        content: `Công văn số ${assignment.document_id.doc_number} giao việc cho bạn đã quá hạn xử lý vào ngày ${new Date(assignment.deadline).toLocaleDateString('vi-VN')}.`,
        link: `/documents/${assignment.document_id.id}`,
        user_id: assignment.assigned_to
      });
      await Notification.create({
        title: 'Thông báo: Công việc bàn giao bị trễ hạn ⏳',
        content: `Công việc giao cho cán bộ đã quá hạn xử lý tại công văn số ${assignment.document_id.doc_number}.`,
        link: `/documents/${assignment.document_id.id}`,
        user_id: assignment.assigned_by
      });
    }

    // Seeding if database table is empty
    const count = await DocumentRecord.count();
    if (count === 0) {
      await DocumentRecord.createEach([
        {
          doc_number: '125/QĐ-UBND',
          summary: 'Quyết định phê duyệt đề án chuyển đổi số VN168 giai đoạn 2026-2030',
          doc_type: 'incoming',
          issued_date: Date.now() - 5*24*60*60*1000,
          received_sent_date: Date.now() - 4*24*60*60*1000,
          issuing_agency: 'Ủy ban Nhân dân Tỉnh',
          urgency: 'high',
          confidentiality: 'normal',
          status: 'assigned'
        },
        {
          doc_number: '88/CV-BTTTT',
          summary: 'Công văn hướng dẫn bảo mật dữ liệu cá nhân trên nền tảng số',
          doc_type: 'incoming',
          issued_date: Date.now() - 4*24*60*60*1000,
          received_sent_date: Date.now() - 3*24*60*60*1000,
          issuing_agency: 'Bộ Thông tin và Truyền thông',
          urgency: 'express',
          confidentiality: 'confidential',
          status: 'processing'
        },
        {
          doc_number: '15/TTr-VN168',
          summary: 'Tờ trình xin phê chuẩn kinh phí đầu tư phòng Lab phát triển mô hình AI nội bộ',
          doc_type: 'outgoing',
          issued_date: Date.now() - 3*24*60*60*1000,
          received_sent_date: Date.now() - 3*24*60*60*1000,
          issuing_agency: 'Công ty Cổ phần Công nghệ VN168',
          urgency: 'normal',
          confidentiality: 'normal',
          status: 'completed'
        },
        {
          doc_number: '202/QĐ-VN168',
          summary: 'Quyết định ban hành Quy chế bảo mật thông tin nội bộ và quy trình xử lý công văn',
          doc_type: 'outgoing',
          issued_date: Date.now() - 2*24*60*60*1000,
          received_sent_date: Date.now() - 2*24*60*60*1000,
          issuing_agency: 'Công ty Cổ phần Công nghệ VN168',
          urgency: 'high',
          confidentiality: 'top_secret',
          status: 'completed'
        },
        {
          doc_number: '05/HD-KHCN',
          summary: 'Hướng dẫn chuẩn hóa quy trình triển khai phần mềm Sails.js và Docker',
          doc_type: 'incoming',
          issued_date: Date.now() - 6*24*60*60*1000,
          received_sent_date: Date.now() - 5*24*60*60*1000,
          issuing_agency: 'Sở Khoa học và Công nghệ',
          urgency: 'normal',
          confidentiality: 'normal',
          status: 'new'
        },
        {
          doc_number: '432/CV-VN168',
          summary: 'Công văn phúc đáp đề nghị phối hợp đào tạo chuyển đổi số AI cho cán bộ',
          doc_type: 'outgoing',
          issued_date: Date.now() - 1*24*60*60*1000,
          received_sent_date: Date.now() - 1*24*60*60*1000,
          issuing_agency: 'Công ty Cổ phần Công nghệ VN168',
          urgency: 'normal',
          confidentiality: 'normal',
          status: 'completed'
        },
        {
          doc_number: '18/KH-STTTT',
          summary: 'Kế hoạch tổ chức diễn đàn chuyển đổi số quốc gia và ngày hội AI năm 2026',
          doc_type: 'incoming',
          issued_date: Date.now() - 10*24*60*60*1000,
          received_sent_date: Date.now() - 9*24*60*60*1000,
          issuing_agency: 'Sở Thông tin và Truyền thông',
          urgency: 'high',
          confidentiality: 'normal',
          status: 'processing'
        }
      ]);
    }

    let criteria = {};
    if (doc_type) {criteria.doc_type = doc_type;}
    if (status) {criteria.status = status;}
    if (urgency) {criteria.urgency = urgency;}

    if (keyword) {
      criteria.or = [
        { doc_number: { contains: keyword } },
        { summary: { contains: keyword } },
        { issuing_agency: { contains: keyword } }
      ];
    }

    const total_count = await DocumentRecord.count(criteria);
    const total_pages = Math.ceil(total_count / limit) || 1;

    const documents = await DocumentRecord.find(criteria)
      .sort('createdAt DESC')
      .skip(skip)
      .limit(limit);

    return res.view('pages/document/list', {
      title: 'Quản lý Công văn Đi/Đến - VN168',
      documents,
      filters: { doc_type, status, urgency, keyword },
      pagination: { page, limit, total_pages, total_count }
    });
  },

  create_incoming: async function (req, res) {
    // 1. Handle GET: Render form
    if (req.method === 'GET') {
      return res.view('pages/document/create_incoming', {
        title: 'Nhập công văn đến mới - VN168',
        errors: {},
        form_data: {}
      });
    }

    // 2. Handle POST: Form submission
    if (req.method === 'POST') {
      const doc_number = req.param('doc_number');
      const summary = req.param('summary');
      const issued_date_str = req.param('issued_date');
      const received_date_str = req.param('received_date');
      const issuing_agency = req.param('issuing_agency');
      const urgency = req.param('urgency') || 'normal';
      const confidentiality = req.param('confidentiality') || 'normal';
      const mock_filename = req.param('mock_filename') || 'scan_document.pdf';

      let errors = {};
      let form_data = { doc_number, summary, issued_date: issued_date_str, received_date: received_date_str, issuing_agency, urgency, confidentiality };

      // Validations
      if (!doc_number || doc_number.trim() === '') {errors.doc_number = 'Số/Ký hiệu không được trống.';}
      if (!summary || summary.trim() === '') {errors.summary = 'Trích yếu công văn không được trống.';}
      if (!issued_date_str) {errors.issued_date = 'Vui lòng chọn ngày ban hành.';}
      if (!received_date_str) {errors.received_date = 'Vui lòng chọn ngày đến.';}
      if (!issuing_agency) {errors.issuing_agency = 'Vui lòng nhập Cơ quan ban hành.';}

      // Check duplicate doc_number in database
      if (!errors.doc_number) {
        const existing_doc = await DocumentRecord.findOne({ doc_number, doc_type: 'incoming' });
        if (existing_doc) {errors.doc_number = 'Số/Ký hiệu công văn này đã tồn tại trên hệ thống.';}
      }

      if (Object.keys(errors).length > 0) {
        return res.view('pages/document/create_incoming', { title: 'Nhập công văn đến mới - VN168', errors, form_data });
      }

      // Convert timestamps
      const issued_date = new Date(issued_date_str).getTime();
      const received_sent_date = new Date(received_date_str).getTime();

      // Create document record
      const new_doc = await DocumentRecord.create({
        doc_number,
        summary,
        doc_type: 'incoming',
        issued_date,
        received_sent_date,
        issuing_agency,
        urgency,
        confidentiality,
        status: 'new'
      }).fetch();

      // Save simulated attachment if mock file was chosen
      if (mock_filename) {
        const file_path = `/uploads/documents/${Date.now()}_${mock_filename}`;
        await Attachment.create({
          filename: mock_filename,
          path: file_path,
          mime_type: 'application/pdf',
          size: 154238, // 154KB mock size
          owner_type: 'document',
          owner_id: new_doc.id.toString(),
          uploaded_by: req.session.user.id
        });
      }

      // Record system timeline process log
      await DocumentProcessLog.create({
        action_time: Date.now(),
        action_taken: 'khởi tạo',
        action_details: `Văn thư ${req.session.user.full_name} đăng ký công văn đến thành công.`,
        document_id: new_doc.id,
        user_id: req.session.user.id
      });

      // Audit Log
      await AuditLog.create({
        actor_id: req.session.user.id,
        action: 'create_incoming_document',
        module: 'document',
        record_id: new_doc.id.toString(),
        after_data: new_doc
      });

      req.session.flash = { success_message: `Đã nhập công văn đến số ${doc_number} thành công.` };
      return res.redirect('/documents');
    }
  },

  create_outgoing: async function (req, res) {
    // 1. Handle GET: Render form
    if (req.method === 'GET') {
      return res.view('pages/document/create_outgoing', {
        title: 'Đăng ký công văn đi mới - VN168',
        errors: {},
        form_data: {}
      });
    }

    // 2. Handle POST: Form submission
    if (req.method === 'POST') {
      const doc_number = req.param('doc_number');
      const summary = req.param('summary');
      const issued_date_str = req.param('issued_date');
      const recipient_agency = req.param('recipient_agency');
      const signer_name = req.param('signer_name');
      const urgency = req.param('urgency') || 'normal';
      const confidentiality = req.param('confidentiality') || 'normal';
      const mock_filename = req.param('mock_filename') || 'outgoing_signed.pdf';

      let errors = {};
      let form_data = { doc_number, summary, issued_date: issued_date_str, recipient_agency, signer_name, urgency, confidentiality };

      // Validations
      if (!doc_number || doc_number.trim() === '') {errors.doc_number = 'Số đi/Ký hiệu không được trống.';}
      if (!summary || summary.trim() === '') {errors.summary = 'Trích yếu công văn không được trống.';}
      if (!issued_date_str) {errors.issued_date = 'Vui lòng chọn ngày phát hành.';}
      if (!recipient_agency) {errors.recipient_agency = 'Vui lòng nhập Nơi nhận công văn.';}
      if (!signer_name) {errors.signer_name = 'Vui lòng nhập Người ký ban hành.';}

      // Check unique
      if (!errors.doc_number) {
        const existing_doc = await DocumentRecord.findOne({ doc_number, doc_type: 'outgoing' });
        if (existing_doc) {errors.doc_number = 'Số/Ký hiệu công văn đi đã tồn tại.';}
      }

      if (Object.keys(errors).length > 0) {
        return res.view('pages/document/create_outgoing', { title: 'Đăng ký công văn đi mới - VN168', errors, form_data });
      }

      const issued_date = new Date(issued_date_str).getTime();

      // Create DocumentRecord
      const new_doc = await DocumentRecord.create({
        doc_number,
        summary,
        doc_type: 'outgoing',
        issued_date,
        received_sent_date: issued_date,
        issuing_agency: 'Công ty Cổ phần Công nghệ VN168',
        urgency,
        confidentiality,
        status: 'completed'
      }).fetch();

      // Create OutgoingDocument specific details
      await OutgoingDocument.create({
        recipient_agency,
        signer_name,
        published_date: issued_date,
        status: 'published',
        document_id: new_doc.id
      });

      // Save attachment
      if (mock_filename) {
        const file_path = `/uploads/documents/${Date.now()}_${mock_filename}`;
        await Attachment.create({
          filename: mock_filename,
          path: file_path,
          mime_type: 'application/pdf',
          size: 204856,
          owner_type: 'document',
          owner_id: new_doc.id.toString(),
          uploaded_by: req.session.user.id
        });
      }

      // Record system timeline process log
      await DocumentProcessLog.create({
        action_time: Date.now(),
        action_taken: 'khởi tạo',
        action_details: `Văn thư ${req.session.user.full_name} đăng ký công văn đi và chính thức phát hành.`,
        document_id: new_doc.id,
        user_id: req.session.user.id
      });

      // Audit Log
      await AuditLog.create({
        actor_id: req.session.user.id,
        action: 'create_outgoing_document',
        module: 'document',
        record_id: new_doc.id.toString(),
        after_data: new_doc
      });

      req.session.flash = { success_message: `Đã đăng ký phát hành công văn đi số ${doc_number} thành công.` };
      return res.redirect('/documents');
    }
  },

  view: async function (req, res) {
    const doc_id = req.param('id');

    if (!doc_id) {
      req.session.flash = { error_message: 'Mã công văn không hợp lệ.' };
      return res.redirect('/documents');
    }

    const document = await DocumentRecord.findOne({ id: doc_id });

    if (!document) {
      req.session.flash = { error_message: 'Công văn không tồn tại.' };
      return res.redirect('/documents');
    }

    // Fetch assignments
    const assignments = await DocumentAssignment.find({ document_id: document.id })
      .populate('assigned_by')
      .populate('assigned_to')
      .sort('createdAt DESC');

    // Fetch process logs
    const process_logs = await DocumentProcessLog.find({ document_id: document.id })
      .populate('user_id')
      .sort('action_time ASC');

    // Fetch comments
    const comments = await DocumentComment.find({ document_id: document.id })
      .populate('user_id')
      .sort('comment_time ASC');

    // Fetch attachments
    const attachments = await Attachment.find({
      owner_type: 'document',
      owner_id: document.id.toString()
    }).populate('uploaded_by');

    let outgoing_info = null;
    if (document.doc_type === 'outgoing') {
      outgoing_info = await OutgoingDocument.findOne({ document_id: document.id });
    }

    const active_users = await User.find({ status: 'active' }).sort('full_name ASC');

    return res.view('pages/document/view', {
      title: `Công văn: ${document.doc_number} - VN168`,
      document,
      assignments,
      process_logs,
      comments,
      attachments,
      outgoing_info,
      active_users
    });
  },

  assign: async function (req, res) {
    const doc_id = req.param('id');
    const assigned_to_id = req.param('assigned_to');
    const instructions = req.param('instructions');
    const deadline_str = req.param('deadline');

    if (!doc_id || !assigned_to_id) {
      req.session.flash = { error_message: 'Thông tin bàn giao không hợp lệ.' };
      return res.redirect(`/documents/${doc_id}`);
    }

    const document = await DocumentRecord.findOne({ id: doc_id });
    if (!document) {
      req.session.flash = { error_message: 'Công văn không tồn tại.' };
      return res.redirect('/documents');
    }

    const target_user = await User.findOne({ id: assigned_to_id });
    if (!target_user) {
      req.session.flash = { error_message: 'Cán bộ nhận bàn giao không tồn tại.' };
      return res.redirect(`/documents/${doc_id}`);
    }

    const deadline = deadline_str ? new Date(deadline_str).getTime() : Date.now() + (3 * 24 * 60 * 60 * 1000);

    // Create DocumentAssignment
    const new_assignment = await DocumentAssignment.create({
      instructions,
      deadline,
      status: 'pending',
      document_id: document.id,
      assigned_by: req.session.user.id,
      assigned_to: target_user.id
    }).fetch();

    // Update Document status
    await DocumentRecord.updateOne({ id: document.id }).set({
      status: 'assigned'
    });

    // Record system timeline process log
    await DocumentProcessLog.create({
      action_time: Date.now(),
      action_taken: 'bàn giao',
      action_details: `${req.session.user.full_name} chuyển xử lý cho ${target_user.full_name}. Nội dung chỉ đạo: "${instructions || 'Thực hiện theo đúng nghiệp vụ.'}"`,
      document_id: document.id,
      user_id: req.session.user.id
    });

    // Create Notification
    await Notification.create({
      title: 'Bạn được bàn giao xử lý công văn mới',
      content: `${req.session.user.full_name} giao xử lý công văn số ${document.doc_number}. Hạn chốt: ${new Date(deadline).toLocaleDateString('vi-VN')}.`,
      link: `/documents/${document.id}`,
      user_id: target_user.id
    });

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'assign_document',
      module: 'document',
      record_id: document.id.toString(),
      after_data: new_assignment
    });

    req.session.flash = { success_message: `Đã chuyển giao xử lý công văn số ${document.doc_number} cho ${target_user.full_name} thành công.` };
    return res.redirect(`/documents/${document.id}`);
  },

  add_log: async function (req, res) {
    const doc_id = req.param('id');
    const comment_text = req.param('comment_text');

    if (!doc_id || !comment_text || comment_text.trim() === '') {
      req.session.flash = { error_message: 'Ý kiến đóng góp không được rỗng.' };
      return res.redirect(`/documents/${doc_id}`);
    }

    const document = await DocumentRecord.findOne({ id: doc_id });
    if (!document) {
      req.session.flash = { error_message: 'Công văn không tồn tại.' };
      return res.redirect('/documents');
    }

    // Create DocumentComment
    await DocumentComment.create({
      comment_text,
      comment_time: Date.now(),
      document_id: document.id,
      user_id: req.session.user.id
    });

    // Update document status
    if (document.status === 'new' || document.status === 'assigned') {
      await DocumentRecord.updateOne({ id: document.id }).set({
        status: 'processing'
      });
    }

    // Record system timeline process log
    await DocumentProcessLog.create({
      action_time: Date.now(),
      action_taken: 'cập nhật',
      action_details: `${req.session.user.full_name} đã ghi nhận cập nhật tiến độ: "${comment_text}"`,
      document_id: document.id,
      user_id: req.session.user.id
    });

    req.session.flash = { success_message: 'Đã cập nhật tiến độ xử lý công văn.' };
    return res.redirect(`/documents/${document.id}`);
  },

  close: async function (req, res) {
    const doc_id = req.param('id');

    if (!doc_id) {
      req.session.flash = { error_message: 'Mã công văn không hợp lệ.' };
      return res.redirect('/documents');
    }

    const document = await DocumentRecord.findOne({ id: doc_id });
    if (!document) {
      req.session.flash = { error_message: 'Công văn không tồn tại.' };
      return res.redirect('/documents');
    }

    // Update status to 'completed'
    await DocumentRecord.updateOne({ id: document.id }).set({
      status: 'completed'
    });

    // Update pending assignments
    await DocumentAssignment.update({
      document_id: document.id,
      status: 'pending'
    }).set({
      status: 'completed'
    });

    // Record system timeline process log
    await DocumentProcessLog.create({
      action_time: Date.now(),
      action_taken: 'hoàn thành',
      action_details: `Lãnh đạo / Cán bộ phụ trách ${req.session.user.full_name} chính thức đóng hồ sơ công văn, xác nhận hoàn thành xử lý.`,
      document_id: document.id,
      user_id: req.session.user.id
    });

    // Audit Log
    await AuditLog.create({
      actor_id: req.session.user.id,
      action: 'close_document',
      module: 'document',
      record_id: document.id.toString(),
      after_data: { status: 'completed', timestamp: Date.now() }
    });

    req.session.flash = { success_message: `Đã đóng hồ sơ công văn số ${document.doc_number} thành công.` };
    return res.redirect(`/documents/${document.id}`);
  }
};
