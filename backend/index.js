/**
 * Main API server for the Fitness Management System
 * @description Backend handling clients, diets, workouts and products
 */

const express = require('express');
const cors = require('cors');
const clientsRouter = require('./routes/clients');
const dietsRouter = require('./routes/diets');
const workoutsRouter = require('./routes/workouts');
const exercisesRouter = require('./routes/exercises');
const workoutsExercisesRouter = require('./routes/workouts_exercises');
const ecommerceRouter = require('./routes/ecommerce'); 

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend communication
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/clients', clientsRouter);
app.use('/api/diets', dietsRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/products', ecommerceRouter);
app.use('api/exercises', exercisesRouter);
app.use('api/workouts_exercises', workoutsExercisesRouter);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('  - /api/clients');
  console.log('  - /api/diets');
  console.log('  - /api/workouts');
  console.log('  - /api/products');
  console.log('  -/api/exercises');
  console.log('  -/api/workouts_exercises');
});