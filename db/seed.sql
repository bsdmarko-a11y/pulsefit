-- PulseFit sample data. Safe to run repeatedly: every insert is idempotent.

-- 30 exercises, 5 per muscle group ------------------------------------------

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  ('Barbell Bench Press',      'Chest',  4, '8-10',      'Intermediate', 90,  'Flat barbell press. Shoulder blades pinned, bar to mid-chest, drive through the floor.'),
  ('Incline Dumbbell Press',   'Chest',  3, '10-12',     'Beginner',     75,  'Bench at 30 degrees. Keeps tension on the upper chest without wrecking the shoulders.'),
  ('Cable Fly',                'Chest',  3, '12-15',     'Beginner',     60,  'Slight bend in the elbows, squeeze at the midline. Chase the stretch, not the weight.'),
  ('Weighted Dip',             'Chest',  4, '6-8',       'Advanced',     90,  'Lean forward to bias the chest. Add weight only once ten clean bodyweight reps are easy.'),
  ('Push-up',                  'Chest',  3, '15-20',     'Beginner',     45,  'Hands under the shoulders, body in one line. Elevate your feet to make it harder.'),

  ('Deadlift',                 'Back',   5, '3-5',       'Advanced',     150, 'Hip hinge from the floor. Brace hard, bar close to the shins, finish tall without leaning back.'),
  ('Pull-up',                  'Back',   4, '6-10',      'Intermediate', 90,  'Full hang to chin over the bar. Band assistance is fine while you build the first few.'),
  ('Barbell Row',              'Back',   4, '8-10',      'Intermediate', 90,  'Torso near parallel, pull to the lower ribs. Keep the lower back flat throughout.'),
  ('Lat Pulldown',             'Back',   3, '10-12',     'Beginner',     60,  'Drive the elbows down and back. Avoid swinging the torso for extra reps.'),
  ('Seated Cable Row',         'Back',   3, '10-12',     'Beginner',     60,  'Chest tall, pull to the navel, pause for a second at the squeeze.'),

  ('Back Squat',               'Legs',   5, '5',         'Advanced',     150, 'Bar on the upper back, break at hips and knees together, hit depth before driving up.'),
  ('Romanian Deadlift',        'Legs',   4, '8-10',      'Intermediate', 90,  'Soft knees, push the hips back, stop when the hamstrings run out of stretch.'),
  ('Bulgarian Split Squat',    'Legs',   3, '10 / side', 'Intermediate', 75,  'Rear foot elevated. Brutal for balance and single-leg strength.'),
  ('Leg Press',                'Legs',   4, '10-12',     'Beginner',     75,  'Feet shoulder-width on the platform. Never lock the knees out hard at the top.'),
  ('Walking Lunge',            'Legs',   3, '12 / side', 'Beginner',     60,  'Long steps, upright torso, back knee just off the floor.'),

  ('Barbell Curl',             'Arms',   3, '10-12',     'Beginner',     60,  'Elbows pinned at the sides. Control the way down, it is where the growth is.'),
  ('Skull Crusher',            'Arms',   3, '10-12',     'Intermediate', 60,  'EZ bar to the forehead, upper arms still. Go light before you go heavy.'),
  ('Hammer Curl',              'Arms',   3, '12',        'Beginner',     45,  'Neutral grip. Builds the brachialis and makes the arm look thicker from the side.'),
  ('Triceps Pushdown',         'Arms',   4, '12-15',     'Beginner',     45,  'Elbows locked to the ribs, full extension, slow return.'),
  ('Close-Grip Bench Press',   'Arms',   4, '8-10',      'Advanced',     90,  'Hands shoulder-width. The heaviest triceps builder you can safely load.'),

  ('Hanging Leg Raise',        'Core',   3, '12-15',     'Intermediate', 60,  'Dead hang, raise the legs without swinging. Bend the knees to scale it down.'),
  ('Weighted Plank',           'Core',   3, '60 s',      'Intermediate', 60,  'Plate on the upper back. Squeeze glutes, do not let the hips sag.'),
  ('Cable Woodchop',           'Core',   3, '12 / side', 'Beginner',     45,  'Rotate from the torso, not the arms. Great for the obliques.'),
  ('Ab Rollout',               'Core',   3, '8-10',      'Advanced',     75,  'Wheel or barbell. Keep the ribs down, go only as far as you can come back from.'),
  ('Dead Bug',                 'Core',   3, '10 / side', 'Beginner',     45,  'Lower back glued to the floor. Slow and deliberate beats fast and sloppy.'),

  ('Rowing Intervals',         'Cardio', 6, '500 m',     'Advanced',     120, 'Hard 500s off two minutes rest. Legs, then back, then arms on every stroke.'),
  ('Assault Bike Sprints',     'Cardio', 8, '20 s',      'Advanced',     100, 'All-out twenty seconds, easy pedal in between. The most honest machine in the gym.'),
  ('Incline Treadmill Walk',   'Cardio', 1, '30 min',    'Beginner',     0,   'Twelve percent incline at a steady walk. Conversation pace, no hands on the rails.'),
  ('Jump Rope',                'Cardio', 5, '2 min',     'Intermediate', 60,  'Light on the toes, wrists doing the work. Double-unders when you are ready.'),
  ('Kettlebell Swing',         'Cardio', 5, '20',        'Intermediate', 60,  'Explosive hip snap to chest height. It is a hinge, not a squat.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  description  = EXCLUDED.description;

-- 10 classes in the current week --------------------------------------------
-- Times are anchored to Monday 00:00 of the current week, so re-running this
-- during the same week hits the UNIQUE (title, start_time) constraint
-- instead of creating duplicates.

WITH week AS (
  SELECT date_trunc('week', now()) AS monday
)
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT v.title, v.coach, week.monday + v.offset_hours, v.mins, v.cap, v.intensity
FROM week, (VALUES
  ('Sunrise Yoga',        'Ana Petrov',  INTERVAL '6 hours 30 minutes',           50, 20, 'Low'),
  ('HIIT Ignite',         'Luka Kovac',  INTERVAL '18 hours',                     45, 24, 'High'),
  ('Spin Sprint',         'Mia Horvat',  INTERVAL '1 day 7 hours',                45, 28, 'High'),
  ('Boxing Basics',       'Dino Maric',  INTERVAL '1 day 19 hours 30 minutes',    60, 16, 'Medium'),
  ('Strength Foundations','Sara Babic',  INTERVAL '2 days 17 hours',              60, 18, 'Medium'),
  ('HIIT Afterburn',      'Luka Kovac',  INTERVAL '2 days 17 hours 30 minutes',   40, 24, 'High'),
  ('Spin Endurance',      'Mia Horvat',  INTERVAL '3 days 6 hours 45 minutes',    60, 28, 'Medium'),
  ('Boxing Sparring',     'Dino Maric',  INTERVAL '3 days 20 hours',              60, 16, 'High'),
  ('Flow and Mobility',   'Ana Petrov',  INTERVAL '4 days 7 hours 30 minutes',    45, 20, 'Low'),
  ('Saturday Strength',   'Sara Babic',  INTERVAL '5 days 10 hours',              55, 18, 'High')
) AS v(title, coach, offset_hours, mins, cap, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
