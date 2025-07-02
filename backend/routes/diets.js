const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabaseClient');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('diets').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dietas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('diets').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar dieta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body;
    if (!name || !description || !calories) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const { data, error } = await supabase.from('diets').insert([{ name, description, calories }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear dieta' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, calories } = req.body;
    if (!name || !description || !calories) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const { data, error } = await supabase.from('diets').update({ name, description, calories }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar dieta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('diets').delete().eq('id', id).select('name').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json({ message: 'Dieta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar dieta' });
  }
});


router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Backend: Obteniendo usuarios para dieta ${id}`);
    
    const { data, error } = await supabase
      .from('user_diets')
      .select('user_id, users(id, name, surname, email)')
      .eq('diet_id', id);
      
    if (error) {
      console.error('❌ Error en Supabase al obtener usuarios:', error);
      throw error;
    }
    
    const users = data.map(item => item.users);
    console.log(`👥 Usuarios obtenidos: ${users.length}`);
    console.log('📋 Datos:', users);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error al obtener usuarios de la dieta:', error);
    res.status(500).json({ error: 'Error al obtener usuarios de la dieta' });
  }
});


router.post('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    console.log(`🔗 Backend: Asignando usuario ${userId} a dieta ${id}`);
    
    const { data, error } = await supabase
      .from('user_diets')
      .insert([{ diet_id: id, user_id: userId }])
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error en Supabase:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'El usuario ya está asignado a esta dieta' });
      }
      throw error;
    }
    
    console.log('✅ Usuario asignado correctamente:', data);
    res.status(201).json({ message: 'Usuario asignado correctamente', data });
  } catch (error) {
    console.error('❌ Error al asignar usuario a la dieta:', error);
    res.status(500).json({ error: 'Error al asignar usuario a la dieta' });
  }
});


router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { data, error } = await supabase
      .from('user_diets')
      .delete()
      .eq('diet_id', id)
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ message: 'Usuario removido de la dieta correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al remover usuario de la dieta' });
  }
});

module.exports = router;