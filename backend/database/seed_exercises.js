/**
 * Script para importar los 1,324 ejercicios de openGym hacia la base de datos Supabase de fitness-app-tfm
 */

const fs = require('fs');
const path = require('path');
const { supabase } = require('./supabaseClient');

// Ruta hacia el archivo exercises-data.js de openGym
const localDataPath = path.resolve(__dirname, './exercises-data.js');
const fallbackDataPath = path.resolve(__dirname, '../../../openGym/frontend/src/lib/exercises-data.js');
const openGymDataPath = fs.existsSync(localDataPath) ? localDataPath : fallbackDataPath;

async function seedExercises() {
  console.log('🚀 Iniciando importación de ejercicios desde openGym...');

  if (!fs.existsSync(openGymDataPath)) {
    console.error('❌ No se encontró el archivo de ejercicios en:', openGymDataPath);
    process.exit(1);
  }

  // Leer el contenido del JS de openGym
  const fileContent = fs.readFileSync(openGymDataPath, 'utf8');
  // Extraer el JSON de EXDB=[...]
  const jsonMatch = fileContent.match(/EXDB\s*=\s*(\[[\s\S]*\]);/);
  
  if (!jsonMatch) {
    console.error('❌ No se pudo parsear EXDB del archivo.');
    process.exit(1);
  }

  const rawExercises = JSON.parse(jsonMatch[1]);
  console.log(`📦 Se encontraron ${rawExercises.length} ejercicios en openGym.`);

  const seenSlugs = new Set();
  const formattedExercises = [];

  for (const item of rawExercises) {
    const name = item.n || 'Ejercicio sin nombre';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    const instructions = Array.isArray(item.st) ? item.st : [];
    const description = instructions.length > 0 ? instructions.join('\n') : (item.tg ? `Ejercicio para ${item.tg}` : '');

    formattedExercises.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description,
      execution_time: 60,
      slug,
      body_part: item.bp || null,
      equipment: item.eq || null,
      target_muscle: item.tg || null,
      main_muscle_group: item.mg || null,
      secondary_muscles: item.sm || [],
      instructions,
      image_url: item.img ? `https://raw.githubusercontent.com/DuarteSantos8/openGym/main/media/exercises/${item.img}` : null,
      gif_url: item.gif ? `https://raw.githubusercontent.com/DuarteSantos8/openGym/main/media/exercises/${item.gif}` : null,
    });
  }

  // Insertar en batches de 100 ejercicios
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < formattedExercises.length; i += batchSize) {
    const batch = formattedExercises.slice(i, i + batchSize);
    console.log(`⏳ Insertando lote ${Math.floor(i / batchSize) + 1} (${batch.length} ejercicios)...`);

    const { data, error } = await supabase
      .from('exercises')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false });

    if (error) {
      console.error(`⚠️ Error en lote ${i}:`, error.message);
    } else {
      totalInserted += batch.length;
    }
  }

  console.log(`✅ ¡Importación completada! Se procesaron ${totalInserted} ejercicios.`);
  process.exit(0);
}

seedExercises().catch((err) => {
  console.error('💥 Error inesperado:', err);
  process.exit(1);
});
