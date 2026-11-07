export const brand = {
  name: "PulseFit",
  tagline: "Train smarter. Get stronger.",
};

export const user = {
  name: "Marko Novak",
  handle: "@marko.lifts",
  initials: "MN",
  membership: "Elite",
  memberSince: "Mar 2023",
  streak: 18,
  bestStreak: 34,
  weeklyGoal: 5,
  totalWorkouts: 412,
  totalMinutes: 19840,
  totalVolumeKg: 1284600,
};

export const heroStats = [
  { label: "Active members", value: 24850, suffix: "+" },
  { label: "Workouts completed", value: 1942300, suffix: "" },
  { label: "Classes this week", value: 186, suffix: "" },
];

export const quotes = [
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You dont have to be extreme, just consistent.", author: "PulseFit Coaches" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "Small steps every day beat giant leaps once a month.", author: "PulseFit Coaches" },
  { text: "The only bad workout is the one that never happened.", author: "Unknown" },
  { text: "Train for the body you want, not the one you have.", author: "PulseFit Coaches" },
];

export const quoteOfTheDay = quotes[new Date().getDay() % quotes.length];

export const weeklyActivity = [
  { day: "Mon", minutes: 52, volume: 7200 },
  { day: "Tue", minutes: 38, volume: 4800 },
  { day: "Wed", minutes: 0, volume: 0 },
  { day: "Thu", minutes: 64, volume: 9100 },
  { day: "Fri", minutes: 45, volume: 6400 },
  { day: "Sat", minutes: 78, volume: 11200 },
  { day: "Sun", minutes: 26, volume: 2100 },
];

export const strengthProgress = [
  { month: "May", bench: 72, squat: 100, deadlift: 120 },
  { month: "Jun", bench: 76, squat: 107, deadlift: 128 },
  { month: "Jul", bench: 78, squat: 112, deadlift: 135 },
  { month: "Aug", bench: 82, squat: 118, deadlift: 142 },
  { month: "Sep", bench: 85, squat: 124, deadlift: 150 },
  { month: "Oct", bench: 88, squat: 130, deadlift: 158 },
  { month: "Nov", bench: 92, squat: 136, deadlift: 165 },
];

export const bodyMetrics = [
  { month: "May", weight: 84.2, bodyFat: 19.4 },
  { month: "Jun", weight: 83.4, bodyFat: 18.6 },
  { month: "Jul", weight: 82.9, bodyFat: 17.9 },
  { month: "Aug", weight: 82.1, bodyFat: 17.0 },
  { month: "Sep", weight: 81.6, bodyFat: 16.2 },
  { month: "Oct", weight: 81.0, bodyFat: 15.5 },
  { month: "Nov", weight: 80.4, bodyFat: 14.8 },
];

export const personalRecords = [
  { lift: "Back Squat", value: 136, unit: "kg", date: "2 Nov 2026", delta: 6, tier: "gold" },
  { lift: "Deadlift", value: 165, unit: "kg", date: "28 Oct 2026", delta: 7, tier: "gold" },
  { lift: "Bench Press", value: 92, unit: "kg", date: "19 Oct 2026", delta: 4, tier: "silver" },
  { lift: "Overhead Press", value: 58, unit: "kg", date: "12 Oct 2026", delta: 3, tier: "silver" },
  { lift: "Weighted Pull-up", value: 32, unit: "kg", date: "4 Oct 2026", delta: 2, tier: "bronze" },
  { lift: "5K Run", value: 21.4, unit: "min", date: "1 Oct 2026", delta: -1.2, tier: "bronze" },
];

export const muscleGroups = ["All", "Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

export const exercises = [
  { id: "ex-1", name: "Barbell Bench Press", group: "Chest", sets: 4, reps: "8-10", difficulty: "Intermediate", equipment: "Barbell", minutes: 12, kcal: 96 },
  { id: "ex-2", name: "Incline Dumbbell Press", group: "Chest", sets: 3, reps: "10-12", difficulty: "Beginner", equipment: "Dumbbells", minutes: 10, kcal: 78 },
  { id: "ex-3", name: "Cable Fly", group: "Chest", sets: 3, reps: "12-15", difficulty: "Beginner", equipment: "Cable", minutes: 8, kcal: 60 },
  { id: "ex-4", name: "Weighted Dip", group: "Chest", sets: 4, reps: "6-8", difficulty: "Advanced", equipment: "Bodyweight", minutes: 10, kcal: 88 },
  { id: "ex-5", name: "Deadlift", group: "Back", sets: 5, reps: "3-5", difficulty: "Advanced", equipment: "Barbell", minutes: 16, kcal: 142 },
  { id: "ex-6", name: "Pull-up", group: "Back", sets: 4, reps: "6-10", difficulty: "Intermediate", equipment: "Bodyweight", minutes: 10, kcal: 92 },
  { id: "ex-7", name: "Barbell Row", group: "Back", sets: 4, reps: "8-10", difficulty: "Intermediate", equipment: "Barbell", minutes: 12, kcal: 104 },
  { id: "ex-8", name: "Lat Pulldown", group: "Back", sets: 3, reps: "10-12", difficulty: "Beginner", equipment: "Cable", minutes: 9, kcal: 70 },
  { id: "ex-9", name: "Back Squat", group: "Legs", sets: 5, reps: "5", difficulty: "Advanced", equipment: "Barbell", minutes: 18, kcal: 165 },
  { id: "ex-10", name: "Romanian Deadlift", group: "Legs", sets: 4, reps: "8-10", difficulty: "Intermediate", equipment: "Barbell", minutes: 12, kcal: 118 },
  { id: "ex-11", name: "Bulgarian Split Squat", group: "Legs", sets: 3, reps: "10 / side", difficulty: "Intermediate", equipment: "Dumbbells", minutes: 12, kcal: 110 },
  { id: "ex-12", name: "Leg Press", group: "Legs", sets: 4, reps: "10-12", difficulty: "Beginner", equipment: "Machine", minutes: 10, kcal: 96 },
  { id: "ex-13", name: "Barbell Curl", group: "Arms", sets: 3, reps: "10-12", difficulty: "Beginner", equipment: "Barbell", minutes: 8, kcal: 54 },
  { id: "ex-14", name: "Skull Crusher", group: "Arms", sets: 3, reps: "10-12", difficulty: "Intermediate", equipment: "EZ Bar", minutes: 8, kcal: 58 },
  { id: "ex-15", name: "Hammer Curl", group: "Arms", sets: 3, reps: "12", difficulty: "Beginner", equipment: "Dumbbells", minutes: 7, kcal: 50 },
  { id: "ex-16", name: "Triceps Pushdown", group: "Arms", sets: 4, reps: "12-15", difficulty: "Beginner", equipment: "Cable", minutes: 8, kcal: 56 },
  { id: "ex-17", name: "Hanging Leg Raise", group: "Core", sets: 3, reps: "12-15", difficulty: "Intermediate", equipment: "Bodyweight", minutes: 7, kcal: 62 },
  { id: "ex-18", name: "Weighted Plank", group: "Core", sets: 3, reps: "60 s", difficulty: "Intermediate", equipment: "Plate", minutes: 6, kcal: 48 },
  { id: "ex-19", name: "Cable Woodchop", group: "Core", sets: 3, reps: "12 / side", difficulty: "Beginner", equipment: "Cable", minutes: 8, kcal: 66 },
  { id: "ex-20", name: "Ab Rollout", group: "Core", sets: 3, reps: "8-10", difficulty: "Advanced", equipment: "Wheel", minutes: 6, kcal: 54 },
  { id: "ex-21", name: "Rowing Intervals", group: "Cardio", sets: 6, reps: "500 m", difficulty: "Advanced", equipment: "Erg", minutes: 22, kcal: 280 },
  { id: "ex-22", name: "Assault Bike Sprints", group: "Cardio", sets: 8, reps: "20 s", difficulty: "Advanced", equipment: "Air Bike", minutes: 14, kcal: 220 },
  { id: "ex-23", name: "Incline Treadmill Walk", group: "Cardio", sets: 1, reps: "30 min", difficulty: "Beginner", equipment: "Treadmill", minutes: 30, kcal: 240 },
  { id: "ex-24", name: "Jump Rope", group: "Cardio", sets: 5, reps: "2 min", difficulty: "Intermediate", equipment: "Rope", minutes: 12, kcal: 160 },
];

export const todaysWorkout = {
  title: "Push Day - Power Block",
  focus: "Chest / Shoulders / Triceps",
  durationMin: 48,
  kcal: 420,
  difficulty: "Intermediate",
  exercises: [
    { id: "w-1", name: "Barbell Bench Press", sets: 4, reps: 8, weight: 80, rest: 90 },
    { id: "w-2", name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 30, rest: 75 },
    { id: "w-3", name: "Overhead Press", sets: 4, reps: 6, weight: 52, rest: 90 },
    { id: "w-4", name: "Cable Fly", sets: 3, reps: 14, weight: 22, rest: 60 },
    { id: "w-5", name: "Triceps Pushdown", sets: 3, reps: 12, weight: 35, rest: 60 },
  ],
};

export const classes = [
  { id: "c-1", day: "Mon", name: "Sunrise Yoga", coach: "Ana Petrov", time: "06:30", duration: 50, intensity: "Low", spots: 6, capacity: 20, type: "Yoga" },
  { id: "c-2", day: "Mon", name: "HIIT Ignite", coach: "Luka Kovac", time: "18:00", duration: 45, intensity: "High", spots: 2, capacity: 24, type: "HIIT" },
  { id: "c-3", day: "Tue", name: "Spin Sprint", coach: "Mia Horvat", time: "07:00", duration: 45, intensity: "High", spots: 9, capacity: 28, type: "Spin" },
  { id: "c-4", day: "Tue", name: "Boxing Basics", coach: "Dino Maric", time: "19:30", duration: 60, intensity: "Medium", spots: 0, capacity: 16, type: "Boxing" },
  { id: "c-5", day: "Wed", name: "Power Yoga", coach: "Ana Petrov", time: "08:00", duration: 55, intensity: "Medium", spots: 11, capacity: 20, type: "Yoga" },
  { id: "c-6", day: "Wed", name: "HIIT Afterburn", coach: "Luka Kovac", time: "17:30", duration: 40, intensity: "High", spots: 4, capacity: 24, type: "HIIT" },
  { id: "c-7", day: "Thu", name: "Spin Endurance", coach: "Mia Horvat", time: "06:45", duration: 60, intensity: "Medium", spots: 14, capacity: 28, type: "Spin" },
  { id: "c-8", day: "Thu", name: "Boxing Sparring", coach: "Dino Maric", time: "20:00", duration: 60, intensity: "High", spots: 3, capacity: 16, type: "Boxing" },
  { id: "c-9", day: "Fri", name: "Flow and Mobility", coach: "Ana Petrov", time: "07:30", duration: 45, intensity: "Low", spots: 8, capacity: 20, type: "Yoga" },
  { id: "c-10", day: "Fri", name: "HIIT Finisher", coach: "Luka Kovac", time: "18:15", duration: 35, intensity: "High", spots: 1, capacity: 24, type: "HIIT" },
  { id: "c-11", day: "Sat", name: "Spin Rhythm Ride", coach: "Mia Horvat", time: "09:00", duration: 50, intensity: "Medium", spots: 12, capacity: 28, type: "Spin" },
  { id: "c-12", day: "Sat", name: "Boxing Conditioning", coach: "Dino Maric", time: "11:00", duration: 55, intensity: "High", spots: 5, capacity: 16, type: "Boxing" },
  { id: "c-13", day: "Sun", name: "Restore Yoga", coach: "Ana Petrov", time: "10:00", duration: 60, intensity: "Low", spots: 15, capacity: 20, type: "Yoga" },
];

export const classDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const achievements = [
  { id: "a-1", name: "Century Club", desc: "100 workouts logged", icon: "trophy", earned: true, tier: "gold" },
  { id: "a-2", name: "Iron Streak", desc: "14-day training streak", icon: "flame", earned: true, tier: "gold" },
  { id: "a-3", name: "Early Riser", desc: "25 sessions before 7am", icon: "sunrise", earned: true, tier: "silver" },
  { id: "a-4", name: "Heavy Hitter", desc: "Squat 1.5x bodyweight", icon: "dumbbell", earned: true, tier: "silver" },
  { id: "a-5", name: "Class Act", desc: "Attend 50 classes", icon: "calendar", earned: true, tier: "bronze" },
  { id: "a-6", name: "Marathon Mind", desc: "500 active minutes in a month", icon: "timer", earned: false, tier: "locked", progress: 68 },
  { id: "a-7", name: "Unbreakable", desc: "60-day training streak", icon: "shield", earned: false, tier: "locked", progress: 30 },
  { id: "a-8", name: "Volume King", desc: "Lift 2,000,000 kg lifetime", icon: "layers", earned: false, tier: "locked", progress: 64 },
];

export const recentSessions = [
  { id: "s-1", name: "Pull Day - Hypertrophy", date: "Yesterday", minutes: 54, kcal: 468, volume: 9120 },
  { id: "s-2", name: "Spin Sprint (class)", date: "2 days ago", minutes: 45, kcal: 512, volume: 0 },
  { id: "s-3", name: "Leg Day - Strength", date: "4 days ago", minutes: 68, kcal: 620, volume: 14250 },
  { id: "s-4", name: "Core and Mobility", date: "5 days ago", minutes: 32, kcal: 210, volume: 1840 },
];

export const dashboardRings = [
  { label: "Workouts", value: 4, target: 5, unit: "", tone: "lime" },
  { label: "Active minutes", value: 303, target: 400, unit: "min", tone: "cyan" },
  { label: "Goals hit", value: 7, target: 9, unit: "", tone: "violet" },
];
