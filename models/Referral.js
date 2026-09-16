import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Referred', 'Treatment Started', 'Completed'],
    required: true
  },
  date: {
    type: String,
    required: true
  }
}, { _id: false });

const fileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  secureUrl: { type: String },
  publicId: { type: String },
  originalFilename: { type: String },
  bytes: { type: Number },
  fileType: { type: String }
}, { _id: false });

const referralSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Child Details
    childName: {
      type: String,
      required: [true, 'Child name is required'],
      trim: true
    },
    sex: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Sex is required']
    },
    dob: {
      type: String,
      required: [true, 'Date of birth is required']
    },
    birthCertificateNo: {
      type: String,
      default: '',
      trim: true
    },
    fatherName: {
      type: String,
      default: '',
      trim: true
    },
    fatherAadhaar: {
      type: String,
      default: '',
      trim: true
    },
    motherName: {
      type: String,
      default: '',
      trim: true
    },
    motherAadhaar: {
      type: String,
      default: '',
      trim: true
    },
    villageName: {
      type: String,
      default: '',
      trim: true
    },
    weight: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: ''
    },

    // Defects / Health Problem
    defects: {
      type: [String],
      default: []
    },
    otherDefect: {
      type: String,
      default: '',
      trim: true
    },
    defect: {
      type: String,
      default: ''
    },

    // Institute Details
    instituteType: {
      type: String,
      enum: ['School', 'AWC'],
      required: [true, 'Institute type is required']
    },
    instituteName: {
      type: String,
      required: [true, 'Institute name is required'],
      trim: true
    },
    className: {
      type: String,
      default: ''
    },
    awcWorkerNumber: {
      type: String,
      default: ''
    },

    // Contact Numbers
    mobile1: {
      type: String,
      default: '',
      trim: true
    },
    mobile2: {
      type: String,
      default: '',
      trim: true
    },
    mobile3: {
      type: String,
      default: '',
      trim: true
    },

    // Files
    childPhoto: {
      type: fileSchema,
      default: null
    },
    documents: {
      type: [fileSchema],
      default: []
    },

    // Status & Treatment Flow
    status: {
      type: String,
      enum: ['Pending', 'Referred', 'Treatment Started', 'Completed'],
      default: 'Pending'
    },
    registeredDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    referredDate: {
      type: String,
      default: ''
    },
    treatmentStartedDate: {
      type: String,
      default: ''
    },
    completedDate: {
      type: String,
      default: ''
    },
    statusDate: {
      type: String,
      default: ''
    },

    referType: {
      type: String,
      enum: ['DEIC', 'Private Hospital', ''],
      default: ''
    },
    privateHospital: {
      type: String,
      default: ''
    },
    otherHospitalName: {
      type: String,
      default: ''
    },
    hospitalName: {
      type: String,
      default: ''
    },
    estimatedExpenditure: {
      type: String,
      default: ''
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Search indexing
referralSchema.index({ childName: 'text', fatherName: 'text', motherName: 'text', instituteName: 'text', villageName: 'text', defect: 'text' });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
