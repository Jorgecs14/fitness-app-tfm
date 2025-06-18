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

let diets = [
  {
    id: 1,
    nombre: 'Dieta Hipertrofia',
    descripcion: 'Alta en proteínas y calorías para ganar masa muscular.',
    calorias: 3000,
    proteinas: 150
  },
  {
    id: 2,
    nombre: 'Dieta Pérdida de Peso',
    descripcion: 'Baja en calorías y moderada en proteínas para perder peso de forma saludable.',
    calorias: 1500,
    proteinas: 100
  }
];

let nextDietId = 3;

app.get('/api/diets', (req, res) => {
  res.json(diets);
});

app.get('/api/diets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const diet = diets.find(d => d.id === id);

  if (!diet) {
    return res.status(404).json({ error: 'Dieta no encontrada' });
  }

  res.json(diet);
});

app.post('/api/diets', (req, res) => {
  const { nombre, descripcion, calorias, proteinas } = req.body;

  if (!nombre || !descripcion || calorias == null || proteinas == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const newDiet = {
    id: nextDietId++,
    nombre,
    descripcion,
    calorias,
    proteinas
  };

  diets.push(newDiet);
  res.status(201).json(newDiet);
});

app.put('/api/diets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, descripcion, calorias, proteinas } = req.body;

  const dietIndex = diets.findIndex(d => d.id === id);

  if (dietIndex === -1) {
    return res.status(404).json({ error: 'Dieta no encontrada' });
  }

  if (!nombre || !descripcion || calorias == null || proteinas == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  diets[dietIndex] = { id, nombre, descripcion, calorias, proteinas };
  res.json(diets[dietIndex]);
});

app.delete('/api/diets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dietIndex = diets.findIndex(d => d.id === id);

  if (dietIndex === -1) {
    return res.status(404).json({ error: 'Dieta no encontrada' });
  }

  diets.splice(dietIndex, 1);
  res.json({ message: 'Dieta eliminada correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

let products = [
  { 
    id: 1, 
    nombre: 'Toalla de baño', 
    precio: 2.99,
    descripcion: 'Toalla suave y absorbente',
    imagen: 'https://example.com/toalla.jpg'
  },
  { 
    id: 2, 
    nombre: 'Mancuernas', 
    precio: 22.99,
    descripcion: 'Mancuernas de hierro fundido',
    imagen: 'https://example.com/mancuernas.jpg'
  }
];

let nextProductId = 3;

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(product => product.id === id);
  
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { nombre, precio, descripcion, imagen } = req.body;
  
  if (!nombre || !precio || !descripcion || !imagen) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  const newProduct = {
    id: nextProductId++,
    nombre,
    precio,
    descripcion,
    imagen
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, precio, descripcion, imagen } = req.body;
  
  const productIndex = products.findIndex(product => product.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  if (!nombre || !precio || !descripcion || !imagen) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  products[productIndex] = { id, nombre, precio, descripcion, imagen };
  res.json(products[productIndex]);
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(product => product.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Producto eliminado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});