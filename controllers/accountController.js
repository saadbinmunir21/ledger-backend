const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Counter = require('../models/Counter');

// Helper function for auto-increment IDs
async function getNextAccountId() {
  const r = await Counter.findByIdAndUpdate(
    { _id: 'accountId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return r.seq;
}

// Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ accountId: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { name } = req.body;
    const id = await getNextAccountId();
    const account = new Account({ accountId: id, name });
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an account and its transactions
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    await Transaction.deleteMany({ account: account._id });
    await account.deleteOne();

    res.json({ message: 'Account and related transactions deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
