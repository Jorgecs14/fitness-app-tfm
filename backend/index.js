const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let clients = [
  { 
    id: 1, 
    nombre: 'Juan Pérez', 
    email: 'juan@email.com',
    telefono: '555-0101',
    objetivo: 'Perder peso'
  },
  { 
    id: 2, 
    nombre: 'María García', 
    email: 'maria@email.com',
    telefono: '555-0102',
    objetivo: 'Ganar músculo'
  }
];

let nextId = 3;

app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const client = clients.find(client => client.id === id);
  
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  res.json(client);
});

app.post('/api/clients', (req, res) => {
  const { nombre, email, telefono, objetivo } = req.body;
  
  if (!nombre || !email || !telefono || !objetivo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  const newClient = {
    id: nextId++,
    nombre,
    email,
    telefono,
    objetivo
  };
  
  clients.push(newClient);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email, telefono, objetivo } = req.body;
  
  const clientIndex = clients.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  if (!nombre || !email || !telefono || !objetivo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  clients[clientIndex] = { id, nombre, email, telefono, objetivo };
  res.json(clients[clientIndex]);
});

app.delete('/api/clients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const clientIndex = clients.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  clients.splice(clientIndex, 1);
  res.json({ message: 'Cliente eliminado correctamente' });
});

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