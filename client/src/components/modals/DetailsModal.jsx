import React from 'react';
import { X, Edit3, Download, ExternalLink, FileText, Check, Calendar, Phone, MapPin, Building, User, HeartPulse, Hospital, IndianRupee } from 'lucide-react';

const DetailsModal = ({ isOpen, onClose, referral, onEdit, onStatus }) => {
  if (!isOpen || !referral) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    const parts = String(d).split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  };

  const defects = Array.isArray(referral.defects) ? referral.defects : [];
  if (referral.otherDefect && !defects.includes(referral.otherDefect)) {
    defects.push(referral.otherDefect);
  }

  const history = Array.isArray(referral.statusHistory) && referral.statusHistory.length > 0
    ? referral.statusHistory
    : [{ status: referral.status || 'Pending', date: referral.registeredDate || referral.createdAt || '—' }];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Referral Dossier</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {referral.childName} • {referral.instituteName}
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* 1. CHILD DETAILS */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <User size={16} /> Child Profile
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Child Name</span><strong>{referral.childName}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Sex</span><strong>{referral.sex}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Date of Birth</span><strong>{formatDate(referral.dob)}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Birth Cert No.</span><strong>{referral.birthCertificateNo || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Village</span><strong>{referral.villageName || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Weight</span><strong>{referral.weight ? `${referral.weight} kg` : '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Height</span><strong>{referral.height ? `${referral.height} cm` : '—'}</strong></div>
            </div>
          </div>

          {/* 2. FAMILY DETAILS */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              👨‍👩‍👦 Family Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Father Name</span><strong>{referral.fatherName || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Father Aadhaar</span><strong>{referral.fatherAadhaar || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mother Name</span><strong>{referral.motherName || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mother Aadhaar</span><strong>{referral.motherAadhaar || '—'}</strong></div>
            </div>
          </div>

          {/* 3. HEALTH & DEFECT */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <HeartPulse size={16} /> Health Problem / Condition
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {defects.length > 0 ? (
                defects.map((d, i) => (
                  <span key={i} className="defect-tag-pill" style={{ background: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' }}>
                    {d}
                  </span>
                ))
              ) : (
                <span>{referral.defect || '—'}</span>
              )}
            </div>
          </div>

          {/* 4. INSTITUTE & CONTACTS */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Building size={16} /> Institute & Contacts
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Institute Type</span><strong>{referral.instituteType}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Institute Name</span><strong>{referral.instituteName}</strong></div>
              {referral.className && <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Class</span><strong>Class {referral.className}</strong></div>}
              {referral.awcWorkerNumber && <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>AWC Worker No.</span><strong>{referral.awcWorkerNumber}</strong></div>}
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mobile 1</span><strong>{referral.mobile1 || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mobile 2</span><strong>{referral.mobile2 || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mobile 3</span><strong>{referral.mobile3 || '—'}</strong></div>
            </div>
          </div>

          {/* 5. PHOTOS & DOCUMENTS */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              📁 Attachments
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', marginBottom: '6px' }}>Child Photo</span>
                {referral.childPhoto ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={referral.childPhoto.url}
                      alt="Child"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <a href={referral.childPhoto.url} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm">
                      <ExternalLink size={13} /> View
                    </a>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No photo uploaded</span>
                )}
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', marginBottom: '6px' }}>Medical Documents</span>
                {referral.documents && referral.documents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {referral.documents.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                        <span>📄 {doc.originalFilename || `Doc ${idx + 1}`}</span>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm" style={{ padding: '2px 8px' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No documents uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* 6. STATUS HISTORY & TREATMENT */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              📋 Referral Timeline & Hospital Followup
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Current Status</span><strong>{referral.status}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Refer Type</span><strong>{referral.referType || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Hospital</span><strong>{referral.hospitalName || referral.privateHospital || '—'}</strong></div>
              <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Estimated Expenditure</span><strong>{referral.estimatedExpenditure ? `₹ ${referral.estimatedExpenditure}` : '—'}</strong></div>
            </div>

            <div className="status-timeline">
              {history.map((step, idx) => (
                <div key={idx} className="timeline-step">
                  <div className="dot"><Check size={11} /></div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{step.status}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{formatDate(step.date)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-light">
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStatus(referral);
            }}
            className="btn btn-light"
          >
            Update Status
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(referral);
            }}
            className="btn btn-primary"
          >
            <Edit3 size={15} />
            <span>Edit Referral</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
