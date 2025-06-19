const express = require('express');
const router = express.Router();
const pool = require('../database/db');


router.get('/', async (req, res) => {
  try {
    console.log('GET /api/users - Obteniendo todos los usuarios');
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role } = req.body;

    if (!email || !password || !name || !surname) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO users (email, password, name, surname, birth_date, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, password, name, surname, birth_date, role || 'client']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, surname, birth_date, role } = req.body;

    const result = await pool.query(
      'UPDATE users SET email = $1, name = $2, surname = $3, birth_date = $4, role = $5 WHERE id = $6 RETURNING *',
      [email, name, surname, birth_date, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: `Usuario ${result.rows[0].email} eliminado correctamente` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;