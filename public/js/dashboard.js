// ============================================================
// RBSK REFERRAL MANAGEMENT - DASHBOARD CLIENT-SIDE CONTROLLER
// ============================================================

let currentReferralData = null;
let currentDeleteId = null;

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Institute Form Toggling
function toggleInstituteFields(type) {
  const classGroup = document.getElementById('classFieldGroup');
  const awcGroup = document.getElementById('awcFieldGroup');
  if (type === 'School') {
    if (classGroup) classGroup.style.display = 'block';
    if (awcGroup) awcGroup.style.display = 'none';
  } else {
    if (classGroup) classGroup.style.display = 'none';
    if (awcGroup) awcGroup.style.display = 'block';
  }
}

// Other Defect Toggling
function toggleOtherDefect(isChecked) {
  const group = document.getElementById('otherDefectGroup');
  if (group) {
    group.style.display = isChecked ? 'block' : 'none';
  }
}

// Open New Referral Modal (Add Mode)
function openNewReferralModal() {
  const form = document.getElementById('newReferralForm');
  if (form) form.reset();

  document.getElementById('editReferralId').value = '';
  document.getElementById('referralModalTitle').innerText = 'New Child Referral';
  document.getElementById('referralModalDesc').innerText = 'Register a child diagnosed with health conditions under RBSK';
  document.getElementById('btnSubmitReferralText').innerText = 'Save Child Referral';

  const alertEl = document.getElementById('referralFormAlert');
  if (alertEl) alertEl.style.display = 'none';

  toggleInstituteFields('School');
  toggleOtherDefect(false);

  // Uncheck all defect boxes
  document.querySelectorAll('#newReferralForm input[name="defects"]').forEach(cb => cb.checked = false);

  openModal('newReferralModal');
}

// Open Edit Referral Modal (Edit Mode)
async function editReferral(id) {
  openNewReferralModal();

  document.getElementById('referralModalTitle').innerText = 'Edit Child Referral';
  document.getElementById('referralModalDesc').innerText = 'Update child information and medical referral record';
  document.getElementById('btnSubmitReferralText').innerText = 'Update Child Referral';
  document.getElementById('editReferralId').value = id;

  try {
    const res = await fetch(`/api/referrals/${id}`);
    const result = await res.json();

    if (!res.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Could not fetch referral details');
    }

    const item = result.data;
    const form = document.getElementById('newReferralForm');

    form.childName.value = item.childName || '';
    form.sex.value = item.sex || '';
    form.dob.value = item.dob || '';
    form.birthCertificateNo.value = item.birthCertificateNo || '';
    form.weight.value = item.weight || '';
    form.height.value = item.height || '';
    form.villageName.value = item.villageName || '';

    form.fatherName.value = item.fatherName || '';
    form.fatherAadhaar.value = item.fatherAadhaar || '';
    form.motherName.value = item.motherName || '';
    form.motherAadhaar.value = item.motherAadhaar || '';

    form.instituteType.value = item.instituteType || 'School';
    toggleInstituteFields(item.instituteType || 'School');
    form.instituteName.value = item.instituteName || '';
    if (form.className) form.className.value = item.className || '';
    if (form.awcWorkerNumber) form.awcWorkerNumber.value = item.awcWorkerNumber || '';

    form.mobile1.value = item.mobile1 || '';
    form.mobile2.value = item.mobile2 || '';
    form.mobile3.value = item.mobile3 || '';

    // Check defect checkboxes
    const defects = item.defects || [];
    document.querySelectorAll('#newReferralForm input[name="defects"]').forEach(cb => {
      cb.checked = defects.includes(cb.value);
    });

    if (item.otherDefect) {
      const otherCb = document.getElementById('defectOtherCheckbox');
      if (otherCb) otherCb.checked = true;
      toggleOtherDefect(true);
      form.otherDefect.value = item.otherDefect;
    }
  } catch (err) {
    alert(err.message || 'Failed to load referral details for editing.');
  }
}

// Handle Add / Edit Referral Form Submission
async function handleReferralSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btnSubmitReferral');
  const alertEl = document.getElementById('referralFormAlert');
  const editId = document.getElementById('editReferralId').value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Saving referral...</span>';

  try {
    const formData = new FormData(form);
    const url = editId ? `/api/referrals/${editId}` : '/api/referrals';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      body: formData
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save referral.');
    }

    alertEl.className = 'alert-box alert-success';
    alertEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Child referral ${editId ? 'updated' : 'added'} successfully!</span>`;
    alertEl.style.display = 'flex';

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    alertEl.className = 'alert-box alert-error';
    alertEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${err.message}</span>`;
    alertEl.style.display = 'flex';
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>${editId ? 'Update Child Referral' : 'Save Child Referral'}</span>`;
  }
}

// Open Status Update Modal
function openStatusModal(id, childName, currentStatus) {
  const idInput = document.getElementById('statusReferralId');
  const titleEl = document.getElementById('statusModalChildName');
  const statusSelect = document.getElementById('statusSelect');
  const statusDate = document.getElementById('statusDate');
  const alertEl = document.getElementById('statusFormAlert');

  if (idInput) idInput.value = id;
  if (titleEl) titleEl.innerText = `Child: ${childName}`;
  if (statusSelect) statusSelect.value = currentStatus || 'Pending';
  if (statusDate) statusDate.value = new Date().toISOString().split('T')[0];
  if (alertEl) alertEl.style.display = 'none';

  handleStatusChange(currentStatus || 'Pending');
  openModal('statusModal');
}

// Status Change Visibility
function handleStatusChange(status) {
  const referredGroup = document.getElementById('referredFieldsGroup');
  if (status === 'Referred' || status === 'Treatment Started') {
    if (referredGroup) referredGroup.style.display = 'block';
  } else {
    if (referredGroup) referredGroup.style.display = 'none';
  }
}

function handleReferTypeChange(type) {
  const privateGroup = document.getElementById('privateHospitalGroup');
  if (privateGroup) {
    privateGroup.style.display = type === 'Private Hospital' ? 'block' : 'none';
  }
}

function handlePrivateHospitalChange(val) {
  const otherGroup = document.getElementById('otherHospitalNameGroup');
  if (otherGroup) {
    otherGroup.style.display = val === 'Other' ? 'block' : 'none';
  }
}

// Submit Status Update
async function handleStatusSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btnUpdateStatusSubmit');
  const alertEl = document.getElementById('statusFormAlert');
  const referralId = form.referralId.value;

  const payload = {
    status: form.status.value,
    statusDate: form.statusDate.value,
    referType: form.referType ? form.referType.value : '',
    privateHospital: form.privateHospital ? form.privateHospital.value : '',
    otherHospitalName: form.otherHospitalName ? form.otherHospitalName.value : '',
    estimatedExpenditure: form.estimatedExpenditure ? form.estimatedExpenditure.value : ''
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Updating...</span>';

  try {
    const res = await fetch(`/api/referrals/${referralId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update status.');
    }

    alertEl.className = 'alert-box alert-success';
    alertEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Status updated successfully!</span>';
    alertEl.style.display = 'flex';

    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    alertEl.className = 'alert-box alert-error';
    alertEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${err.message}</span>`;
    alertEl.style.display = 'flex';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-save"></i> <span>Update Status</span>';
  }
}

// View Referral Details Modal
async function viewReferralDetails(id) {
  openModal('viewDetailsModal');
  const container = document.getElementById('viewDetailsContent');
  container.innerHTML = `
    <div style="text-align: center; padding: 2.5rem;">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: #0284c7;"></i>
      <p style="margin-top: 0.75rem; color: #64748b;">Loading referral profile...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/referrals/${id}`);
    const result = await res.json();

    if (!res.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Could not fetch details.');
    }

    const item = result.data;
    currentReferralData = item;

    document.getElementById('viewModalTitle').innerText = item.childName;
    document.getElementById('viewModalSubtitle').innerText = `Referral ID: ${item._id}`;

    const defectsList = item.defects && item.defects.length > 0 
      ? item.defects.map(d => `<span class="defect-badge">${d}</span>`).join(' ') 
      : (item.defect ? `<span class="defect-badge">${item.defect}</span>` : '<span class="text-muted">None specified</span>');

    const photoHtml = item.childPhoto && item.childPhoto.url
      ? `<img src="${item.childPhoto.url}" alt="${item.childName}" />`
      : `<i class="fa-solid ${item.sex === 'Female' ? 'fa-child-dress' : 'fa-child'}"></i>`;

    // Status Timeline HTML
    const history = item.statusHistory && item.statusHistory.length > 0
      ? item.statusHistory
      : [{ status: item.status || 'Pending', date: item.registeredDate || item.createdAt?.split('T')[0] || '' }];

    const timelineHtml = history.map((h, idx) => `
      <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.75rem;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${idx === history.length - 1 ? '#0284c7' : '#10b981'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
          ${idx === history.length - 1 ? '●' : '✓'}
        </div>
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: #0f172a;">${h.status}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${h.date || '—'}</div>
        </div>
      </div>
    `).join('');

    // Documents HTML
    const docsHtml = item.documents && item.documents.length > 0
      ? item.documents.map(d => `
        <a href="${d.url}" target="_blank" class="btn-card-action" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem; margin-right: 0.5rem; margin-top: 0.35rem;">
          <i class="fa-solid fa-file-pdf"></i> ${d.originalFilename || 'Document'}
        </a>
      `).join('')
      : '<span style="font-size: 0.85rem; color: #64748b;">No documents attached</span>';

    container.innerHTML = `
      <div class="detail-profile-header">
        <div class="detail-photo-frame">
          ${photoHtml}
        </div>
        <div>
          <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 700;">${item.childName}</h2>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.35rem; flex-wrap: wrap;">
            <span class="meta-tag"><i class="fa-solid fa-venus-mars"></i> ${item.sex}</span>
            <span class="meta-tag"><i class="fa-solid fa-cake-candles"></i> DOB: ${item.dob || 'N/A'}</span>
            <span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span>
          </div>
        </div>
      </div>

      <!-- Section: Medical Conditions -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-stethoscope"></i> Detected Health Conditions / Defects</h4>
        <div class="defect-tags mb-2">${defectsList}</div>
        ${item.otherDefect ? `<p style="font-size: 0.85rem; color: #475569; margin-top: 0.35rem;"><strong>Other Details:</strong> ${item.otherDefect}</p>` : ''}
      </div>

      <!-- Section: Child & Family Details -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-id-card"></i> Child & Family Info</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item-label">Father's Name</span>
            <span class="detail-item-value">${item.fatherName || '—'} ${item.fatherAadhaar ? `(Aadhaar: ${item.fatherAadhaar})` : ''}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Mother's Name</span>
            <span class="detail-item-value">${item.motherName || '—'} ${item.motherAadhaar ? `(Aadhaar: ${item.motherAadhaar})` : ''}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Village / Ward</span>
            <span class="detail-item-value">${item.villageName || '—'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Birth Certificate No.</span>
            <span class="detail-item-value">${item.birthCertificateNo || '—'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Height / Weight</span>
            <span class="detail-item-value">${item.height ? item.height + ' cm' : '—'} / ${item.weight ? item.weight + ' kg' : '—'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Primary Mobile</span>
            <span class="detail-item-value">${item.mobile1 ? `<a href="tel:${item.mobile1}">${item.mobile1}</a>` : '—'}</span>
          </div>
        </div>
      </div>

      <!-- Section: Institute Info -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-school"></i> Institute Details</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item-label">Type & Name</span>
            <span class="detail-item-value">${item.instituteName} (${item.instituteType})</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">${item.instituteType === 'School' ? 'Class / Grade' : 'AWC Worker Contact'}</span>
            <span class="detail-item-value">${item.className || item.awcWorkerNumber || '—'}</span>
          </div>
        </div>
      </div>

      <!-- Section: Treatment & Hospital Details -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-hospital-user"></i> Referral & Hospital Info</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item-label">Hospital Name</span>
            <span class="detail-item-value">${item.hospitalName || item.privateHospital || item.otherHospitalName || 'Not Assigned Yet'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Estimated Expenditure</span>
            <span class="detail-item-value">${item.estimatedExpenditure ? '₹ ' + item.estimatedExpenditure : '—'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Registration Date</span>
            <span class="detail-item-value">${item.registeredDate || item.createdAt?.split('T')[0] || '—'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item-label">Last Status Date</span>
            <span class="detail-item-value">${item.statusDate || item.updatedAt?.split('T')[0] || '—'}</span>
          </div>
        </div>
      </div>

      <!-- Section: Attached Documents -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-paperclip"></i> Medical Documents</h4>
        <div>${docsHtml}</div>
      </div>

      <!-- Section: Status Timeline -->
      <div class="form-section">
        <h4 class="section-title"><i class="fa-solid fa-timeline"></i> Status Timeline</h4>
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${timelineHtml}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="alert-box alert-error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>${err.message || 'Error loading referral data.'}</span>
      </div>
    `;
  }
}

function openStatusFromView() {
  if (currentReferralData) {
    closeModal('viewDetailsModal');
    openStatusModal(currentReferralData._id, currentReferralData.childName, currentReferralData.status);
  }
}

function openEditFromView() {
  if (currentReferralData) {
    closeModal('viewDetailsModal');
    editReferral(currentReferralData._id);
  }
}

// Delete Referral Modal Handlers
function openDeleteModal(id, name) {
  currentDeleteId = id;
  document.getElementById('deleteReferralId').value = id;
  document.getElementById('deleteChildName').innerText = name || 'this child';
  const alertEl = document.getElementById('deleteAlert');
  if (alertEl) alertEl.style.display = 'none';
  openModal('deleteModal');
}

async function confirmDeleteReferral() {
  const id = currentDeleteId || document.getElementById('deleteReferralId').value;
  if (!id) return;

  const btn = document.getElementById('btnConfirmDelete');
  const alertEl = document.getElementById('deleteAlert');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Deleting...</span>';

  try {
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete referral.');
    }

    closeModal('deleteModal');
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.remove();
      liveFilterRecords();
    } else {
      window.location.reload();
    }
  } catch (err) {
    if (alertEl) {
      alertEl.innerText = err.message || 'Error deleting referral.';
      alertEl.style.display = 'block';
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> <span>Yes, Delete</span>';
  }
}

// Real-time Live Filtering & Search across all visible referral cards
function liveFilterRecords() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const instituteFilter = document.getElementById('instituteFilter');
  const clearBtn = document.getElementById('btnClearSearch');

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const status = statusFilter ? statusFilter.value : 'all';
  const institute = instituteFilter ? instituteFilter.value : 'all';

  if (clearBtn) {
    clearBtn.style.display = query.length > 0 ? 'block' : 'none';
  }

  const cards = document.querySelectorAll('.referral-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardSearch = card.getAttribute('data-search') || '';
    const cardStatus = card.getAttribute('data-status') || '';
    const cardInstitute = card.getAttribute('data-institute') || '';

    const matchesSearch = !query || cardSearch.includes(query);
    const matchesStatus = status === 'all' || cardStatus === status;
    const matchesInstitute = institute === 'all' || cardInstitute === institute;

    if (matchesSearch && matchesStatus && matchesInstitute) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const countText = document.getElementById('recordsCountText');
  if (countText) {
    countText.innerHTML = `Showing <strong>${visibleCount}</strong> referral${visibleCount === 1 ? '' : 's'}`;
  }

  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    liveFilterRecords();
  }
}

function filterByStat(statusValue) {
  const statusSelect = document.getElementById('statusFilter');
  if (statusSelect) {
    statusSelect.value = statusValue;
    liveFilterRecords();
  }

  // Update visual active card
  document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('active-stat'));
  const activeCard = document.getElementById(`statCard-${statusValue.replace(/\s+/g, '')}`);
  if (activeCard) activeCard.classList.add('active-stat');
}

function resetAllFilters() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const instituteFilter = document.getElementById('instituteFilter');

  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (instituteFilter) instituteFilter.value = 'all';

  liveFilterRecords();
  document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('active-stat'));
  const allCard = document.getElementById('statCard-all');
  if (allCard) allCard.classList.add('active-stat');
}
