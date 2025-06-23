const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// Obtener todos los entrenamientos
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/workouts - Obteniendo todos los workouts');
    const result = await pool.query('SELECT * FROM workouts ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
});


// Obtener un entrenamiento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/workouts/${id} - Buscando workout`);

    const result = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.log(`Workout con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar entrenamiento' });
  }
});

// Crear un nuevo entrenamiento
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/workouts - Creando nuevo entrenamiento');
    const { title, category, notes } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'titulo y categoria son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO workouts (title, category, notes) VALUES ($1, $2, $3) RETURNING *',
      [title, category, notes || '']
    );


    console.log(`Workout creado: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error al crear workout:', error);


    if (error.code === '23505') {
      res.status(400).json({ error: 'Ya existe un workout con ese nombre' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Los datos enviados no cumplen con las reglas del modelo' });
    } else {
      res.status(500).json({ error: 'Error interno al crear el workout' });
    }
  }
});


// Actualizar un entrenamiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/workouts/${id} - Actualizando workout`);
    const { title, category, notes } = req.body;
  
  
  if (!title || !category) {
    console.log('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Titulo y categoria son requeridos' });
  }
  const result = await pool.query(
    'UPDATE workouts SET title = $1, category = $2, notes = $3 WHERE id = $4 RETURNING *',
    [title, category, notes || '', id ]
  );


  if (result.rows.length === 0) {
    console.log(`entrenamiento con ID ${id} no encontrado`);
    return res.status(404).json({ error: 'Workout no encontrado' });
  }

  console.log(`Workout actualizado: ${title}`);
  res.json(result.rows[0]);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error al actualizar entrenamiento' });
}
});

// Eliminar un entrenamiento
router.delete('/:id', async (req, res) => {
  try {
  const {id} = req.params;
     console.log(`DELETE /api/workouts/${id} - Eliminando entrenamiento`);
     const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 RETURNING title',
      [id]
    );

  if (result.rows.length === 0) {
     console.log(`Workout con ID ${id} no encontrado`);
     return res.status(404).json({ error: 'Entrenamiento no encontrado' });

  }
     console.log(`Workout eliminado: ${result.rows[0].title}`);
     res.json({ message: 'Entrenamiento eliminado correctamente' });
     } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar entrenamiento' });
  }
});

module.exports = router;