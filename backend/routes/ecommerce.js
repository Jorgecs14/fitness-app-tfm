const express = require('express');
const router = express.Router();

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

// Cambia las rutas a relativas
router.get('/', (req, res) => {
  res.json(products);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(product => product.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(product);
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(product => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Producto eliminado correctamente' });
});

module.exports = router;