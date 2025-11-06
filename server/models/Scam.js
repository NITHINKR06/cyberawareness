import mongoose from 'mongoose';

const scamSchema = new mongoose.Schema({
  era: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  red_flags: {
    type: [String], // An array of strings
    required: true,
  },
  impact: {
    type: mongoose.Schema.Types.Mixed, // Using Mixed type for flexible JSON data
  },
});

const Scam = mongoose.model('Scam', scamSchema);

export default Scam;