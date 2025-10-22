const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Get all transactions for a specific account
exports.getTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = await Transaction.find({ account: accountId }).sort({ dateOfEntry: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { accountId, dateOfEntry, reference, description, dueOn, debit, credit } = req.body;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const lastTransaction = await Transaction.findOne({ account: accountId }).sort({ dateOfEntry: -1 });
    let balance = lastTransaction ? lastTransaction.balance : 0;
    balance = balance + (debit || 0) - (credit || 0);

    const transaction = new Transaction({
      account: accountId,
      dateOfEntry,
      reference,
      description,
      dueOn,
      debit,
      credit,
      balance
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const updated = await Transaction.findByIdAndUpdate(transactionId, req.body, { new: true });

    await recalculateBalances(updated.account);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const accountId = transaction.account;
    await transaction.deleteOne();

    await recalculateBalances(accountId);

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: Recalculate balance after updates/deletes
async function recalculateBalances(accountId) {
  const transactions = await Transaction.find({ account: accountId }).sort({ dateOfEntry: 1 });
  let runningBalance = 0;

  for (const t of transactions) {
    runningBalance += (t.debit || 0) - (t.credit || 0);
    t.balance = runningBalance;
    await t.save();
  }
}
