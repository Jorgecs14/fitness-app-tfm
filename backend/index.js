const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let clientes = [
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

app.get('/api/clientes', (req, res) => {
  res.json(clientes);
});

app.get('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(cliente => cliente.id === id);
  
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  res.json(cliente);
});

app.post('/api/clientes', (req, res) => {
  const { nombre, email, telefono, objetivo } = req.body;
  
  if (!nombre || !email || !telefono || !objetivo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  const newCliente = {
    id: nextId++,
    nombre,
    email,
    telefono,
    objetivo
  };
  
  clientes.push(newCliente);
  res.status(201).json(newCliente);
});

app.put('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email, telefono, objetivo } = req.body;
  
  const clienteIndex = clientes.findIndex(cliente => cliente.id === id);
  
  if (clienteIndex === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  if (!nombre || !email || !telefono || !objetivo) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  clientes[clienteIndex] = { id, nombre, email, telefono, objetivo };
  res.json(clientes[clienteIndex]);
});

app.delete('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const clienteIndex = clientes.findIndex(cliente => cliente.id === id);
  
  if (clienteIndex === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  clientes.splice(clienteIndex, 1);
  res.json({ message: 'Cliente eliminado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});