require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Routes
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');

app.use('/auth', authRoute);
app.use('/users', usersRoute);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});