const express = require('express');
const cors = require('cors');
const clientsRouter = require('./routes/clients');
const dietsRouter = require('./routes/diets');
const workoutsRouter = require('./routes/workouts');
const ecommerceRouter = require('./routes/ecommerce'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientsRouter);
app.use('/api/diets', dietsRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/products', ecommerceRouter);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});