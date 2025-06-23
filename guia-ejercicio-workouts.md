# Implementar Relación Workout-Exercise en Frontend

Hay que conectar los workouts con los ejercicios

El backend ya está listo con las rutas en `/api/workout_exercises`. La tabla intermedia maneja la relación muchos-a-muchos con las series y repeticiones.

Lo que hay que hacer:

1. Crear tipos TypeScript en `frontend/src/types/WorkoutExercise.ts`
   - Interface para enviar: workout_id, exercise_id, sets, reps
   - Interface para recibir: viene con todos los datos del ejercicio (mira qué devuelve el GET)

2. Crear servicio en `frontend/src/services/workoutExerciseService.ts`
   - getWorkoutExercises(workoutId) 
   - addExerciseToWorkout(data)
   - removeExerciseFromWorkout(linkId) - ojo que usa el link_id, no el exercise_id

3. Crear servicio de ejercicios en `frontend/src/services/exerciseService.ts`
   - CRUD básico como los otros servicios que ya existen

4. Crear componente WorkoutDetail en `frontend/src/components/Workouts/WorkoutDetail.tsx`
   
   Este es el más importante. Es un modal que:
   - Muestra info del workout
   - Lista los ejercicios que ya tiene con sus sets/reps
   - Botón para quitar ejercicios
   - Form para agregar: select de ejercicios + inputs de sets/reps
   
   Vas a necesitar:
   - Estado para todos los ejercicios disponibles
   - Estado para los ejercicios del workout actual
   - Estados del form (ejercicio seleccionado, sets, reps)
   - Función para cargar todo al abrir
   - Función para agregar (POST a la API)
   - Función para eliminar (DELETE a la API)
   
   Importante: filtrar del select los ejercicios que ya están en el workout

5. Actualizar WorkoutCard
   - Agregar prop onViewDetails
   - Agregar botón "Ver Ejercicios"

6. Actualizar WorkoutsPage
   - Estado para workout seleccionado
   - Función handleViewDetails
   - Renderizar WorkoutDetail cuando haya workout seleccionado

7. Actualizar WorkoutList
   - Solo pasar la nueva prop

Para probar:
- Crear workout
- Agregar varios ejercicios con diferentes sets/reps  
- Ver que no se puedan agregar duplicados
- Eliminar alguno y ver que vuelve al select
- Cerrar y abrir para ver que se guarha guardadodó

Hacerlo más completo:
- Mostrar contador de ejercicios en la card
- Sumar tiempo total de los ejercicios
- Poder editar sets/reps después de agregar