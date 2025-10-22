const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountId: { type: Number, unique: true },
  name: { type: String, required: true }
});

module.exports = mongoose.model('Account', accountSchema);
