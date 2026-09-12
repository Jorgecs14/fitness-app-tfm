const { pool } = require('./supabaseClient');

async function fixMediaUrls() {
  console.log('🔄 Comprobando URLs de multimedia de ejercicios en Neon DB...');
  
  const sample = await pool.query('SELECT id, name, gif_url, image_url FROM exercises LIMIT 5');
  console.log('Muestra actual:', sample.rows);

  // Actualizar gif_url que apunten a raw.githubusercontent o que contengan sólo el nombre de archivo
  const updateGifs = await pool.query(`
    UPDATE exercises 
    SET gif_url = REPLACE(
      gif_url, 
      'https://raw.githubusercontent.com/DuarteSantos8/openGym/main/media/exercises/', 
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/'
    )
    WHERE gif_url LIKE '%raw.githubusercontent.com%'
  `);
  console.log(`✅ Actualizados ${updateGifs.rowCount} gif_url con el CDN válido`);

  const updateImages = await pool.query(`
    UPDATE exercises 
    SET image_url = REPLACE(
      image_url, 
      'https://raw.githubusercontent.com/DuarteSantos8/openGym/main/media/exercises/', 
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/'
    )
    WHERE image_url LIKE '%raw.githubusercontent.com%'
  `);
  console.log(`✅ Actualizados ${updateImages.rowCount} image_url con el CDN válido`);

  // Comprobar resultado
  const afterSample = await pool.query('SELECT id, name, gif_url, image_url FROM exercises WHERE gif_url IS NOT NULL LIMIT 3');
  console.log('Muestra tras actualización:', afterSample.rows);

  await pool.end();
}

fixMediaUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
