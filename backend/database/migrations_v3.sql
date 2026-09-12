-- Migración V3: Asociación Entrenador-Cliente (trainer_id) en la tabla public.users

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS trainer_id integer REFERENCES public.users(id) ON DELETE SET NULL;

-- Índice para acelerar búsquedas de clientes por entrenador
CREATE INDEX IF NOT EXISTS idx_users_trainer_id ON public.users(trainer_id);
