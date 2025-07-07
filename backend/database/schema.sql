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
