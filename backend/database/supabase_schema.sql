-- ====================================
-- SCHEMA SUPABASE - FITNESS APP CRM
-- ====================================
-- Este archivo está optimizado para ejecutarse directamente en Supabase
-- Orden correcto de creación: tablas independientes primero, luego dependientes

-- ====================================
-- 1. TABLAS INDEPENDIENTES (sin FK)
-- ====================================

-- Tabla de alimentos
CREATE TABLE public.foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL
);

-- Tabla de ejercicios
CREATE TABLE public.exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  execution_time INTEGER
);

-- Tabla de dietas
CREATE TABLE public.diets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  calories SMALLINT
);

-- Tabla de productos
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price NUMERIC(10,2)
);

-- ====================================
-- 2. TABLA DE USUARIOS (con referencia a auth)
-- ====================================

-- Tabla de usuarios (conectada con auth.users de Supabase)
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255),
  surname VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  role VARCHAR(50),
  auth_user_id UUID UNIQUE,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  CONSTRAINT fk_users_auth_user_id FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ====================================
-- 3. TABLAS CON DEPENDENCIAS
-- ====================================

-- Relación dieta-alimentos
CREATE TABLE public.diet_foods (
  id SERIAL PRIMARY KEY,
  diet_id INTEGER REFERENCES public.diets(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL
);

-- Asignación de dietas a usuarios
CREATE TABLE public.user_diets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  diet_id INTEGER NOT NULL REFERENCES public.diets(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- Entrenamientos de usuarios
CREATE TABLE public.workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  category VARCHAR(100),
  notes TEXT
);

-- Ejercicios de entrenamientos
CREATE TABLE public.workout_exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER
);

-- ====================================
-- 4. NUEVAS TABLAS CRM (SEGUIMIENTO DE CLIENTES)
-- ====================================

-- Información médica del cliente
CREATE TABLE public.client_medical_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  allergies TEXT,
  food_intolerances TEXT,
  injuries_conditions TEXT,
  disliked_foods TEXT,
  lab_results TEXT,
  daily_nutrition_log TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fotos de progreso del cliente
CREATE TABLE public.client_progress_photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('front_arms_cross', 'side_arms_front', 'back_arms_cross')),
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seguimiento semanal del cliente
CREATE TABLE public.weekly_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  weight NUMERIC(5,2),
  weight_photo_url TEXT,
  chest_measurement NUMERIC(5,2),
  waist_measurement NUMERIC(5,2),
  hip_measurement NUMERIC(5,2),
  thigh_measurement NUMERIC(5,2),
  bicep_measurement NUMERIC(5,2),
  diet_difficulties TEXT,
  exercise_difficulties TEXT,
  bowel_movements_per_week INTEGER,
  daily_water_intake NUMERIC(4,2),
  sleep_quality VARCHAR(20) CHECK (sleep_quality IN ('good', 'bad', 'regular')),
  training_days_completed INTEGER,
  diet_deviations TEXT,
  self_rating INTEGER CHECK (self_rating >= 1 AND self_rating <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seguimiento mensual del cliente
CREATE TABLE public.monthly_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month_date DATE NOT NULL,
  progress_photos_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- ====================================

-- Índices para información médica
CREATE INDEX idx_client_medical_info_user_id ON public.client_medical_info(user_id);

-- Índices para fotos de progreso
CREATE INDEX idx_client_progress_photos_user_id ON public.client_progress_photos(user_id);
CREATE INDEX idx_client_progress_photos_date ON public.client_progress_photos(photo_date);

-- Índices para seguimiento semanal
CREATE INDEX idx_weekly_tracking_user_id ON public.weekly_tracking(user_id);
CREATE INDEX idx_weekly_tracking_date ON public.weekly_tracking(week_start_date);

-- Índices para seguimiento mensual
CREATE INDEX idx_monthly_tracking_user_id ON public.monthly_tracking(user_id);
CREATE INDEX idx_monthly_tracking_date ON public.monthly_tracking(month_date);

-- Índices adicionales para rendimiento
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_diet_foods_diet_id ON public.diet_foods(diet_id);
CREATE INDEX idx_diet_foods_food_id ON public.diet_foods(food_id);
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);

-- ====================================
-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ====================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_medical_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_tracking ENABLE ROW LEVEL SECURITY;

-- Política básica: los usuarios pueden ver sus propios datos
CREATE POLICY "Users can view own data" ON public.users
  FOR ALL USING (auth.uid() = auth_user_id);

-- Política para entrenadores: pueden ver datos de sus clientes
CREATE POLICY "Trainers can manage client data" ON public.users
  FOR ALL USING (
    auth.uid() = auth_user_id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'trainer'
    )
  );

-- Políticas similares para las demás tablas de seguimiento
CREATE POLICY "Users can manage own medical info" ON public.client_medical_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = client_medical_info.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own progress photos" ON public.client_progress_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = client_progress_photos.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own weekly tracking" ON public.weekly_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = weekly_tracking.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own monthly tracking" ON public.monthly_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = monthly_tracking.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

-- Políticas públicas para datos de catálogo
CREATE POLICY "Public read access" ON public.foods FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.diets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);

-- ====================================
-- 7. DATOS DE EJEMPLO (OPCIONAL)
-- ====================================

-- Insertar algunos alimentos de ejemplo
INSERT INTO public.foods (name, description, calories) VALUES
('Pollo a la plancha', 'Pechuga de pollo cocinada a la plancha', 165),
('Arroz integral', 'Arroz integral cocido', 111),
('Brócoli', 'Brócoli al vapor', 34),
('Salmón', 'Salmón a la plancha', 208),
('Aguacate', 'Aguacate fresco', 160);

-- Insertar algunos ejercicios de ejemplo
INSERT INTO public.exercises (name, description, execution_time) VALUES
('Flexiones', 'Flexiones de pecho en el suelo', 30),
('Sentadillas', 'Sentadillas con peso corporal', 45),
('Plancha', 'Plancha abdominal', 60),
('Burpees', 'Ejercicio completo de cuerpo', 40),
('Mountain Climbers', 'Escaladores de montaña', 30);

-- Insertar una dieta de ejemplo
INSERT INTO public.diets (name, description, calories) VALUES
('Dieta Equilibrada', 'Dieta balanceada para mantenimiento', 2000),
('Dieta Hipocalórica', 'Dieta para pérdida de peso', 1500),
('Dieta Hipercalórica', 'Dieta para ganancia de masa', 2500);

COMMIT;
