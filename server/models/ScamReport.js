import mongoose from 'mongoose';

const scamReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  scamType: {
    type: String,
    required: true,
    enum: [
      'Phishing Email',
      'Fake Website',
      'Phone Scam',
      'SMS Scam',
      'Social Media Scam',
      'Investment Fraud',
      'Romance Scam',
      'Tech Support Scam',
      'UPI Related Frauds',
      'Online Financial Fraud',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  emailAddress: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Official complaint fields
  complaintNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Personal details
  fullName: String,
  mobile: String,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  dob: Date,
  spouse: String,
  relationWithVictim: String,
  personalEmail: String,
  // Address details
  houseNo: String,
  streetName: String,
  colony: String,
  village: String,
  tehsil: String,
  district: String,
  state: String,
  country: {
    type: String,
    default: 'India'
  },
  policeStation: String,
  pincode: String,
  // PDF data
  pdfData: {
    md5Hash: String,
    sha256Hash: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
scamReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ScamReport', scamReportSchema);
