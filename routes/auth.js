const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Fungsi buat Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Fungsi buat Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
};

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(201).json({
          success: true,
          message: 'Registrasi berhasil',
          data: { id: results.insertId, name, email }
        });
      }
    );
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Buat kedua token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hitung expires_at (7 hari dari sekarang)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Simpan refresh token ke database
    db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt],
      (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({
          success: true,
          message: 'Login berhasil',
          access_token: accessToken,
          refresh_token: refreshToken,
          data: { id: user.id, name: user.name, email: user.email }
        });
      }
    );
  });
});

// REFRESH TOKEN — Minta Access Token baru
router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ success: false, message: 'Refresh token wajib diisi' });
  }

  // Cek refresh token ada di database
  db.query('SELECT * FROM refresh_tokens WHERE token = ?', [refresh_token], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) {
      return res.status(403).json({ success: false, message: 'Refresh token tidak valid' });
    }

    // Cek apakah token sudah expired
    const tokenData = results[0];
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(403).json({ success: false, message: 'Refresh token sudah expired, silakan login ulang' });
    }

    // Verifikasi refresh token
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ success: false, message: 'Refresh token tidak valid' });

      // Buat access token baru
      const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

      res.json({
        success: true,
        message: 'Access token berhasil diperbarui',
        access_token: newAccessToken
      });
    });
  });
});

// LOGOUT — Hapus refresh token
router.post('/logout', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ success: false, message: 'Refresh token wajib diisi' });
  }

  db.query('DELETE FROM refresh_tokens WHERE token = ?', [refresh_token], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Logout berhasil' });
  });
});

module.exports = router;