-- Migración V2: Expansión de Entrenamientos, Ejercicios e Historial de Sesiones en Vivo

-- 1. Campos adicionales para la tabla public.exercises
ALTER TABLE public.exercises 
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS body_part text,
  ADD COLUMN IF NOT EXISTS equipment text,
  ADD COLUMN IF NOT EXISTS target_muscle text,
  ADD COLUMN IF NOT EXISTS main_muscle_group text,
  ADD COLUMN IF NOT EXISTS secondary_muscles text[],
  ADD COLUMN IF NOT EXISTS instructions text[],
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS gif_url text;

-- 2. Campos adicionales para la tabla public.workout_exercises (rutinas avanzadas)
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rest_seconds integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS target_rpe numeric(3,1),
  ADD COLUMN IF NOT EXISTS intensifier_type character varying DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS intensifier_config jsonb,
  ADD COLUMN IF NOT EXISTS superset_id integer;

-- 3. Tabla para Sesiones Completadas (Logged Sessions)
CREATE TABLE IF NOT EXISTS public.logged_sessions (
  id integer NOT NULL DEFAULT nextval('logged_sessions_id_seq'::regclass),
  user_id integer NOT NULL,
  workout_id integer,
  name character varying NOT NULL,
  started_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  duration_seconds integer,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT logged_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT logged_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT logged_sessions_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE SET NULL
);

-- 4. Tabla para Series Registradas (Logged Sets)
CREATE TABLE IF NOT EXISTS public.logged_sets (
  id integer NOT NULL DEFAULT nextval('logged_sets_id_seq'::regclass),
  session_id integer NOT NULL,
  exercise_id integer,
  set_order integer NOT NULL,
  phase character varying DEFAULT 'work' CHECK (phase IN ('work', 'warmup')),
  type character varying DEFAULT 'straight' CHECK (type IN ('straight', 'dropset', 'restpause')),
  weight numeric(6,2),
  reps integer,
  rpe numeric(3,1),
  completed boolean DEFAULT true,
  extra_data jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT logged_sets_pkey PRIMARY KEY (id),
  CONSTRAINT logged_sets_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.logged_sessions(id) ON DELETE CASCADE,
  CONSTRAINT logged_sets_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL
);

-- Índices de rendimiento para logged_sessions y logged_sets
CREATE INDEX IF NOT EXISTS idx_logged_sessions_user_id ON public.logged_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_logged_sessions_workout_id ON public.logged_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_logged_sets_session_id ON public.logged_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_logged_sets_exercise_id ON public.logged_sets(exercise_id);
