const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Get all transactions for a specific account (newest first)
exports.getTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = await Transaction.find({ account: accountId })
      .sort({ dateOfEntry: -1, _id: -1 }); // newest first, break ties with _id
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { accountId, dateOfEntry, reference, description, dueOn, debit, credit, remarks } = req.body;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const transaction = new Transaction({
      account: accountId,
      dateOfEntry,
      reference,
      description,
      dueOn,
      debit,
      credit,
      remarks
    });

    await transaction.save();

    // Recalculate balances from this transaction's date onwards
    await recalculateBalancesFrom(accountId, transaction.dateOfEntry);

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const oldDate = transaction.dateOfEntry;

    Object.assign(transaction, req.body);
    await transaction.save();

    // Recalculate balances from the earliest of old/new date
    const startDate = transaction.dateOfEntry < oldDate ? transaction.dateOfEntry : oldDate;
    await recalculateBalancesFrom(transaction.account, startDate);

    res.json(transaction);
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
    const dateOfDeleted = transaction.dateOfEntry;

    await transaction.deleteOne();

    // Recalculate balances from the deleted transaction's date onwards
    await recalculateBalancesFrom(accountId, dateOfDeleted);

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: Recalculate balances from a specific date for affected transactions
async function recalculateBalancesFrom(accountId, startDate) {
  // Get all transactions from startDate onwards, ordered by date and insertion order
  const transactions = await Transaction.find({
    account: accountId,
    dateOfEntry: { $gte: startDate }
  }).sort({ dateOfEntry: 1, _id: 1 }); // ascending, oldest first

  // Get last transaction before startDate to start running balance
  const lastBefore = await Transaction.findOne({
    account: accountId,
    dateOfEntry: { $lt: startDate }
  }).sort({ dateOfEntry: -1, _id: -1 });

  let runningBalance = lastBefore ? lastBefore.balance : 0;

  for (const t of transactions) {
    runningBalance += (t.debit || 0) - (t.credit || 0);
    t.balance = runningBalance;
    await t.save();
  }
}
