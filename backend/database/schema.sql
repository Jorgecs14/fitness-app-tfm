-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.diet_foods (
  id integer NOT NULL DEFAULT nextval('diet_foods_id_seq'::regclass),
  diet_id integer,
  food_id integer,
  quantity integer NOT NULL,
  CONSTRAINT diet_foods_pkey PRIMARY KEY (id),
  CONSTRAINT diet_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id),
  CONSTRAINT diet_foods_diet_id_fkey FOREIGN KEY (diet_id) REFERENCES public.diets(id)
);
CREATE TABLE public.diets (
  id integer NOT NULL DEFAULT nextval('diets_id_seq'::regclass),
  name character varying,
  description text,
  calories smallint,
  CONSTRAINT diets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exercises (
  id integer NOT NULL DEFAULT nextval('exercises_id_seq'::regclass),
  name character varying,
  description text,
  execution_time integer,
  CONSTRAINT exercises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.foods (
  id integer NOT NULL DEFAULT nextval('foods_id_seq'::regclass),
  name text NOT NULL,
  description text,
  calories integer NOT NULL,
  CONSTRAINT foods_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  name character varying,
  description text,
  price numeric,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_diets (
  id integer NOT NULL DEFAULT nextval('user_diets_id_seq'::regclass),
  user_id integer NOT NULL,
  diet_id integer NOT NULL,
  assigned_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_diets_pkey PRIMARY KEY (id),
  CONSTRAINT user_diets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_diets_diet_id_fkey FOREIGN KEY (diet_id) REFERENCES public.diets(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  email character varying,
  name character varying,
  surname character varying,
  birth_date date,
  created_at timestamp without time zone DEFAULT now(),
  role character varying,
  auth_user_id uuid UNIQUE,
  weight numeric(5,2),
  height numeric(5,2),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT fk_users_auth_user_id FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_exercises (
  id integer NOT NULL DEFAULT nextval('workout_exercises_id_seq'::regclass),
  workout_id integer,
  exercise_id integer,
  sets integer,
  reps integer,
  CONSTRAINT workout_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id),
  CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.workouts (
  id integer NOT NULL DEFAULT nextval('workouts_id_seq'::regclass),
  user_id integer,
  name character varying,
  category character varying,
  notes text,
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Tabla para información médica del cliente (datos iniciales)
CREATE TABLE public.client_medical_info (
  id integer NOT NULL DEFAULT nextval('client_medical_info_id_seq'::regclass),
  user_id integer NOT NULL,
  allergies text,
  food_intolerances text,
  injuries_conditions text,
  disliked_foods text,
  lab_results text,
  daily_nutrition_log text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT client_medical_info_pkey PRIMARY KEY (id),
  CONSTRAINT client_medical_info_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabla para fotos de progreso del cliente
CREATE TABLE public.client_progress_photos (
  id integer NOT NULL DEFAULT nextval('client_progress_photos_id_seq'::regclass),
  user_id integer NOT NULL,
  photo_type character varying NOT NULL CHECK (photo_type IN ('front_arms_cross', 'side_arms_front', 'back_arms_cross')),
  photo_url text NOT NULL,
  photo_date date NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT client_progress_photos_pkey PRIMARY KEY (id),
  CONSTRAINT client_progress_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabla para seguimiento semanal del cliente
CREATE TABLE public.weekly_tracking (
  id integer NOT NULL DEFAULT nextval('weekly_tracking_id_seq'::regclass),
  user_id integer NOT NULL,
  week_start_date date NOT NULL,
  weight numeric(5,2),
  weight_photo_url text,
  chest_measurement numeric(5,2),
  waist_measurement numeric(5,2),
  hip_measurement numeric(5,2),
  thigh_measurement numeric(5,2),
  bicep_measurement numeric(5,2),
  diet_difficulties text,
  exercise_difficulties text,
  bowel_movements_per_week integer,
  daily_water_intake numeric(4,2),
  sleep_quality character varying CHECK (sleep_quality IN ('good', 'bad', 'regular')),
  training_days_completed integer,
  diet_deviations text,
  self_rating integer CHECK (self_rating >= 1 AND self_rating <= 10),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT weekly_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT weekly_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabla para seguimiento mensual del cliente
CREATE TABLE public.monthly_tracking (
  id integer NOT NULL DEFAULT nextval('monthly_tracking_id_seq'::regclass),
  user_id integer NOT NULL,
  month_date date NOT NULL,
  progress_photos_completed boolean DEFAULT false,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT monthly_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_client_medical_info_user_id ON public.client_medical_info(user_id);
CREATE INDEX idx_client_progress_photos_user_id ON public.client_progress_photos(user_id);
CREATE INDEX idx_client_progress_photos_date ON public.client_progress_photos(photo_date);
CREATE INDEX idx_weekly_tracking_user_id ON public.weekly_tracking(user_id);
CREATE INDEX idx_weekly_tracking_date ON public.weekly_tracking(week_start_date);
CREATE INDEX idx_monthly_tracking_user_id ON public.monthly_tracking(user_id);
CREATE INDEX idx_monthly_tracking_date ON public.monthly_tracking(month_date);
