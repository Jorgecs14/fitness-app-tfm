/**
 * Rutas para gestionar ejercicios en la aplicación fitness-app-tfm
 * Incluye CRUD completo y filtrado avanzado para 1,300+ ejercicios con imágenes/GIFs y metadatos musculares.
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { q, search, body_part, target_muscle, equipment, page, limit } = req.query
    let query = supabase.from('exercises').select('*', { count: 'exact' })

    const searchTerm = q || search
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }

    if (body_part) {
      query = query.eq('body_part', body_part)
    }

    if (target_muscle) {
      query = query.eq('target_muscle', target_muscle)
    }

    if (equipment) {
      query = query.eq('equipment', equipment)
    }

    query = query.order('name', { ascending: true })

    if (page && limit) {
      const pageNum = parseInt(page) || 1
      const limitNum = parseInt(limit) || 20
      const from = (pageNum - 1) * limitNum
      const to = from + limitNum - 1

      query = query.range(from, to)

      const { data, count, error } = await query
      if (error) throw error

      return res.json({
        data,
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      })
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ejercicios', details: err.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('body_part, target_muscle, equipment')

    if (error) throw error

    const bodyParts = [...new Set(data.map(item => item.body_part).filter(Boolean))]
    const targetMuscles = [...new Set(data.map(item => item.target_muscle).filter(Boolean))]
    const equipments = [...new Set(data.map(item => item.equipment).filter(Boolean))]

    res.json({
      bodyParts,
      targetMuscles,
      equipments
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías de ejercicios' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar ejercicio' })
  }
})

router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      execution_time,
      body_part,
      equipment,
      target_muscle,
      main_muscle_group,
      secondary_muscles,
      instructions,
      image_url,
      gif_url
    } = req.body

    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        name,
        description,
        execution_time: execution_time || 60,
        slug,
        body_part,
        equipment,
        target_muscle,
        main_muscle_group,
        secondary_muscles: secondary_muscles || [],
        instructions: instructions || [],
        image_url,
        gif_url
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ejercicio', details: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      execution_time,
      body_part,
      equipment,
      target_muscle,
      main_muscle_group,
      secondary_muscles,
      instructions,
      image_url,
      gif_url
    } = req.body

    const updateFields = {
      name,
      description,
      execution_time,
      body_part,
      equipment,
      target_muscle,
      main_muscle_group,
      secondary_muscles,
      instructions,
      image_url,
      gif_url
    }

    if (name) {
      updateFields.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    // Remover campos undefined
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key])

    const { data, error } = await supabase
      .from('exercises')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ejercicio', details: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Ejercicio no encontrado' })
    res.json({ message: `Ejercicio "${data.name}" eliminado correctamente` })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ejercicio' })
  }
})

module.exports = router

