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