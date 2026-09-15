import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const DEFECT_OPTIONS = [
  "1 - Neural Tube Defect",
  "2 - Downs Syndrome",
  "3 - Cleft Lip and Palate",
  "4 - Talipes (club foot)",
  "5 - Developmental Dysplasia of Hip",
  "6 - Congenital Cataract",
  "7 - Congenital Deafness",
  "8 - Congenital Heart Disease",
  "9 - Retinopathy of Prematurity (only at DH)",
  "47 - Congenital Ear Problems",
  "48 - Neck and Face Defects",
  "50 - Congenital Eye Problems"
];

const ReferralModal = ({ isOpen, onClose, onSave, editingReferral }) => {
  const [formData, setFormData] = useState({
    childName: '',
    sex: '',
    dob: '',
    birthCertificateNo: '',
    fatherName: '',
    fatherAadhaar: '',
    motherName: '',
    motherAadhaar: '',
    villageName: '',
    weight: '',
    height: '',
    instituteType: '',
    instituteName: '',
    className: '',
    awcWorkerNumber: '',
    mobile1: '',
    mobile2: '',
    mobile3: '',
    defects: [],
    hasOtherDefect: false,
    otherDefect: '',
    childPhoto: null,
    documents: []
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingReferral) {
      setFormData({
        childName: editingReferral.childName || '',
        sex: editingReferral.sex || '',
        dob: editingReferral.dob || '',
        birthCertificateNo: editingReferral.birthCertificateNo || '',
        fatherName: editingReferral.fatherName || '',
        fatherAadhaar: editingReferral.fatherAadhaar || '',
        motherName: editingReferral.motherName || '',
        motherAadhaar: editingReferral.motherAadhaar || '',
        villageName: editingReferral.villageName || '',
        weight: editingReferral.weight || '',
        height: editingReferral.height || '',
        instituteType: editingReferral.instituteType || '',
        instituteName: editingReferral.instituteName || '',
        className: editingReferral.className || '',
        awcWorkerNumber: editingReferral.awcWorkerNumber || '',
        mobile1: editingReferral.mobile1 || '',
        mobile2: editingReferral.mobile2 || '',
        mobile3: editingReferral.mobile3 || '',
        defects: Array.isArray(editingReferral.defects) ? editingReferral.defects : [],
        hasOtherDefect: Boolean(editingReferral.otherDefect),
        otherDefect: editingReferral.otherDefect || '',
        childPhoto: editingReferral.childPhoto || null,
        documents: Array.isArray(editingReferral.documents) ? editingReferral.documents : []
      });
    } else {
      setFormData({
        childName: '',
        sex: '',
        dob: '',
        birthCertificateNo: '',
        fatherName: '',
        fatherAadhaar: '',
        motherName: '',
        motherAadhaar: '',
        villageName: '',
        weight: '',
        height: '',
        instituteType: '',
        instituteName: '',
        className: '',
        awcWorkerNumber: '',
        mobile1: '',
        mobile2: '',
        mobile3: '',
        defects: [],
        hasOtherDefect: false,
        otherDefect: '',
        childPhoto: null,
        documents: []
      });
    }
  }, [editingReferral, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDefectToggle = (defect) => {
    setFormData((prev) => {
      const exists = prev.defects.includes(defect);
      return {
        ...prev,
        defects: exists ? prev.defects.filter((d) => d !== defect) : [...prev.defects, defect]
      };
    });
  };

  const handleFileUpload = async (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading('Uploading file(s)...');

    try {
      if (type === 'childPhoto') {
        const file = files[0];
        const data = new FormData();
        data.append('file', file);
        data.append('fileType', 'child_photo');

        const res = await api.post('/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success) {
          setFormData((prev) => ({ ...prev, childPhoto: res.data.data }));
          toast.success('Child photo uploaded successfully', { id: toastId });
        }
      } else if (type === 'documents') {
        const uploadedDocs = [];
        for (let i = 0; i < files.length; i++) {
          const data = new FormData();
          data.append('file', files[i]);
          data.append('fileType', 'document');

          const res = await api.post('/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            uploadedDocs.push(res.data.data);
          }
        }
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, ...uploadedDocs]
        }));
        toast.success(`${uploadedDocs.length} document(s) uploaded`, { id: toastId });
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(err.response?.data?.message || 'File upload failed', { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveDoc = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.childName || !formData.sex || !formData.dob) {
      toast.error('Please enter Child Name, Sex, and Date of Birth');
      return;
    }

    if (!formData.instituteType || !formData.instituteName) {
      toast.error('Please select Institute Type and enter Institute Name');
      return;
    }

    if (formData.defects.length === 0 && (!formData.hasOtherDefect || !formData.otherDefect)) {
      toast.error('Please select at least one Defect / Health Condition');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        otherDefect: formData.hasOtherDefect ? formData.otherDefect : ''
      });
      onClose();
    } catch (err) {
      console.error('Save referral error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingReferral ? 'Edit RBSK Referral' : 'New RBSK Referral'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* CHILD DETAILS */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', marginBottom: '12px' }}>
              👤 1. Child Details
            </h4>
            <div className="form-grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Child Name *</label>
                <input
                  type="text"
                  name="childName"
                  className="form-control"
                  placeholder="Enter full name"
                  value={formData.childName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sex *</label>
                <select name="sex" className="form-control" value={formData.sex} onChange={handleInputChange} required>
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Birth Certificate No.</label>
                <input
                  type="text"
                  name="birthCertificateNo"
                  className="form-control"
                  placeholder="Enter certificate number"
                  value={formData.birthCertificateNo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  className="form-control"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Father Aadhaar No. (12 digits)</label>
                <input
                  type="text"
                  name="fatherAadhaar"
                  maxLength={12}
                  className="form-control"
                  placeholder="12 digit Aadhaar"
                  value={formData.fatherAadhaar}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Mother Name</label>
                <input
                  type="text"
                  name="motherName"
                  className="form-control"
                  placeholder="Enter mother's name"
                  value={formData.motherName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Mother Aadhaar No. (12 digits)</label>
                <input
                  type="text"
                  name="motherAadhaar"
                  maxLength={12}
                  className="form-control"
                  placeholder="12 digit Aadhaar"
                  value={formData.motherAadhaar}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Village Name</label>
                <input
                  type="text"
                  name="villageName"
                  className="form-control"
                  placeholder="Enter village"
                  value={formData.villageName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    className="form-control"
                    placeholder="e.g. 14.5"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    className="form-control"
                    placeholder="e.g. 95"
                    value={formData.height}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* HEALTH CONDITION / DEFECT */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', marginBottom: '12px' }}>
              🏥 2. Defect / Health Problem *
            </h4>
            <div className="form-group">
              <div className="defect-grid-select">
                {DEFECT_OPTIONS.map((defect, idx) => (
                  <label key={idx} className="defect-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.defects.includes(defect)}
                      onChange={() => handleDefectToggle(defect)}
                    />
                    <span>{defect}</span>
                  </label>
                ))}

                <label className="defect-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.hasOtherDefect}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasOtherDefect: e.target.checked }))}
                  />
                  <span>Other Health Condition</span>
                </label>
              </div>

              {formData.hasOtherDefect && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    name="otherDefect"
                    className="form-control"
                    placeholder="Specify other defect or medical condition..."
                    value={formData.otherDefect}
                    onChange={handleInputChange}
                    required={formData.hasOtherDefect}
                  />
                </div>
              )}
            </div>

            {/* INSTITUTE DETAILS */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', margin: '20px 0 12px 0' }}>
              🏫 3. Institute Details
            </h4>
            <div className="form-grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Institute Type *</label>
                <select
                  name="instituteType"
                  className="form-control"
                  value={formData.instituteType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="School">School</option>
                  <option value="AWC">AWC (Anganwadi)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Institute Name *</label>
                <input
                  type="text"
                  name="instituteName"
                  className="form-control"
                  placeholder="Enter school or anganwadi name"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {formData.instituteType === 'School' && (
                <div className="form-group">
                  <label>Class</label>
                  <select name="className" className="form-control" value={formData.className} onChange={handleInputChange}>
                    <option value="">Select Class</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Class {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.instituteType === 'AWC' && (
                <div className="form-group">
                  <label>AWC Worker Number</label>
                  <input
                    type="text"
                    name="awcWorkerNumber"
                    className="form-control"
                    placeholder="Enter worker number / code"
                    value={formData.awcWorkerNumber}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {/* CONTACT NUMBERS */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', margin: '20px 0 12px 0' }}>
              📞 4. Contact Numbers
            </h4>
            <div className="form-grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Mobile 1 (Parent / Guardian)</label>
                <input
                  type="tel"
                  name="mobile1"
                  maxLength={10}
                  className="form-control"
                  placeholder="10 digit mobile"
                  value={formData.mobile1}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Mobile 2 (Alternate)</label>
                <input
                  type="tel"
                  name="mobile2"
                  maxLength={10}
                  className="form-control"
                  placeholder="10 digit mobile"
                  value={formData.mobile2}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group form-full">
                <label>
                  {formData.instituteType === 'School'
                    ? 'School Principal / Teacher Mobile'
                    : formData.instituteType === 'AWC'
                    ? 'AWC Worker Mobile Number'
                    : 'Mobile 3'}
                </label>
                <input
                  type="tel"
                  name="mobile3"
                  maxLength={10}
                  className="form-control"
                  placeholder="10 digit mobile"
                  value={formData.mobile3}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* FILE ATTACHMENTS */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', margin: '20px 0 12px 0' }}>
              📎 5. Child Photo & Referral Documents
            </h4>
            <div className="form-grid-2">
              <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} /> Child Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'childPhoto')}
                  disabled={uploading}
                  style={{ marginTop: '8px', fontSize: '0.85rem' }}
                />
                {formData.childPhoto && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={formData.childPhoto.url}
                      alt="Child preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, childPhoto: null }))}
                      className="btn btn-light btn-sm"
                      style={{ color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Medical Documents (PDF / Images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, 'documents')}
                  disabled={uploading}
                  style={{ marginTop: '8px', fontSize: '0.85rem' }}
                />
                {formData.documents.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {formData.documents.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          📄 {doc.originalFilename || `Doc ${i + 1}`}
                        </span>
                        <button type="button" onClick={() => handleRemoveDoc(i)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-light">
              Cancel
            </button>
            <button type="submit" disabled={submitting || uploading} className="btn btn-primary">
              {submitting ? 'Saving...' : editingReferral ? 'Update Referral' : 'Save Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferralModal;
