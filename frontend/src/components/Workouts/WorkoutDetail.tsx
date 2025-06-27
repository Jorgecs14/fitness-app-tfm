import React, { useEffect, useState } from 'react'
import { getWorkoutWithExercises } from '../../services/workoutService'
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises'

interface Props {
  workoutId: number
  onClose: () => void
}

export const WorkoutDetail: React.FC<Props> = ({ workoutId, onClose }) => {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const data = await getWorkoutWithExercises(workoutId)
        setWorkout(data)
      } catch (err) {
        setError('No se pudo cargar el entrenamiento')
      } finally {
        setLoading(false)
      }
    }

    loadWorkout()
  }, [workoutId])

  if (loading) return <p>Cargando entrenamiento...</p>
  if (error) return <p>{error}</p>
  if (!workout) return <p>Entrenamiento no encontrado</p>

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>{workout.name}</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            ✕
          </button>
        </div>

        <div className='mb-6'>
          <p className='text-gray-600'>Categoría: {workout.category}</p>
          {workout.notes && <p className='mt-2'>{workout.notes}</p>}
        </div>

        <div className='mb-6'>
          <h3 className='text-xl font-semibold mb-4'>Ejercicios</h3>
          {workout.exercises.length === 0 ? (
            <p className='text-gray-500'>No hay ejercicios asignados.</p>
          ) : (
            <ul className='space-y-3'>
              {workout.exercises.map((ex) => (
                <li
                  key={ex.link_id}
                  className='p-4 bg-gray-100 rounded shadow-sm'
                >
                  <h4 className='font-semibold'>{ex.name}</h4>
                  <p className='text-sm text-gray-600'>{ex.description}</p>
                  <p className='text-sm mt-1'>
                    Series: {ex.sets} | Reps: {ex.reps} | Tiempo:{' '}
                    {ex.execution_time}s
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
