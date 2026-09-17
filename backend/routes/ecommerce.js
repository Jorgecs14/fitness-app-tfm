/**
 * Rutas para gestionar productos de e-commerce en la aplicación fitness-app-tfm
 * Incluye CRUD completo para productos con nombre, descripción y precio
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id')
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar producto' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, description, price, url, image_url, category, trainer_id } = req.body

    if (!name) {
      return res.status(400).json({ error: 'El nombre del producto es requerido' })
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        price: Number(price) || 0,
        url: url || null,
        image_url: image_url || null,
        category: category || 'Suplementos',
        trainer_id: trainer_id || null
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error: 'Error al crear producto' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, url, image_url, category, trainer_id } = req.body

    const updatePayload = {}
    if (name !== undefined) updatePayload.name = name
    if (description !== undefined) updatePayload.description = description
    if (price !== undefined) updatePayload.price = Number(price)
    if (url !== undefined) updatePayload.url = url
    if (image_url !== undefined) updatePayload.image_url = image_url
    if (category !== undefined) updatePayload.category = category
    if (trainer_id !== undefined) updatePayload.trainer_id = trainer_id

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (!data) return res.status(404).json({ error: 'Producto no encontrado' })

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('name')
      .single()
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' })
    if (error) throw error
    res.json({
      message: `Producto ${data.name} eliminado correctamente`
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
})

module.exports = router
