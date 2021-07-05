const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema({
  financialYear: {
    type: String,
    required: true
  },
  disb_no: {
    type: String,
    required: true
  },
  vpmId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  bankRef: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  donor: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Disbursement', disbursementSchema);