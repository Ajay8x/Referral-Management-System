import React from 'react';
import { Eye, Edit3, RefreshCw, Trash2, Building, MapPin, HeartPulse } from 'lucide-react';

const statusBadgeClass = (status) => {
  switch (status) {
    case 'Pending': return 'badge-pending';
    case 'Referred': return 'badge-referred';
    case 'Treatment Started': return 'badge-started';
    case 'Completed': return 'badge-completed';
    default: return 'badge-pending';
  }
};

const statusCardClass = (status) => {
  switch (status) {
    case 'Pending': return 'status-pending';
    case 'Referred': return 'status-referred';
    case 'Treatment Started': return 'status-started';
    case 'Completed': return 'status-completed';
    default: return 'status-pending';
  }
};

const ReferralCard = ({ referral, onView, onEdit, onStatus, onDelete }) => {
  const defects = Array.isArray(referral.defects) ? referral.defects : [];
  if (referral.otherDefect && !defects.includes(referral.otherDefect)) {
    defects.push(referral.otherDefect);
  }

  const formatDate = (d) => {
    if (!d) return '—';
    const parts = String(d).split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  };

  return (
    <article className={`referral-card ${statusCardClass(referral.status)}`}>
      <div>
        <div className="card-top">
          <div>
            <h4 className="child-title">{referral.childName}</h4>
            <div className="child-submeta">
              {referral.sex} {referral.dob && `• DOB: ${formatDate(referral.dob)}`}
            </div>
          </div>
          <span className={`status-badge ${statusBadgeClass(referral.status)}`}>
            {referral.status}
          </span>
        </div>

        <div className="card-details-list">
          <div className="detail-item">
            <Building size={15} color="#64748b" />
            <span>
              <strong>{referral.instituteType}:</strong> {referral.instituteName}
              {referral.className && ` (Class ${referral.className})`}
            </span>
          </div>

          {referral.villageName && (
            <div className="detail-item">
              <MapPin size={15} color="#64748b" />
              <span><strong>Village:</strong> {referral.villageName}</span>
            </div>
          )}

          <div className="detail-item" style={{ alignItems: 'flex-start' }}>
            <HeartPulse size={15} color="#ef4444" style={{ marginTop: '3px', flexShrink: 0 }} />
            <div>
              <div style={{ flexWrap: 'wrap', display: 'flex', gap: '4px' }}>
                {defects.length > 0 ? (
                  defects.map((def, idx) => (
                    <span key={idx} className="defect-tag-pill">
                      {def}
                    </span>
                  ))
                ) : (
                  <span>{referral.defect || '—'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions-row">
        <button onClick={() => onView(referral)} className="btn btn-light btn-sm" title="View Dossier">
          <Eye size={14} />
          <span>View</span>
        </button>
        <button onClick={() => onEdit(referral)} className="btn btn-light btn-sm" title="Edit Referral">
          <Edit3 size={14} />
          <span>Edit</span>
        </button>
        <button onClick={() => onStatus(referral)} className="btn btn-light btn-sm" title="Update Status">
          <RefreshCw size={14} />
          <span>Status</span>
        </button>
        <button onClick={() => onDelete(referral)} className="btn btn-light btn-sm" style={{ color: '#ef4444' }} title="Delete Record">
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
};

export default ReferralCard;
