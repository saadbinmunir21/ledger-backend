const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

router.get('/:accountId', getTransactions);
router.post('/', addTransaction);
router.put('/:transactionId', updateTransaction);
router.delete('/:transactionId', deleteTransaction);

module.exports = router;
