-- PulseFit schema. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS users (
  id                    SERIAL PRIMARY KEY,
  email                 TEXT NOT NULL UNIQUE,
  password_hash         TEXT NOT NULL,
  full_name             TEXT NOT NULL,
  weekly_goal_workouts  INTEGER NOT NULL DEFAULT 5,
  weekly_goal_minutes   INTEGER NOT NULL DEFAULT 400,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  muscle_group  TEXT NOT NULL CHECK (muscle_group IN ('Chest','Back','Legs','Arms','Core','Cardio')),
  sets          INTEGER NOT NULL DEFAULT 3,
  reps          TEXT NOT NULL,
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  rest_seconds  INTEGER NOT NULL DEFAULT 60,
  description   TEXT
);

CREATE TABLE IF NOT EXISTS workouts (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  workout_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status           TEXT NOT NULL DEFAULT 'planned'
                     CHECK (status IN ('planned','in_progress','completed')),
  duration_minutes INTEGER,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id           SERIAL PRIMARY KEY,
  workout_id   INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (workout_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id                   SERIAL PRIMARY KEY,
  workout_exercise_id  INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number           INTEGER NOT NULL,
  completed            BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at         TIMESTAMPTZ,
  UNIQUE (workout_exercise_id, set_number)
);

CREATE TABLE IF NOT EXISTS classes (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  coach_name       TEXT NOT NULL,
  start_time       TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  capacity         INTEGER NOT NULL DEFAULT 20,
  intensity        TEXT NOT NULL DEFAULT 'Medium'
                     CHECK (intensity IN ('Low','Medium','High')),
  UNIQUE (title, start_time)
);

-- Indexes -------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_workouts_user_date      ON workouts (user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_status    ON workouts (user_id, status);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_wid   ON workout_exercises (workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_sets_wex        ON workout_sets (workout_exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_exercises_group         ON exercises (muscle_group);
CREATE INDEX IF NOT EXISTS idx_classes_start           ON classes (start_time);

-- One planned/active workout per user per day.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workouts_user_one_per_day
  ON workouts (user_id, workout_date);
