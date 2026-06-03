const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// Semua route users sekarang butuh token
router.get('/', verifyToken, (req, res) => {
  db.query('SELECT id, name, email, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

router.get('/:id', verifyToken, (req, res) => {
  db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: results[0] });
  });
});

router.put('/:id', verifyToken, (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const updatedName = name || results[0].name;
    const updatedEmail = email || results[0].email;

    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [updatedName, updatedEmail, id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, data: { id: parseInt(id), name: updatedName, email: updatedEmail } });
    });
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, message: 'User berhasil dihapus' });
  });
});

module.exports = router;