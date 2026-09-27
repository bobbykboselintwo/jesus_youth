import { useState } from 'react';

export default function AdminDashboard({
  submissions = [],
  onUpdateStatus,
  onLogout,
  onBackToForm
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('NEW_STUDENTS');

  const filtered = submissions.filter((item) => {
    // Legacy submissions usually lack ocrStatus, new ones have it. 
    // Alternatively, you can use a date threshold. Here we use ocrStatus presence as a proxy for "automated".
    const isNew = item.ocrStatus != null;
    const matchesTab = statusFilter === 'NEW_STUDENTS' ? isNew : !isNew;

    const query = search.toLowerCase();
    const matchesQuery =
      (item.regId || item.registration_id || '').toLowerCase().includes(query) ||
      (item.name || '').toLowerCase().includes(query) ||
      (item.surname || '').toLowerCase().includes(query) ||
      (item.parish || '').toLowerCase().includes(query) ||
      (item.diocese || '').toLowerCase().includes(query) ||
      (item.phone || '').toLowerCase().includes(query) ||
      (item.email || '').toLowerCase().includes(query) ||
      (item.registeredBy || '').toLowerCase().includes(query);

    return matchesTab && matchesQuery;
  });

  const countNew = submissions.filter((s) => s.ocrStatus != null).length;
  const countOld = submissions.filter((s) => s.ocrStatus == null).length;

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Registration ID', 'Name', 'Surname', 'Parish', 'Diocese', 'Mobile Number',
      'T-Shirt Size', 'Email', 'Registered By / Connected To', 'Status', 'Submitted At'
    ];

    const rows = filtered.map((item) => [
      `"${item.regId || item.registration_id || '100101'}"`,
      `"${item.name || ''}"`,
      `"${item.surname || ''}"`,
      `"${item.parish || ''}"`,
      `"${item.diocese || ''}"`,
      `"${item.phone || ''}"`,
      `"${item.tShirtSize || ''}"`,
      `"${item.email || ''}"`,
      `"${item.registeredBy || 'Primary / Self'}"`,
      `"${item.registrationStatus || 'PENDING'}"`,
      `"${item.submittedAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Campus_Meet_Registrations_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="step admin-container">
      <div className="admin-header">
        <h2>Admin Management Portal</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn-secondary" onClick={onBackToForm} style={{ fontSize: 8.5, padding: '4px 8px' }}>
            Form
          </button>
          <button type="button" className="btn-secondary" onClick={onLogout} style={{ fontSize: 8.5, padding: '4px 8px', color: 'var(--red-700)' }}>
            Logout 🔒
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`tab-btn tab-approved ${statusFilter === 'NEW_STUDENTS' ? 'active' : ''}`}
          onClick={() => setStatusFilter('NEW_STUDENTS')}
        >
          New Students ({countNew})
        </button>
        <button
          type="button"
          className={`tab-btn tab-pending ${statusFilter === 'OLD_STUDENTS' ? 'active' : ''}`}
          onClick={() => setStatusFilter('OLD_STUDENTS')}
        >
          Old Students ({countOld})
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          type="text"
          className="admin-search"
          placeholder="Search by Reg ID, name, parish, diocese, phone, registered by..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={exportCSV}
          style={{ whiteSpace: 'nowrap', flex: '0 0 auto', padding: '6px 10px' }}
        >
          📥 CSV
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              {statusFilter === 'OLD_STUDENTS' && <th>Reg ID</th>}
              <th>Name &amp; Phone</th>
              <th>Email</th>
              <th>Parish / Diocese</th>
              <th>Size</th>
              <th>Registered By</th>
              <th>Status</th>
              {statusFilter === 'OLD_STUDENTS' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={statusFilter === 'OLD_STUDENTS' ? "9" : "7"} style={{ textAlign: 'center', color: 'var(--ink-500)', padding: 24, fontSize: 12 }}>
                  No registrations found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const itemStatus = (item.registrationStatus || 'PENDING').toUpperCase();
                const itemRegId = item.regId || item.registration_id || '-';
                const registeredByText = item.registeredBy || 'Primary / Self';
                const isGroupChild = !!item.registeredBy && item.registeredBy !== 'Primary / Self';
                return (
                  <tr key={idx}>
                    <td style={{ whiteSpace: 'normal', fontWeight: 800, fontSize: 11, color: 'var(--ink-500)' }}>
                      {idx + 1}
                    </td>
                    {statusFilter === 'OLD_STUDENTS' && (
                      <td style={{ whiteSpace: 'normal' }}>
                        <code style={{ fontSize: 9, fontWeight: 'bold', color: 'var(--jy-crimson)', background: 'rgba(217, 4, 41, 0.06)', padding: '2px 4px', borderRadius: 4, display: 'inline-block', wordBreak: 'break-all', lineHeight: 1.3 }}>
                          {itemRegId}
                        </code>
                      </td>
                    )}
                    <td style={{ whiteSpace: 'normal' }}>
                      <strong style={{ fontSize: 11 }}>{item.name} {item.surname}</strong>
                      <div style={{ fontSize: 9, color: 'var(--ink-500)', marginTop: 2 }}>{item.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 9, color: 'var(--ink-600)' }}>{item.email || '-'}</span>
                    </td>
                    <td style={{ whiteSpace: 'normal' }}>
                      <div style={{ fontWeight: 600, fontSize: 10.5 }}>{item.parish}</div>
                      <div style={{ fontSize: 9, color: 'var(--ink-500)', marginTop: 1 }}>{item.diocese}</div>
                    </td>
                    <td><span className="badge-chip">{item.tShirtSize || 'M'}</span></td>
                    <td>
                      {isGroupChild ? (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#1d4ed8',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '8.5px',
                          fontWeight: 'bold'
                        }}>
                          🔗 {registeredByText}
                        </span>
                      ) : (
                        <span style={{ fontSize: '8.5px', color: 'var(--ink-500)', fontStyle: 'italic' }}>
                          👤 Primary / Self
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill pill-${itemStatus.toLowerCase()}`}>
                        {itemStatus}
                      </span>
                      {item.ocrStatus && (
                        <div style={{
                          fontSize: '8px',
                          marginTop: 3,
                          fontWeight: 'bold',
                          color: item.ocrStatus === 'APPROVED' ? '#16a34a' : '#d97706'
                        }}>
                          🤖 OCR: {item.ocrStatus}
                        </div>
                      )}
                    </td>
                    {statusFilter === 'OLD_STUDENTS' && (
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-approve"
                            disabled={itemStatus === 'APPROVED'}
                            onClick={() => onUpdateStatus(item.device_id || item.phone || item.regId, 'APPROVED')}
                          >
                            Approve ✓
                          </button>
                          <button
                            type="button"
                            className="btn-reject"
                            disabled={itemStatus === 'REJECTED'}
                            onClick={() => onUpdateStatus(item.device_id || item.phone || item.regId, 'REJECTED')}
                          >
                            Reject ✕
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
