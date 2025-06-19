const express = require('express');
const router = express.Router();
const pool = require('../database/db');

/**
 * GET all clients from database
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/clients - Obteniendo todos los clientes');
    const result = await pool.query('SELECT * FROM clients ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

/**
 * GET client by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/clients/${id} - Buscando cliente`);
    
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      console.log(`Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
});

/**
 * CREATE new client
 */
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/clients - Creando nuevo cliente');
    const { nombre, email, telefono, objetivo } = req.body;
    
    // Validate required fields
    if (!nombre || !email || !telefono || !objetivo) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const result = await pool.query(
      'INSERT INTO clients (nombre, email, telefono, objetivo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, telefono, objetivo]
    );
    
    console.log(`Cliente creado: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear cliente' });
    }
  }
});

/**
 * UPDATE client
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/clients/${id} - Actualizando cliente`);
    const { nombre, email, telefono, objetivo } = req.body;
    
    // Validate required fields
    if (!nombre || !email || !telefono || !objetivo) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const result = await pool.query(
      'UPDATE clients SET nombre = $1, email = $2, telefono = $3, objetivo = $4 WHERE id = $5 RETURNING *',
      [nombre, email, telefono, objetivo, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    console.log(`Cliente actualizado: ${nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

/**
 * DELETE client
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/clients/${id} - Eliminando cliente`);
    
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING nombre',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    console.log(`Cliente eliminado: ${result.rows[0].nombre}`);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;