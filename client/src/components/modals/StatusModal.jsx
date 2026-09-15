import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusModal = ({ isOpen, onClose, referral, onUpdateStatus }) => {
  const [status, setStatus] = useState('Pending');
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]);
  const [referType, setReferType] = useState('');
  const [privateHospital, setPrivateHospital] = useState('');
  const [otherHospitalName, setOtherHospitalName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [estimatedExpenditure, setEstimatedExpenditure] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (referral) {
      setStatus(referral.status || 'Pending');
      setStatusDate(referral.statusDate || new Date().toISOString().split('T')[0]);
      setReferType(referral.referType || '');
      setPrivateHospital(referral.privateHospital || '');
      setOtherHospitalName(referral.otherHospitalName || '');
      setHospitalName(referral.hospitalName || '');
      setEstimatedExpenditure(referral.estimatedExpenditure || '');
    }
  }, [referral, isOpen]);

  if (!isOpen || !referral) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === 'Referred' && !referType) {
      toast.error('Please select Refer Type');
      return;
    }

    if (status === 'Referred' && referType === 'Private Hospital' && !privateHospital) {
      toast.error('Please select Private Hospital name');
      return;
    }

    if (status === 'Referred' && referType === 'Private Hospital' && privateHospital === 'Other' && !otherHospitalName) {
      toast.error('Please enter Other Hospital Name');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateStatus(referral._id, {
        status,
        statusDate,
        referType,
        privateHospital,
        otherHospitalName,
        hospitalName: status === 'Referred' ? (referType === 'DEIC' ? 'DEIC' : (privateHospital === 'Other' ? otherHospitalName : privateHospital)) : hospitalName,
        estimatedExpenditure
      });
      onClose();
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Update Referral Status</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Child: {referral.childName}</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Status Selector */}
            <div className="form-group">
              <label>Status *</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="Pending">⏳ Pending</option>
                <option value="Referred">📤 Referred</option>
                <option value="Treatment Started">🏥 Treatment Started</option>
                <option value="Completed">✓ Completed</option>
              </select>
            </div>

            {/* Status Date */}
            <div className="form-group">
              <label>Status Date *</label>
              <input
                type="date"
                className="form-control"
                value={statusDate}
                onChange={(e) => setStatusDate(e.target.value)}
                required
              />
            </div>

            {/* Conditional fields for Referred */}
            {status === 'Referred' && (
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Refer Type *</label>
                  <select className="form-control" value={referType} onChange={(e) => setReferType(e.target.value)} required>
                    <option value="">Select Refer Type</option>
                    <option value="DEIC">Refer to DEIC</option>
                    <option value="Private Hospital">Refer to Private Hospital</option>
                  </select>
                </div>

                {referType === 'Private Hospital' && (
                  <>
                    <div className="form-group">
                      <label>Private Hospital *</label>
                      <select className="form-control" value={privateHospital} onChange={(e) => setPrivateHospital(e.target.value)} required>
                        <option value="">Select Hospital</option>
                        <option value="Arvindo Hospital">Arvindo Hospital</option>
                        <option value="Bhandari Hospital">Bhandari Hospital</option>
                        <option value="Medanta Hospital">Medanta Hospital</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {privateHospital === 'Other' && (
                      <div className="form-group">
                        <label>Other Hospital Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter hospital name"
                          value={otherHospitalName}
                          onChange={(e) => setOtherHospitalName(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Conditional fields for Treatment Started */}
            {status === 'Treatment Started' && (
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Hospital Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter hospital / medical college name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Treatment Expenditure (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control"
                    placeholder="e.g. 50000"
                    value={estimatedExpenditure}
                    onChange={(e) => setEstimatedExpenditure(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-light">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <RefreshCw size={15} />
              <span>{submitting ? 'Updating...' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusModal;
