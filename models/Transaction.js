const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  dateOfEntry: { type: Date, required: true },
  reference: { type: Number, required: false },
  description: { type: String },
  dueOn: { type: Date },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
