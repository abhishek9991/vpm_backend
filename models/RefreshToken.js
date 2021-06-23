const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Refresh Token', refreshTokenSchema);