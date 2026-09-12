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
const clientMedicalInfoRouter = require('./routes/client_medical_info')
const clientProgressPhotosRouter = require('./routes/client_progress_photos')
const weeklyTrackingRouter = require('./routes/weekly_tracking')
const monthlyTrackingRouter = require('./routes/monthly_tracking')
const loggedSessionsRouter = require('./routes/logged_sessions')
const mealChecksRouter = require('./routes/meal_checks')

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir llamadas sin origin (curl, postman, llamadas servidor a servidor)
    if (!origin) return callback(null, true)
    const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : []
    if (allowed.length === 0 || allowed.includes('*') || allowed.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, true) // Por defecto permitir origin dinámico para credentials: true
  },
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

// Normalizador para rutas /api viniendo de rewrites de Vercel
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/'
  }
  next()
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Fitness App API Running' })
})
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.use('/users', usersRouter)
app.use('/diets', authenticateToken, dietsRouter)
app.use('/workouts', authenticateToken, workoutsRouter)
app.use('/products', authenticateToken, ecommerceRouter)
app.use('/exercises', authenticateToken, exercisesRouter)
app.use('/workouts_exercises', authenticateToken, workoutsExercisesRouter)
app.use('/foods', authenticateToken, foodsRouter)
app.use('/diet_foods', authenticateToken, dietFoodsRouter)
app.use('/client-medical-info', authenticateToken, clientMedicalInfoRouter)
app.use('/client-progress-photos', authenticateToken, clientProgressPhotosRouter)
app.use('/weekly-tracking', authenticateToken, weeklyTrackingRouter)
app.use('/monthly-tracking', authenticateToken, monthlyTrackingRouter)
app.use('/logged-sessions', authenticateToken, loggedSessionsRouter)
app.use('/meal-checks', authenticateToken, mealChecksRouter)


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
  })
}

module.exports = app

