require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://albertustitandev.my.id',
    'https://www.albertustitandev.my.id'
  ],
  credentials: true
}));
app.use(express.json());

// Route default
app.get('/', (req, res) => {
  res.json({ message: 'API berjalan!' });
});

// Routes
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

app.use('/auth', authRoute);
app.use('/users', usersRoute);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});