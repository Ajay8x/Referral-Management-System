import Referral from '../models/Referral.js';

// @desc    Get all referrals with filters, search, and stats
// @route   GET /api/referrals
// @access  Private
export const getReferrals = async (req, res) => {
  try {
    const { search, status, instituteType } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (instituteType) {
      query.instituteType = instituteType;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { childName: regex },
        { fatherName: regex },
        { motherName: regex },
        { villageName: regex },
        { instituteName: regex },
        { defect: regex },
        { otherDefect: regex },
        { mobile1: regex },
        { mobile2: regex },
        { mobile3: regex },
        { birthCertificateNo: regex }
      ];
    }

    const referrals = await Referral.find(query).sort({ createdAt: -1 });

    // Calculate aggregated stats for the user
    const allUserReferrals = await Referral.find({ user: req.user._id }, 'status');
    const stats = {
      total: allUserReferrals.length,
      pending: allUserReferrals.filter(r => r.status === 'Pending').length,
      referred: allUserReferrals.filter(r => r.status === 'Referred').length,
      started: allUserReferrals.filter(r => r.status === 'Treatment Started').length,
      completed: allUserReferrals.filter(r => r.status === 'Completed').length
    };

    res.status(200).json({
      success: true,
      count: referrals.length,
      stats,
      data: referrals
    });
  } catch (error) {
    console.error('Get Referrals Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching referrals' });
  }
};

// @desc    Get single referral by ID
// @route   GET /api/referrals/:id
// @access  Private
export const getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findOne({ _id: req.params.id, user: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral record not found' });
    }

    res.status(200).json({
      success: true,
      data: referral
    });
  } catch (error) {
    console.error('Get Referral Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new referral
// @route   POST /api/referrals
// @access  Private
export const createReferral = async (req, res) => {
  try {
    const {
      childName,
      sex,
      dob,
      birthCertificateNo,
      fatherName,
      fatherAadhaar,
      motherName,
      motherAadhaar,
      villageName,
      weight,
      height,
      defects,
      otherDefect,
      instituteType,
      instituteName,
      className,
      awcWorkerNumber,
      mobile1,
      mobile2,
      mobile3,
      childPhoto,
      documents
    } = req.body;

    if (!childName || !sex || !dob || !instituteType || !instituteName) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory fields' });
    }

    const defectList = Array.isArray(defects) ? defects : [];
    if (!defectList.length && !otherDefect) {
      return res.status(400).json({ success: false, message: 'Please select at least one defect / health condition' });
    }

    const combinedDefect = [...defectList, ...(otherDefect ? [otherDefect] : [])].join(', ');
    const today = new Date().toISOString().split('T')[0];

    const referral = await Referral.create({
      user: req.user._id,
      childName,
      sex,
      dob,
      birthCertificateNo: birthCertificateNo || '',
      fatherName: fatherName || '',
      fatherAadhaar: fatherAadhaar || '',
      motherName: motherName || '',
      motherAadhaar: motherAadhaar || '',
      villageName: villageName || '',
      weight: weight || '',
      height: height || '',
      defects: defectList,
      otherDefect: otherDefect || '',
      defect: combinedDefect,
      instituteType,
      instituteName,
      className: instituteType === 'School' ? className || '' : '',
      awcWorkerNumber: instituteType === 'AWC' ? awcWorkerNumber || '' : '',
      mobile1: mobile1 || '',
      mobile2: mobile2 || '',
      mobile3: mobile3 || '',
      childPhoto: childPhoto || null,
      documents: Array.isArray(documents) ? documents : [],
      status: 'Pending',
      registeredDate: today,
      statusHistory: [
        {
          status: 'Pending',
          date: today
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      data: referral
    });
  } catch (error) {
    console.error('Create Referral Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating referral' });
  }
};

// @desc    Update existing referral
// @route   PUT /api/referrals/:id
// @access  Private
export const updateReferral = async (req, res) => {
  try {
    let referral = await Referral.findOne({ _id: req.params.id, user: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral record not found' });
    }

    const {
      childName,
      sex,
      dob,
      birthCertificateNo,
      fatherName,
      fatherAadhaar,
      motherName,
      motherAadhaar,
      villageName,
      weight,
      height,
      defects,
      otherDefect,
      instituteType,
      instituteName,
      className,
      awcWorkerNumber,
      mobile1,
      mobile2,
      mobile3,
      childPhoto,
      documents
    } = req.body;

    const defectList = Array.isArray(defects) ? defects : referral.defects;
    const combinedDefect = [...defectList, ...(otherDefect ? [otherDefect] : [])].join(', ');

    const updatedData = {
      childName: childName || referral.childName,
      sex: sex || referral.sex,
      dob: dob || referral.dob,
      birthCertificateNo: birthCertificateNo !== undefined ? birthCertificateNo : referral.birthCertificateNo,
      fatherName: fatherName !== undefined ? fatherName : referral.fatherName,
      fatherAadhaar: fatherAadhaar !== undefined ? fatherAadhaar : referral.fatherAadhaar,
      motherName: motherName !== undefined ? motherName : referral.motherName,
      motherAadhaar: motherAadhaar !== undefined ? motherAadhaar : referral.motherAadhaar,
      villageName: villageName !== undefined ? villageName : referral.villageName,
      weight: weight !== undefined ? weight : referral.weight,
      height: height !== undefined ? height : referral.height,
      defects: defectList,
      otherDefect: otherDefect !== undefined ? otherDefect : referral.otherDefect,
      defect: combinedDefect,
      instituteType: instituteType || referral.instituteType,
      instituteName: instituteName || referral.instituteName,
      className: instituteType === 'School' ? className : '',
      awcWorkerNumber: instituteType === 'AWC' ? awcWorkerNumber : '',
      mobile1: mobile1 !== undefined ? mobile1 : referral.mobile1,
      mobile2: mobile2 !== undefined ? mobile2 : referral.mobile2,
      mobile3: mobile3 !== undefined ? mobile3 : referral.mobile3
    };

    if (childPhoto) {
      updatedData.childPhoto = childPhoto;
    }
    if (documents && Array.isArray(documents)) {
      updatedData.documents = documents;
    }

    referral = await Referral.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Referral updated successfully',
      data: referral
    });
  } catch (error) {
    console.error('Update Referral Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating referral' });
  }
};

// @desc    Update referral status and status history
// @route   PATCH /api/referrals/:id/status
// @access  Private
export const updateReferralStatus = async (req, res) => {
  try {
    const referral = await Referral.findOne({ _id: req.params.id, user: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral record not found' });
    }

    const {
      status,
      statusDate,
      referType,
      privateHospital,
      otherHospitalName,
      hospitalName,
      estimatedExpenditure
    } = req.body;

    const dateToUse = statusDate || new Date().toISOString().split('T')[0];

    // Status validation
    if (status === 'Referred' && !referType) {
      return res.status(400).json({ success: false, message: 'Please select Refer Type' });
    }
    if (status === 'Referred' && referType === 'Private Hospital' && !privateHospital) {
      return res.status(400).json({ success: false, message: 'Please select Private Hospital name' });
    }

    // Build status history
    let history = [...(referral.statusHistory || [])];
    const lastItem = history[history.length - 1];

    if (lastItem && lastItem.status === status) {
      lastItem.date = dateToUse;
    } else {
      history.push({ status, date: dateToUse });
    }

    const updateFields = {
      status,
      statusDate: dateToUse,
      statusHistory: history
    };

    if (status === 'Referred') {
      updateFields.referType = referType;
      updateFields.referredDate = dateToUse;
      updateFields.privateHospital = referType === 'Private Hospital' ? privateHospital : '';
      updateFields.otherHospitalName = referType === 'Private Hospital' && privateHospital === 'Other' ? otherHospitalName : '';
      updateFields.hospitalName = referType === 'Private Hospital' ? (privateHospital === 'Other' ? otherHospitalName : privateHospital) : 'DEIC';
    } else if (status === 'Treatment Started') {
      updateFields.treatmentStartedDate = dateToUse;
      updateFields.hospitalName = hospitalName || referral.hospitalName;
      updateFields.estimatedExpenditure = estimatedExpenditure || referral.estimatedExpenditure;
    } else if (status === 'Completed') {
      updateFields.completedDate = dateToUse;
    } else if (status === 'Pending') {
      updateFields.registeredDate = dateToUse;
    }

    const updatedReferral = await Referral.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updatedReferral
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating status' });
  }
};

// @desc    Delete referral
// @route   DELETE /api/referrals/:id
// @access  Private
export const deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (error) {
    console.error('Delete Referral Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error deleting referral' });
  }
};
