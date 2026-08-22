module.exports = {
  view: async function (req, res) {
    // Fetch Training Stats
    const total_classes = await TrainingClass.count();
    const total_trainees = await Trainee.count();
    const total_certificates = await Certificate.count({ status: 'issued' });
    const active_sessions = await AttendanceSession.count({ status: 'open' });

    // Fetch Document Stats
    const total_incoming = await DocumentRecord.count({ doc_type: 'incoming' });
    const total_outgoing = await DocumentRecord.count({ doc_type: 'outgoing' });
    const active_assignments = await DocumentAssignment.count({ status: ['pending', 'ongoing'] });
    const overdue_documents = await DocumentRecord.count({ status: 'overdue' });

    // Fetch CRM Stats
    const total_customers = await Customer.count();
    const total_opportunities = await Opportunity.count();
    const won_opportunities = await Opportunity.count({ stage: 'won' });

    // Fetch Assets Stats
    const total_assets = await AssetItem.count();
    const assigned_assets = await AssetItem.count({ status: 'assigned' });
    const maintenance_assets = await AssetItem.count({ status: 'maintenance' });

    // Latest Audit Logs
    const latest_logs = await AuditLog.find()
      .populate('actor_id')
      .sort('createdAt DESC')
      .limit(5);

    // Latest Notifications
    const active_notifications = await Notification.find({
      user_id: req.session.user.id,
      read_at: null
    }).sort('createdAt DESC').limit(5);

    return res.view('pages/dashboard/index', {
      title: 'Hệ thống Quản lý Nội bộ - VN168',
      stats: {
        training: { total_classes, total_trainees, total_certificates, active_sessions },
        documents: { total_incoming, total_outgoing, active_assignments, overdue_documents },
        crm: { total_customers, total_opportunities, won_opportunities },
        assets: { total_assets, assigned_assets, maintenance_assets }
      },
      latest_logs,
      active_notifications
    });
  }
};
