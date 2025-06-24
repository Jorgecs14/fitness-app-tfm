const express = require('express');
const router = express.Router();
const pool = require('../database/db');



// Obtener todos los entrenamientos
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/exercises - Obteniendo todos los ejercicios');
    const result = await pool.query('SELECT * FROM exercises ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
});


// Obtener un ejercicio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/exercises/${id} - Buscando ejercicios`);

    const result = await pool.query('SELECT * FROM exercises WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      console.log(`ejercicio con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'ejercicio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar ejercicio' });
  }
});

// Crear un nuevo ejercicio
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/exercises - Creando nuevo ejercicio');
    const { name, description, executionTime  } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'titulo y descripcion son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO exercises (name, description, execution_time) VALUES ($1, $2, $3) RETURNING *',
      [name, description, executionTime ? parseInt(executionTime): null]
    );


    console.log(`ejercicio creado: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error al crear ejercicio:', error);


    if (error.code === '23505') {
      res.status(400).json({ error: 'Ya existe un ejercicio con ese nombre' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Los datos enviados no cumplen con las reglas del modelo' });
    } else {
      res.status(500).json({ error: 'Error interno al crear el ejercicio' });
    }
  }
});


// Actualizar un ejercicio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/exercises/${id} - Actualizando ejercicio`);
    const {name, description, executionTime} = req.body;
  
  
  if (!name || !description) {
    console.log('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'nombre y descripcion son requeridos' });
  }
  const result = await pool.query(
    'UPDATE exercises SET name = $1, description = $2, execution_time = $3 WHERE id = $4 RETURNING *',
    [name, description, executionTime ? parseInt(executionTime) : null, id]
  );


  if (result.rows.length === 0) {
    console.log(`ejercicio con ID ${id} no encontrado`);
    return res.status(404).json({ error: 'ejercicio no encontrado' });
  }

  console.log(`ejercicio actualizado: ${name}`);
  res.json(result.rows[0]);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Error al actualizar ejercicio' });
}
});

// Eliminar un ejercicio
router.delete('/:id', async (req, res) => {
  try {
  const {id} = req.params;
     console.log(`DELETE /api/exercises/${id} - Eliminando ejercicio`);
     const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 RETURNING name',
      [id]
    );

  if (result.rows.length === 0) {
     console.log(`ejercicio con ID ${id} no encontrado`);
     return res.status(404).json({ error: 'Ejercicio no encontrado' });

  }
     console.log(`ejercicio eliminado: ${result.rows[0].name}`);
     res.json({ message: 'ejercicio eliminado correctamente' });
     } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar ejercicio' });
  }
});

module.exports = router;

