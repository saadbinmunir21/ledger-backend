const express = require('express');
const router = express.Router();
const {
  getAccounts,
  createAccount,
  deleteAccount
} = require('../controllers/accountController');

router.get('/', getAccounts);
router.post('/', createAccount);
router.delete('/:accountId', deleteAccount);

module.exports = router;
