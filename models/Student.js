const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  vpmId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String
  },
  motherName: {
    type: String
  },
  lostParent: {
    type: Boolean,
    default: false
  },
  address: {
    type: String
  },
  state: {
    type: String
  },
  district: {
    type: String
  },
  pincode: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  course: {
    type: String
  },
  stream: {
    type: String
  },
  regular: {
    type: Boolean,
    default: true
  },
  college: {
    type: String
  },
  sponsor: {
    type: String
  },
  dropout: {
    type: Boolean,
    default: false
  },
  internship: [{
    employer: String,
    address: String,
    stipend: String
  }],
  job: {
    company: String,
    post: String,
    ctc: String,
    joiningDate: String
  },
});

module.exports = mongoose.model('Student', studentSchema);