-- Migración v4: Tabla para el seguimiento y check interactivo de comidas y retos alimenticios

CREATE TABLE IF NOT EXISTS meal_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diet_id INTEGER REFERENCES diets(id) ON DELETE CASCADE,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_key VARCHAR(50) NOT NULL,
    food_id INTEGER REFERENCES foods(id) ON DELETE SET NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_meal_check UNIQUE (user_id, check_date, meal_key, food_id)
);

CREATE INDEX IF NOT EXISTS idx_meal_checks_user_date ON meal_checks(user_id, check_date);
