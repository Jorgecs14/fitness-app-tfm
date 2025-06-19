const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, surname, birth_date, created_at, role FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// CREATE new user
router.post('/', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name, surname, birth_date, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, surname, birth_date, created_at, role',
      [email, password, name, surname, birth_date, role || 'client']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;