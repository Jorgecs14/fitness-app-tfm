const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');


router.get('/', async (req, res) => {
  try {
    console.log('GET /api/users - Obteniendo todos los usuarios');
    const { data, error } = await supabase.from('users').select('*').order('id');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role } = req.body;

    if (!email || !password || !name || !surname) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data, error } = await supabase.from('users').insert([
      { email, password, name, surname, birth_date, role: role || 'client' }
    ]).select().single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, surname, birth_date, role } = req.body;

    const { data, error } = await supabase.from('users')
      .update({ email, name, surname, birth_date, role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from('users')
      .delete()
      .eq('id', id)
      .select('email')
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: `Usuario ${data.email} eliminado correctamente` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;