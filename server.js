const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/finmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB (finmate database)'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'OK', message: 'Server and MongoDB (finmate) are running' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'ERROR', message: 'MongoDB connection failed' });
  }
});

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Mock, use bcrypt in production
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  desc: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budgetGoal: { type: Number, default: 0 },
  currentAmount: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      console.log('Authentication failed: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    let user = await User.findOne({ username });
    if (!user) {
      console.log(`Creating new user: ${username}`);
      user = new User({ username, password });
      await user.save();
    } else if (user.password !== password) {
      console.log(`Invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log(`Login successful for user: ${username}`);
    res.json({ token, message: 'Login successful!' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json(transactions);
  } catch (err) {
    console.error('Transaction fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/transactions', authenticate, async (req, res) => {
  const { desc, amount, type, category, date } = req.body;
  if (!desc || !amount || !type || !category || !date) {
    console.log('Transaction creation failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const transaction = new Transaction({
      userId: req.userId,
      desc,
      amount,
      type,
      category,
      date,
    });
    await transaction.save();
    res.status(201).json({ message: 'Transaction added!', transaction });
  } catch (err) {
    console.error('Transaction save error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/transactions/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { desc, amount, type, category, date } = req.body;

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { desc, amount, type, category, date },
      { new: true }
    );
    if (!transaction) {
      console.log(`Transaction update failed: ID ${id} not found`);
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction updated!', transaction });
  } catch (err) {
    console.error('Transaction update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/transactions/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId });
    if (!transaction) {
      console.log(`Transaction delete failed: ID ${id} not found`);
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted!' });
  } catch (err) {
    console.error('Transaction delete error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Budget Routes
app.get('/api/budget', authenticate, async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      budget = new Budget({ userId: req.userId });
      await budget.save();
    }
    res.json(budget);
  } catch (err) {
    console.error('Budget fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/budget', authenticate, async (req, res) => {
  const { budgetGoal } = req.body;
  if (!budgetGoal || budgetGoal <= 0) {
    console.log('Budget creation failed: Invalid budget goal');
    return res.status(400).json({ error: 'Invalid budget goal' });
  }

  try {
    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      budget = new Budget({ userId: req.userId, budgetGoal });
    } else {
      budget.budgetGoal = budgetGoal;
    }
    await budget.save();
    res.json({ message: 'Budget goal set!', budget });
  } catch (err) {
    console.error('Budget save error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/budget/transaction', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    console.log('Budget transaction failed: Invalid amount');
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    let budget = await Budget.findOne({ userId: req.userId });
    if (!budget) {
      budget = new Budget({ userId: req.userId });
    }
    budget.currentAmount += amount;
    await budget.save();
    res.json({ message: 'Transaction added to budget!', budget });
  } catch (err) {
    console.error('Budget transaction error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Currency Conversion
app.get('/api/currency/convert', async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    console.log('Currency conversion failed: Missing parameters');
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = response.data.rates[to];
    if (!rate) {
      console.log(`Currency conversion failed: Invalid pair ${from}-${to}`);
      return res.status(400).json({ error: 'Invalid currency pair' });
    }
    const converted = (parseFloat(amount) * rate).toFixed(2);
    res.json({ result: `${amount} ${from} = ${converted} ${to}`, converted });
  } catch (err) {
    console.error('Currency conversion error:', err.message);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: `Server error: ${err.message}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));