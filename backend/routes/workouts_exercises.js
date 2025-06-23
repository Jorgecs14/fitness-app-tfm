const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// Obtener todos los ejercicios de un workout
router.get('/workout/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    console.log(`GET /api/workout_exercises/workout/${workoutId} - Listando ejercicios`);

    const result = await pool.query(`
       SELECT 
        workouts_exercises.id AS link_id,
        workouts_exercises.sets,
        workouts_exercises.reps,
        exercises.id,
        exercises.name,
        exercises.description,
        exercises.execution_time
      FROM workouts_exercises
      JOIN exercises ON workouts_exercises.exercise_id = exercises.id
      WHERE workouts_exercises.workout_id = $1`, 
      [workoutId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ejercicios del workout:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios del entrenamiento' });
  }
});

// Agregar un ejercicio a un workout
router.post('/', async (req, res) => {
  try {
    const { workout_id, exercise_id, sets, reps } = req.body;

    if (!workout_id || !exercise_id) {
      return res.status(400).json({ error: 'Se requieren workout_id y exercise_id' });
    }

    const result = await pool.query(`
      INSERT INTO workouts_exercises (workout_id, exercise_id, sets, reps)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [workout_id, exercise_id, sets || null, reps || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al vincular ejercicio al entrenamiento:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Este ejercicio ya está vinculado a este entrenamiento' });
    } else {
      res.status(500).json({ error: 'Error interno al agregar ejercicio al entrenamiento' });
    }
  }
});

// Eliminar un ejercicio de un workout
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/workout_exercises/${id} - Eliminando vínculo`);

    const result = await pool.query(
      'DELETE FROM workouts_exercises WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asociación no encontrada' });
    }

    res.json({ message: 'Ejercicio eliminado del entrenamiento correctamente' });
  } catch (error) {
    console.error('Error al eliminar ejercicio del workout:', error);
    res.status(500).json({ error: 'Error interno al eliminar el ejercicio' });
  }
});

module.exports = router;
