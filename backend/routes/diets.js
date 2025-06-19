const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diets ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener dietas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM diets WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar dieta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body;
    if (!name || !description || calories == null) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await pool.query(
      'INSERT INTO diets (name, description, calories) VALUES ($1, $2, $3) RETURNING *',
      [name, description, calories]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear dieta' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, calories } = req.body;
    const result = await pool.query(
      'UPDATE diets SET name = $1, description = $2, calories = $3 WHERE id = $4 RETURNING *',
      [name, description, calories, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar dieta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM diets WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' });
    }
    res.json({ message: 'Dieta eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar dieta' });
  }
});

module.exports = router;