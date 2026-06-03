require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // ← Railway otomatis set PORT

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