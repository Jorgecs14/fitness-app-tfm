const { pool } = require('./supabaseClient')

async function runMigrations() {
  console.log('⚡ Ejecutando migraciones SQL en la base de datos Neon DB...')
  
  const migrations = [
    // 1. Columnas adicionales para users (trainer_id, weight, height)
    `ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS trainer_id integer REFERENCES public.users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS weight numeric(5,2),
      ADD COLUMN IF NOT EXISTS height numeric(5,2);`,

    `CREATE INDEX IF NOT EXISTS idx_users_trainer_id ON public.users(trainer_id);`,

    // 2. Columnas adicionales para exercises
    `ALTER TABLE public.exercises 
      ADD COLUMN IF NOT EXISTS slug text,
      ADD COLUMN IF NOT EXISTS body_part text,
      ADD COLUMN IF NOT EXISTS equipment text,
      ADD COLUMN IF NOT EXISTS target_muscle text,
      ADD COLUMN IF NOT EXISTS main_muscle_group text,
      ADD COLUMN IF NOT EXISTS secondary_muscles text[],
      ADD COLUMN IF NOT EXISTS instructions text[],
      ADD COLUMN IF NOT EXISTS image_url text,
      ADD COLUMN IF NOT EXISTS gif_url text;`,

    `CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises(slug);`,

    // 3. Columnas adicionales para workout_exercises
    `ALTER TABLE public.workout_exercises
      ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rest_seconds integer DEFAULT 60,
      ADD COLUMN IF NOT EXISTS target_rpe numeric(3,1),
      ADD COLUMN IF NOT EXISTS intensifier_type character varying DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS intensifier_config jsonb,
      ADD COLUMN IF NOT EXISTS superset_id integer;`,

    // 4. Tablas para sesiones completadas (logged_sessions y logged_sets)
    `CREATE TABLE IF NOT EXISTS public.logged_sessions (
      id SERIAL PRIMARY KEY,
      user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      workout_id integer REFERENCES public.workouts(id) ON DELETE SET NULL,
      name character varying NOT NULL,
      started_at timestamp without time zone DEFAULT now(),
      completed_at timestamp without time zone,
      duration_seconds integer,
      notes text,
      rating integer CHECK (rating >= 1 AND rating <= 5),
      created_at timestamp without time zone DEFAULT now()
    );`,

    `CREATE TABLE IF NOT EXISTS public.logged_sets (
      id SERIAL PRIMARY KEY,
      session_id integer NOT NULL REFERENCES public.logged_sessions(id) ON DELETE CASCADE,
      exercise_id integer REFERENCES public.exercises(id) ON DELETE SET NULL,
      set_order integer NOT NULL,
      phase character varying DEFAULT 'work',
      type character varying DEFAULT 'straight',
      weight numeric(6,2),
      reps integer,
      rpe numeric(3,1),
      completed boolean DEFAULT true,
      extra_data jsonb,
      created_at timestamp without time zone DEFAULT now()
    );`,

    // 5. Tabla meal_checks
    `CREATE TABLE IF NOT EXISTS public.meal_checks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      diet_id INTEGER REFERENCES public.diets(id) ON DELETE CASCADE,
      check_date DATE NOT NULL DEFAULT CURRENT_DATE,
      meal_key VARCHAR(50) NOT NULL,
      food_id INTEGER REFERENCES public.foods(id) ON DELETE SET NULL,
      completed BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_meal_check UNIQUE (user_id, check_date, meal_key, food_id)
    );`,

    `CREATE INDEX IF NOT EXISTS idx_meal_checks_user_date ON public.meal_checks(user_id, check_date);`
  ]

  for (let i = 0; i < migrations.length; i++) {
    try {
      await pool.query(migrations[i])
      console.log(`✅ Migración ${i + 1}/${migrations.length} ejecutada exitosamente.`)
    } catch (err) {
      console.error(`⚠️ Error en migración ${i + 1}:`, err.message)
    }
  }

  console.log('🎉 ¡Todas las migraciones se han completado!')
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 Error inesperado en migraciones:', err)
    process.exit(1)
  })
