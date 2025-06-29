/**
 * Main API server for the Fitness Management System
 * @description Backend handling clients, diets, workouts and products
 */


const express = require('express')
const cors = require('cors')
const usersRouter = require('./routes/users')
const dietsRouter = require('./routes/diets')
const foodsRouter = require('./routes/foods')
const dietFoodsRouter = require('./routes/diet_foods')
const workoutsRouter = require('./routes/workouts')
const exercisesRouter = require('./routes/exercises')
const workoutsExercisesRouter = require('./routes/workouts_exercises')
const ecommerceRouter = require('./routes/ecommerce')


const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`)
  next()
})

app.use('/api/users', usersRouter)
app.use('/api/diets', dietsRouter)
app.use('/api/foods', foodsRouter)
app.use('/api/diet_foods', dietFoodsRouter)
app.use('/api/workouts', workoutsRouter)
app.use('/api/products', ecommerceRouter)
app.use('/api/exercises', exercisesRouter)
app.use('/api/workouts_exercises', workoutsExercisesRouter)

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
  console.log('Endpoints disponibles:')
  console.log('  - /api/users')
  console.log('  - /api/diets')
  console.log('  - /api/foods')
  console.log('  - /api/diet_foods')
  console.log('  - /api/workouts')
  console.log('  - /api/products')
  console.log('  - /api/exercises')
  console.log('  - /api/workouts_exercises')
})

