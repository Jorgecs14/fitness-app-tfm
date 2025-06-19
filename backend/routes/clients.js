const express = require('express');
const router = express.Router();

// In-memory database (array) - in production use a real database
let clients = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0101', objetivo: 'Perder peso' },
  { id: 2, nombre: 'María García', email: 'maria@email.com', telefono: '555-0102', objetivo: 'Ganar músculo' }
];

let nextId = 3;

/**
 * GET all clients
 * @route GET /api/clients
 * @returns {Array} List of all clients
 */
router.get('/', (req, res) => {
  console.log('GET /api/clients - Obteniendo todos los clientes');
  res.json(clients);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`GET /api/clients/${id} - Buscando cliente`);
  const client = clients.find(client => client.id === id);
  if (!client) {
    console.log(`Cliente con ID ${id} no encontrado`);
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  res.json(client);
});

/**
 * CREATE new client
 * @route POST /api/clients
 * @param {Object} req.body - Client data (nombre, email, telefono, objetivo)
 * @returns {Object} Created client with ID
 */
router.post('/', (req, res) => {
  console.log('POST /api/clients - Creando nuevo cliente');
  const { nombre, email, telefono, objetivo } = req.body;
  
  // Validate required fields
  if (!nombre || !email || !telefono || !objetivo) {
    console.log('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  // Create new client with auto-generated ID
  const newClient = { id: nextId++, nombre, email, telefono, objetivo };
  clients.push(newClient);
  console.log(`Cliente creado: ${newClient.nombre} (ID: ${newClient.id})`);
  res.status(201).json(newClient);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`PUT /api/clients/${id} - Actualizando cliente`);
  const { nombre, email, telefono, objetivo } = req.body;
  const clientIndex = clients.findIndex(client => client.id === id);
  if (clientIndex === -1) {
    console.log(`Cliente con ID ${id} no encontrado`);
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  if (!nombre || !email || !telefono || !objetivo) {
    console.log('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  clients[clientIndex] = { id, nombre, email, telefono, objetivo };
  console.log(`Cliente actualizado: ${nombre}`);
  res.json(clients[clientIndex]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`DELETE /api/clients/${id} - Eliminando cliente`);
  const clientIndex = clients.findIndex(client => client.id === id);
  if (clientIndex === -1) {
    console.log(`Cliente con ID ${id} no encontrado`);
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  const deletedClient = clients[clientIndex];
  clients.splice(clientIndex, 1);
  console.log(`Cliente eliminado: ${deletedClient.nombre}`);
  res.json({ message: 'Cliente eliminado correctamente' });
});

module.exports = router;