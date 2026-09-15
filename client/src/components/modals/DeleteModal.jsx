import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, referral, onDeleteConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !referral) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteConfirm(referral._id);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Referral Record</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <AlertTriangle size={28} />
          </div>

          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Are you sure?</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            You are about to permanently delete the referral record for:
          </p>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
            {referral.childName} ({referral.instituteName})
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-light">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-danger">
            <Trash2 size={15} />
            <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
