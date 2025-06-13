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

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});