const express = require('express')
const router = express.Router()
const supabase = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener entrenamientos' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data)
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar entrenamiento' })
  }
})

router.post('/', async (req, res) => {
  try {
    console.log('📦 Body recibido en POST /workouts:', req.body);
    const { user_id, name, category, notes } = req.body;

    if (!user_id || !name || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert([{ user_id, name, category, notes }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('🔥 Error en POST /workouts:', err); 
    res.status(500).json({ error: 'Error al crear entrenamiento' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, notes } = req.body

    const { data, error } = await supabase
      .from('workouts')
      .update({ name, category, notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar entrenamiento' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .select('name')
      .single()

    if (error) throw error
    if (!data)
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    res.json({
      message: `Entrenamiento "${data.name}" eliminado correctamente`
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar entrenamiento' })
  }
})

router.get('/:id/full', async (req, res) => {
  try {
    const { id } = req.params

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()

    if (workoutError) throw workoutError
    if (!workout)
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })

    const { data: workoutExercises, error: weError } = await supabase
      .from('workout_exercises')
      .select(
        'id, sets, reps, exercises(id, name, description, execution_time)'
      )
      .eq('workout_id', id)

    if (weError) throw weError

    const exercises = workoutExercises.map((item) => ({
      link_id: item.id,
      sets: item.sets,
      reps: item.reps,
      id: item.exercises.id,
      name: item.exercises.name,
      description: item.exercises.description,
      execution_time: item.exercises.execution_time
    }))

    res.json({ ...workout, exercises })
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Error al obtener el entrenamiento completo' })
  }
})

router.get('/:id/details', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();

    if (workoutError) throw workoutError;

    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        sets,
        reps,
        exercise_id,
        exercises:exercise_id (
          name,
          description,
          execution_time
        )
      `)
      .eq('workout_id', id);

    if (exercisesError) throw exercisesError;

    const flattenedExercises = exercises.map((ex) => ({
      link_id: ex.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      name: ex.exercises.name,
      description: ex.exercises.description,
      execution_time: ex.exercises.execution_time
    }));

    res.json({
      ...workout,
      exercises: flattenedExercises
    });
  } catch (err) {
    console.error('Error cargando detalles del entrenamiento:', err);
    res.status(500).json({ error: 'Error cargando detalles del entrenamiento' });
  }
});



module.exports = router
