require('dotenv').config(); // Load variables from .env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Use PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
