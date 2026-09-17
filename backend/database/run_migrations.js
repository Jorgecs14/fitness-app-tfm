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

    `CREATE INDEX IF NOT EXISTS idx_meal_checks_user_date ON public.meal_checks(user_id, check_date);`,

    // 6. Tabla trainer_plans (Planes y tarifas independientes por entrenador)
    `CREATE TABLE IF NOT EXISTS public.trainer_plans (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      billing_period VARCHAR(20) DEFAULT 'monthly',
      is_active BOOLEAN DEFAULT true,
      stripe_price_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    `CREATE INDEX IF NOT EXISTS idx_trainer_plans_trainer_id ON public.trainer_plans(trainer_id);`,

    // 7. Tabla client_subscriptions (Suscripciones activas de clientes con su entrenador)
    `CREATE TABLE IF NOT EXISTS public.client_subscriptions (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      trainer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      plan_id INTEGER REFERENCES public.trainer_plans(id) ON DELETE SET NULL,
      status VARCHAR(30) DEFAULT 'active',
      payment_type VARCHAR(20) DEFAULT 'manual',
      monthly_amount NUMERIC(10, 2) NOT NULL,
      current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
      cancel_at_period_end BOOLEAN DEFAULT false,
      canceled_at TIMESTAMP WITH TIME ZONE,
      last_payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      card_last4 VARCHAR(4),
      card_brand VARCHAR(30),
      card_exp_month INTEGER,
      card_exp_year INTEGER,
      stripe_subscription_id VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT unique_client_subscription UNIQUE (client_id)
    );`,

    `CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client ON public.client_subscriptions(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_client_subscriptions_trainer ON public.client_subscriptions(trainer_id);`,

    // 8. Tabla payment_invoices (Historial de recibos y facturas)
    `CREATE TABLE IF NOT EXISTS public.payment_invoices (
      id SERIAL PRIMARY KEY,
      subscription_id INTEGER REFERENCES public.client_subscriptions(id) ON DELETE SET NULL,
      client_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      trainer_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      invoice_number VARCHAR(50) UNIQUE,
      amount NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'EUR',
      status VARCHAR(30) DEFAULT 'paid',
      payment_method VARCHAR(50) DEFAULT 'card',
      payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      period_start TIMESTAMP WITH TIME ZONE,
      period_end TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      invoice_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,

    `CREATE INDEX IF NOT EXISTS idx_payment_invoices_client ON public.payment_invoices(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payment_invoices_trainer ON public.payment_invoices(trainer_id);`
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
