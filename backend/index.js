/**
 * Servidor principal de la aplicación fitness-app-tfm
 * Configura Express con CORS y rutas para gestionar usuarios, dietas, entrenamientos, ejercicios y productos
 * Utiliza autenticación JWT de Supabase para proteger las rutas
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { authenticateToken } = require('./middleware/auth')
const usersRouter = require('./routes/users')
const dietsRouter = require('./routes/diets')
const workoutsRouter = require('./routes/workouts')
const exercisesRouter = require('./routes/exercises')
const workoutsExercisesRouter = require('./routes/workouts_exercises')
const ecommerceRouter = require('./routes/ecommerce')
const foodsRouter = require('./routes/foods')
const dietFoodsRouter = require('./routes/diet_foods')

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/diets', authenticateToken, dietsRouter)
app.use('/api/workouts', authenticateToken, workoutsRouter)
app.use('/api/products', authenticateToken, ecommerceRouter)
app.use('/api/exercises', authenticateToken, exercisesRouter)
app.use('/api/workouts_exercises', authenticateToken, workoutsExercisesRouter)
app.use('/api/foods', authenticateToken, foodsRouter)
app.use('/api/diet_foods', authenticateToken, dietFoodsRouter)

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})
