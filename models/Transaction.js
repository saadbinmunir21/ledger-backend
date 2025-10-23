const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  dateOfEntry: { type: Date, required: true },
  dueOn: { type: Date },
  description: { type: String },
  reference: { type: String },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  remarks: { type: String },
}, { timestamps: true }); // createdAt & updatedAt for proper ordering

module.exports = mongoose.model("Transaction", transactionSchema);
