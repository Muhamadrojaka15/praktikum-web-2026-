const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_kampus'
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi database gagal:', err.message);
    return;
  }
  console.log('Terhubung ke database MySQL Laragon');
});

app.get('/api/mahasiswa', (req, res) => {
  db.query('SELECT * FROM mahasiswa ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

app.post('/api/mahasiswa', (req, res) => {
  const { nim, nama, jurusan, email } = req.body;
  const sql = 'INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [nim, nama, jurusan, email], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Data mahasiswa berhasil disimpan!' });
  });
});

app.put('/api/mahasiswa/:id', (req, res) => {
  const { id } = req.params;
  const { nim, nama, jurusan, email } = req.body;
  const sql = 'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ?, email = ? WHERE id = ?';
  db.query(sql, [nim, nama, jurusan, email, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Data mahasiswa berhasil diperbarui!' });
  });
});

app.delete('/api/mahasiswa/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM mahasiswa WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Data mahasiswa berhasil dihapus!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server CRUD aktif di http://localhost:${PORT}`);
});
