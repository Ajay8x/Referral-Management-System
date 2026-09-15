// ============================================================
// RBSK REFERRAL MANAGEMENT - DASHBOARD.JS (NODE.JS + MONGODB)
// ============================================================

const API_BASE = window.location.origin.includes(':5000') || window.location.origin.includes(':3000')
    ? '/api'
    : 'http://localhost:5000/api';

// GLOBALS
let currentUser = null;
let referrals = [];
let editingReferralId = null;
let statusReferralId = null;
let deleteReferralId = null;
let detailsReferralId = null;

// DEFECT OPTIONS
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

// HELPERS
function $(id) {
    return document.getElementById(id);
}

function val(id) {
    const element = $(id);
    if (!element) return "";
    return String(element.value || "").trim();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function today() {
    return new Date().toISOString().split('T')[0];
}

function cleanMobile(number) {
    if (!number) return "";
    return String(number).replace(/\D/g, "").slice(-10);
}

function formatDate(date) {
    if (!date) return "—";
    const str = String(date);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const parts = str.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
}

function statusLabel(status) {
    const map = {
        "Pending": "⏳ Pending",
        "Referred": "↗ Referred",
        "Treatment Started": "✚ Treatment Started",
        "Completed": "✓ Completed"
    };
    return map[status] || status || "Pending";
}

function statusClass(status) {
    return String(status || "pending").toLowerCase().replace(/\s+/g, "-");
}

function getToken() {
    return localStorage.getItem("rbsk_token");
}

function authHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// MODAL HELPERS
function showModal(id) {
    const element = $(id);
    if (!element) return;
    element.classList.add("show", "active");
    element.style.display = "flex";
    element.setAttribute("aria-hidden", "false");
}

function hideModal(id) {
    const element = $(id);
    if (!element) return;
    element.classList.remove("show", "active");
    element.style.display = "none";
    element.setAttribute("aria-hidden", "true");
}

function findRecord(id) {
    return referrals.find(record => (record._id === id || record.id === id));
}

// DEFECTS RENDER
function renderDefects(selected = []) {
    const box = $("defectList");
    if (!box) return;
    box.innerHTML = "";

    DEFECT_OPTIONS.forEach((defect, index) => {
        const label = document.createElement("label");
        label.className = "defect-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `defect_${index}`;
        checkbox.name = "defects";
        checkbox.value = defect;
        checkbox.checked = selected.includes(defect);

        const span = document.createElement("span");
        span.textContent = defect;

        label.appendChild(checkbox);
        label.appendChild(span);
        box.appendChild(label);
    });

    const otherLabel = document.createElement("label");
    otherLabel.className = "defect-item";

    const otherCheckbox = document.createElement("input");
    otherCheckbox.type = "checkbox";
    otherCheckbox.id = "otherDefectCheckbox";
    otherCheckbox.name = "defects";
    otherCheckbox.value = "Other Health Condition";

    const otherSpan = document.createElement("span");
    otherSpan.textContent = "Other Health Condition";

    otherLabel.appendChild(otherCheckbox);
    otherLabel.appendChild(otherSpan);
    box.appendChild(otherLabel);
}

function getSelectedDefects() {
    return [
        ...document.querySelectorAll('#defectList input[type="checkbox"]:checked')
    ].map(checkbox => checkbox.value).filter(val => val !== "Other Health Condition");
}

function updateOtherDefect() {
    const checkbox = $("otherDefectCheckbox");
    const box = $("otherDefectBox");
    const input = $("otherDefect");
    const checked = !!checkbox?.checked;

    if (box) {
        box.classList.toggle("hidden", !checked);
        box.style.display = checked ? "" : "none";
    }
    if (input) {
        input.required = checked;
        if (!checked) input.value = "";
    }
}

function setDefects(record) {
    let defects = [];
    if (Array.isArray(record.defects)) {
        defects = [...record.defects];
    } else if (record.defect) {
        defects = String(record.defect).split(",").map(x => x.trim()).filter(Boolean);
    }

    renderDefects(defects);

    if (record.otherDefect && $("otherDefectCheckbox")) {
        $("otherDefectCheckbox").checked = true;
        if ($("otherDefect")) {
            $("otherDefect").value = record.otherDefect;
        }
    }
    updateOtherDefect();
}

function updateInstituteFields() {
    const type = val("instituteType");
    const classWrap = $("classWrap");
    const awcWrap = $("awcWrap");
    const mobile3Label = $("mobile3Label");

    if (classWrap) {
        classWrap.hidden = type !== "School";
        classWrap.style.display = type === "School" ? "" : "none";
    }
    if (awcWrap) {
        awcWrap.hidden = type !== "AWC";
        awcWrap.style.display = type === "AWC" ? "" : "none";
    }
    if (mobile3Label) {
        if (type === "School") {
            mobile3Label.textContent = "School Principal Mobile Number";
        } else if (type === "AWC") {
            mobile3Label.textContent = "AWC Worker Mobile Number";
        } else {
            mobile3Label.textContent = "Mobile Number";
        }
    }
}

function ensureStatusDateField() {
    if ($("statusDate")) {
        if (!$("statusDate").value) {
            $("statusDate").value = today();
        }
        return;
    }
}

function toggleOtherHospital() {
    const select = $("privateHospital");
    const wrapper = $("otherHospitalWrap");
    const input = $("otherHospitalName");
    if (!select) return;

    const isOther = select.value === "Other";
    if (wrapper) {
        wrapper.hidden = !isOther;
        wrapper.style.display = isOther ? "" : "none";
    }
    if (input) {
        input.required = isOther;
        if (!isOther) input.value = "";
    }
}

function updateStatusFields() {
    const status = val("newStatus");
    const referType = val("referType");
    const referTypeWrap = $("referTypeWrap");
    const privateHospitalWrap = $("privateHospitalWrap");
    const treatmentFields = $("treatmentFields");

    if (status === "Referred") {
        if (referTypeWrap) referTypeWrap.style.display = "";
        const isPrivate = referType === "Private Hospital";
        if (privateHospitalWrap) {
            privateHospitalWrap.hidden = !isPrivate;
            privateHospitalWrap.style.display = isPrivate ? "" : "none";
        }
        if (treatmentFields) treatmentFields.style.display = "none";
    } else if (status === "Treatment Started") {
        if (referTypeWrap) referTypeWrap.style.display = "none";
        if (privateHospitalWrap) {
            privateHospitalWrap.hidden = true;
            privateHospitalWrap.style.display = "none";
        }
        if (treatmentFields) treatmentFields.style.display = "";
    } else {
        if (referTypeWrap) referTypeWrap.style.display = "none";
        if (privateHospitalWrap) {
            privateHospitalWrap.hidden = true;
            privateHospitalWrap.style.display = "none";
        }
        if (treatmentFields) treatmentFields.style.display = "none";
    }
    toggleOtherHospital();
}

function uploadMessage(message, type = "info") {
    const element = $("uploadStatus");
    if (!element) return;
    element.textContent = message;
    element.className = `upload-status show ${type}`;
}

function renderSelectedFiles() {
    const photo = $("childPhoto")?.files?.[0];
    const documents = $("referralDocuments")?.files ? [...$("referralDocuments").files] : [];

    if ($("childPhotoSelected")) {
        $("childPhotoSelected").textContent = photo ? `Selected: ${photo.name} (${(photo.size / 1048576).toFixed(1)} MB)` : "";
    }
    if ($("referralDocumentsSelected")) {
        $("referralDocumentsSelected").innerHTML = documents.map(file => `• ${escapeHtml(file.name)} (${(file.size / 1048576).toFixed(1)} MB)`).join("<br>");
    }
}

async function uploadFileAPI(file, fileType) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const token = getToken();
    const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || "File upload failed");
    }
    return data.data;
}

async function uploadSelectedFiles() {
    const photo = $("childPhoto")?.files?.[0];
    const documents = $("referralDocuments")?.files ? [...$("referralDocuments").files] : [];

    if (!photo && !documents.length) {
        return { photo: null, docs: [] };
    }

    uploadMessage("Uploading files...");
    let photoData = null;
    if (photo) {
        photoData = await uploadFileAPI(photo, "child_photo");
    }

    const uploadedDocs = [];
    for (const file of documents) {
        const docData = await uploadFileAPI(file, "document");
        uploadedDocs.push(docData);
    }

    uploadMessage("✓ Files uploaded successfully", "success");
    return { photo: photoData, docs: uploadedDocs };
}

function clearReferralForm() {
    const form = $("referralForm");
    if (form) form.reset();
    editingReferralId = null;
    renderDefects([]);
    updateOtherDefect();
    updateInstituteFields();

    if ($("referralModalTitle")) $("referralModalTitle").textContent = "New Referral";
    if ($("saveReferralButton")) {
        $("saveReferralButton").textContent = "Save Referral";
        $("saveReferralButton").disabled = false;
    }
    if ($("childPhoto")) $("childPhoto").value = "";
    if ($("referralDocuments")) $("referralDocuments").value = "";
    if ($("uploadStatus")) {
        $("uploadStatus").className = "upload-status";
        $("uploadStatus").textContent = "";
    }
    renderSelectedFiles();
}

function fillReferralForm(record) {
    const fields = [
        "childName", "sex", "dob", "birthCertificateNo",
        "fatherName", "fatherAadhaar", "motherName", "motherAadhaar",
        "villageName", "weight", "height", "instituteType", "instituteName",
        "className", "awcWorkerNumber", "mobile1", "mobile2", "mobile3"
    ];

    fields.forEach(id => {
        const element = $(id);
        if (element) element.value = record[id] ?? "";
    });

    setDefects(record);
    updateInstituteFields();
    if ($("childPhoto")) $("childPhoto").value = "";
    if ($("referralDocuments")) $("referralDocuments").value = "";
    renderSelectedFiles();
}

// EVENTS
$("newReferral")?.addEventListener("click", event => {
    event.preventDefault();
    clearReferralForm();
    showModal("referralModal");
});

document.querySelectorAll("[data-close], [data-close-modal]").forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault();
        const target = button.dataset.close || button.dataset.closeModal;
        if (target) hideModal(target);
    });
});

$("instituteType")?.addEventListener("change", updateInstituteFields);

$("defectList")?.addEventListener("change", event => {
    if (event.target && event.target.id === "otherDefectCheckbox") {
        updateOtherDefect();
    }
});

$("childPhoto")?.addEventListener("change", renderSelectedFiles);
$("referralDocuments")?.addEventListener("change", renderSelectedFiles);

window.editReferral = function (id) {
    const record = findRecord(id);
    if (!record) return alert("Referral record not found.");
    editingReferralId = id;
    fillReferralForm(record);

    if ($("referralModalTitle")) $("referralModalTitle").textContent = "Edit Referral";
    if ($("saveReferralButton")) $("saveReferralButton").textContent = "Save Changes";

    hideModal("detailsModal");
    showModal("referralModal");
};

$("referralForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!currentUser) return alert("Please login again.");

    const wasEditing = !!editingReferralId;
    const existing = wasEditing ? findRecord(editingReferralId) : null;

    const childName = val("childName");
    const sex = val("sex");
    const dob = val("dob");
    const instituteType = val("instituteType");
    const instituteName = val("instituteName");
    const defects = getSelectedDefects();
    const otherDefect = val("otherDefect");

    if (!childName || !sex || !dob || !instituteType || !instituteName) {
        return alert("Please fill all mandatory fields.");
    }
    if (!defects.length && !otherDefect) {
        return alert("Please select at least one defect / health condition.");
    }

    const saveButton = $("saveReferralButton");
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        const uploaded = await uploadSelectedFiles();
        const oldDocuments = Array.isArray(existing?.documents) ? existing.documents : [];

        const referralData = {
            childName,
            sex,
            dob,
            birthCertificateNo: val("birthCertificateNo"),
            fatherName: val("fatherName"),
            fatherAadhaar: val("fatherAadhaar"),
            motherName: val("motherName"),
            motherAadhaar: val("motherAadhaar"),
            villageName: val("villageName"),
            weight: val("weight"),
            height: val("height"),
            defects,
            otherDefect,
            instituteType,
            instituteName,
            className: instituteType === "School" ? val("className") : "",
            awcWorkerNumber: instituteType === "AWC" ? val("awcWorkerNumber") : "",
            mobile1: cleanMobile(val("mobile1")),
            mobile2: cleanMobile(val("mobile2")),
            mobile3: cleanMobile(val("mobile3")),
            childPhoto: uploaded.photo || existing?.childPhoto || null,
            documents: [...oldDocuments, ...uploaded.docs]
        };

        const url = wasEditing ? `${API_BASE}/referrals/${editingReferralId}` : `${API_BASE}/referrals`;
        const method = wasEditing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify(referralData)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to save referral");
        }

        hideModal("referralModal");
        clearReferralForm();
        await loadRecords();
        alert(wasEditing ? "Referral updated successfully." : "Referral saved successfully.");
    } catch (error) {
        console.error("Save error:", error);
        alert(error.message || "Unable to save referral.");
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = wasEditing ? "Save Changes" : "Save Referral";
        }
    }
});

// STATUS UPDATE
$("newStatus")?.addEventListener("change", updateStatusFields);
$("referType")?.addEventListener("change", updateStatusFields);
$("privateHospital")?.addEventListener("change", () => {
    toggleOtherHospital();
    const sel = val("privateHospital");
    if (sel && sel !== "Other" && $("hospitalName")) $("hospitalName").value = sel;
    if (sel === "Other" && $("hospitalName")) $("hospitalName").value = val("otherHospitalName");
});
$("otherHospitalName")?.addEventListener("input", () => {
    if (val("privateHospital") === "Other" && $("hospitalName")) {
        $("hospitalName").value = val("otherHospitalName");
    }
});

window.openStatus = function (id) {
    const record = findRecord(id);
    if (!record) return alert("Referral record not found.");
    statusReferralId = id;

    if ($("newStatus")) $("newStatus").value = record.status || "Pending";
    if ($("statusDate")) $("statusDate").value = record.statusDate || today();
    if ($("referType")) $("referType").value = record.referType || "";
    if ($("privateHospital")) $("privateHospital").value = record.privateHospital || "";
    if ($("otherHospitalName")) $("otherHospitalName").value = record.otherHospitalName || "";
    if ($("hospitalName")) $("hospitalName").value = record.hospitalName || "";
    if ($("estimatedExpenditure")) $("estimatedExpenditure").value = record.estimatedExpenditure || "";

    updateStatusFields();
    toggleOtherHospital();
    showModal("statusModal");
};

$("statusForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!statusReferralId) return;

    const newStatus = val("newStatus") || "Pending";
    const statusDate = val("statusDate") || today();
    const referType = val("referType");
    const privateHospital = val("privateHospital");
    const otherHospitalName = val("otherHospitalName");
    const hospitalName = val("hospitalName");
    const estimatedExpenditure = val("estimatedExpenditure");

    if (newStatus === "Referred" && !referType) {
        return alert("Please select Refer Type.");
    }
    if (newStatus === "Referred" && referType === "Private Hospital" && !privateHospital) {
        return alert("Please select Hospital Name.");
    }
    if (newStatus === "Referred" && referType === "Private Hospital" && privateHospital === "Other" && !otherHospitalName) {
        return alert("Please enter Other Hospital Name.");
    }

    const payload = {
        status: newStatus,
        statusDate,
        referType,
        privateHospital,
        otherHospitalName,
        hospitalName,
        estimatedExpenditure
    };

    try {
        const res = await fetch(`${API_BASE}/referrals/${statusReferralId}/status`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Status update failed");

        hideModal("statusModal");
        statusReferralId = null;
        await loadRecords();
        alert("Status updated successfully.");
    } catch (err) {
        console.error("Status update error:", err);
        alert(err.message || "Unable to update status.");
    }
});

// DETAILS
window.viewDetails = function (id) {
    const record = findRecord(id);
    if (!record) return alert("Referral record not found.");
    detailsReferralId = id;

    if ($("detailsSubtitle")) {
        $("detailsSubtitle").textContent = `${record.childName || ""} • ${record.instituteName || ""}`;
    }

    const defects = Array.isArray(record.defects) ? record.defects : [];
    if (record.otherDefect && !defects.includes(record.otherDefect)) {
        defects.push(record.otherDefect);
    }

    const history = Array.isArray(record.statusHistory) && record.statusHistory.length
        ? record.statusHistory
        : [{ status: record.status || "Pending", date: record.registeredDate || today() }];

    const docs = Array.isArray(record.documents) ? record.documents : [];

    if ($("detailsContent")) {
        $("detailsContent").innerHTML = `
            <div class="details-section">
                <div class="details-section-title">👤 Child Details</div>
                <div class="details-grid">
                    <div><small>Child Name</small><strong>${escapeHtml(record.childName)}</strong></div>
                    <div><small>Sex</small><strong>${escapeHtml(record.sex)}</strong></div>
                    <div><small>Date of Birth</small><strong>${escapeHtml(formatDate(record.dob))}</strong></div>
                    <div><small>Birth Certificate No.</small><strong>${escapeHtml(record.birthCertificateNo || "—")}</strong></div>
                    <div><small>Village</small><strong>${escapeHtml(record.villageName || "—")}</strong></div>
                    <div><small>Weight</small><strong>${escapeHtml(record.weight ? `${record.weight} kg` : "—")}</strong></div>
                    <div><small>Height</small><strong>${escapeHtml(record.height ? `${record.height} cm` : "—")}</strong></div>
                </div>
            </div>

            <div class="details-section">
                <div class="details-section-title">👨‍👩‍👦 Family Details</div>
                <div class="details-grid">
                    <div><small>Father Name</small><strong>${escapeHtml(record.fatherName || "—")}</strong></div>
                    <div><small>Father Aadhaar</small><strong>${escapeHtml(record.fatherAadhaar || "—")}</strong></div>
                    <div><small>Mother Name</small><strong>${escapeHtml(record.motherName || "—")}</strong></div>
                    <div><small>Mother Aadhaar</small><strong>${escapeHtml(record.motherAadhaar || "—")}</strong></div>
                </div>
            </div>

            <div class="details-section">
                <div class="details-section-title">🏥 Health Condition</div>
                <div class="details-defects">
                    ${defects.map(d => `<span class="defect-tag">${escapeHtml(d)}</span>`).join("") || "—"}
                </div>
            </div>

            <div class="details-section">
                <div class="details-section-title">🏫 Institute & Contacts</div>
                <div class="details-grid">
                    <div><small>Institute Type</small><strong>${escapeHtml(record.instituteType)}</strong></div>
                    <div><small>Institute Name</small><strong>${escapeHtml(record.instituteName)}</strong></div>
                    <div><small>Class / Worker No.</small><strong>${escapeHtml(record.className || record.awcWorkerNumber || "—")}</strong></div>
                    <div><small>Mobile 1</small><strong>${escapeHtml(record.mobile1 || "—")}</strong></div>
                    <div><small>Mobile 2</small><strong>${escapeHtml(record.mobile2 || "—")}</strong></div>
                    <div><small>Mobile 3</small><strong>${escapeHtml(record.mobile3 || "—")}</strong></div>
                </div>
            </div>

            <div class="details-section">
                <div class="details-section-title">📁 Attachments</div>
                ${record.childPhoto ? `
                    <div style="margin-bottom:12px; display:flex; align-items:center; gap:12px;">
                        <img src="${escapeHtml(record.childPhoto.url)}" style="width:70px; height:70px; object-fit:cover; border-radius:8px;" />
                        <a href="${escapeHtml(record.childPhoto.url)}" target="_blank" class="btn light small">View Full Photo</a>
                    </div>
                ` : '<p style="color:#6b7280; font-size:12px; margin-bottom:8px;">No child photo.</p>'}
                ${docs.length ? docs.map((doc, idx) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:6px 10px; border-radius:6px; margin-bottom:4px; font-size:12px;">
                        <span>📄 ${escapeHtml(doc.originalFilename || `Doc ${idx + 1}`)}</span>
                        <a href="${escapeHtml(doc.url)}" target="_blank" class="btn primary small">View</a>
                    </div>
                `).join("") : '<p style="color:#6b7280; font-size:12px;">No documents attached.</p>'}
            </div>

            <div class="details-section">
                <div class="details-section-title">📋 Status Timeline</div>
                <div class="status-history-timeline">
                    ${history.map((item, idx) => `
                        <div class="status-history-item ${idx === history.length - 1 ? 'current' : ''}">
                            <div class="status-history-dot">${idx === history.length - 1 ? '●' : '✓'}</div>
                            <div class="status-history-content">
                                <div class="status-history-status">${escapeHtml(statusLabel(item.status))}</div>
                                <div class="status-history-date">${escapeHtml(formatDate(item.date))}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    hideModal("referralModal");
    showModal("detailsModal");
};

$("detailsEdit")?.addEventListener("click", () => {
    if (detailsReferralId) window.editReferral(detailsReferralId);
});

// DELETE
window.deleteReferral = function (id) {
    const record = findRecord(id);
    if (!record) return alert("Referral record not found.");
    deleteReferralId = id;
    if ($("deleteChildName")) $("deleteChildName").textContent = record.childName || "";
    showModal("deleteModal");
};

$("confirmDelete")?.addEventListener("click", async () => {
    if (!deleteReferralId) return;
    try {
        const res = await fetch(`${API_BASE}/referrals/${deleteReferralId}`, {
            method: "DELETE",
            headers: authHeaders()
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");

        deleteReferralId = null;
        hideModal("deleteModal");
        await loadRecords();
        alert("Referral deleted successfully.");
    } catch (err) {
        console.error("Delete error:", err);
        alert(err.message || "Unable to delete referral.");
    }
});

// SEARCH & FILTERS
$("search")?.addEventListener("input", renderRecords);
$("statusFilter")?.addEventListener("change", renderRecords);
$("typeFilter")?.addEventListener("change", renderRecords);

function renderRecords() {
    const container = $("records");
    if (!container) return;

    const search = val("search").toLowerCase();
    const statusFilter = val("statusFilter");
    const typeFilter = val("typeFilter");

    const filtered = referrals.filter(record => {
        const text = [
            record.childName, record.fatherName, record.motherName,
            record.villageName, record.instituteName, record.mobile1,
            record.mobile2, record.mobile3, record.defect, record.otherDefect
        ].join(" ").toLowerCase();

        return (!search || text.includes(search)) &&
               (!statusFilter || record.status === statusFilter) &&
               (!typeFilter || record.instituteType === typeFilter);
    });

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No referrals found</h3>
                <p>Add a new referral to get started.</p>
            </div>
        `;
        updateStats();
        return;
    }

    container.innerHTML = filtered.map(record => {
        const status = record.status || "Pending";
        const recId = record._id || record.id;
        return `
            <article class="referral-card status-${escapeHtml(statusClass(status))}">
                <div class="referral-card-top">
                    <div class="child-info">
                        <h3>${escapeHtml(record.childName || "Unnamed Child")}</h3>
                        <div class="child-meta">
                            ${escapeHtml(record.sex || "")}
                            ${record.dob ? ` • DOB: ${escapeHtml(formatDate(record.dob))}` : ""}
                        </div>
                    </div>
                    <span class="status-badge ${escapeHtml(statusClass(status))}">
                        ${escapeHtml(statusLabel(status))}
                    </span>
                </div>
                <div class="referral-card-body">
                    <div class="record-info">
                        <span>🏥 ${escapeHtml(record.instituteName || "—")}</span>
                        <span>📍 ${escapeHtml(record.villageName || "—")}</span>
                        <span>❤️ ${escapeHtml(record.defect || "—")}</span>
                    </div>
                </div>
                <div class="referral-card-actions">
                    <button type="button" onclick="viewDetails('${escapeHtml(recId)}')">View</button>
                    <button type="button" onclick="editReferral('${escapeHtml(recId)}')">Edit</button>
                    <button type="button" onclick="openStatus('${escapeHtml(recId)}')">Update Status</button>
                    <button type="button" class="danger" onclick="deleteReferral('${escapeHtml(recId)}')">Delete</button>
                </div>
            </article>
        `;
    }).join("");

    updateStats();
}

function updateStats() {
    const count = status => referrals.filter(record => (record.status || "Pending") === status).length;
    if ($("total")) $("total").textContent = referrals.length;
    if ($("pending")) $("pending").textContent = count("Pending");
    if ($("referred")) $("referred").textContent = count("Referred");
    if ($("started")) $("started").textContent = count("Treatment Started");
    if ($("completed")) $("completed").textContent = count("Completed");
}

async function loadRecords() {
    const container = $("records");
    if (container) {
        container.innerHTML = `<div class="loading-state">Loading referrals...</div>`;
    }

    try {
        const res = await fetch(`${API_BASE}/referrals`, {
            headers: authHeaders()
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load records");

        referrals = data.data || [];
        renderRecords();
    } catch (err) {
        console.error("Load records error:", err);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Unable to load referrals</h3>
                    <p>${escapeHtml(err.message)}</p>
                </div>
            `;
        }
    }
}

// LOGOUT
$("logout")?.addEventListener("click", () => {
    localStorage.removeItem("rbsk_token");
    localStorage.removeItem("rbsk_user");
    window.location.href = "index.html";
});

// AUTH CHECK ON INIT
async function checkAuthAndInit() {
    const token = getToken();
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: authHeaders()
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error("Session expired");
        }
        currentUser = data.data;
        if ($("userMobile")) {
            $("userMobile").textContent = currentUser.name || currentUser.mobile;
        }

        renderDefects([]);
        updateOtherDefect();
        updateInstituteFields();
        updateStatusFields();
        toggleOtherHospital();
        renderSelectedFiles();
        await loadRecords();
    } catch (err) {
        console.error("Auth verify error:", err);
        localStorage.removeItem("rbsk_token");
        localStorage.removeItem("rbsk_user");
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", checkAuthAndInit);
