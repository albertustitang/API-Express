const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',        // ganti sesuai user MySQL kamu
  password: '',        // ganti sesuai password MySQL kamu
  database: 'belajar_express'
});

db.connect((err) => {
  if (err) {
    console.error('Gagal koneksi ke MySQL:', err.message);
    return;
  }
  console.log('Berhasil koneksi ke MySQL!');
});

module.exports = db;