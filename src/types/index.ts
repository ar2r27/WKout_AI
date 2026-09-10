export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'mobility' | 'calisthenics';
  daysPerWeek: number;
  sessionDuration: number; // min
  splitPreference: 'fbw' | 'ppl' | 'upper_lower' | 'bro_split' | 'ai_recommend';
  equipment: string[];
  customEquipment: string[];
  injuries: string;
  notes: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  category: 'compound' | 'isolation' | 'machine' | 'cable' | 'bodyweight' | 'cardio';
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  tips: string;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  targetSets: number;
  targetReps: string; // e.g. "8-10", "12-15", "5"
  targetRpe?: number; // 6-10
  restSeconds: number; // default 60-120
  notes?: string;
  alternatives?: string[];
}

export interface WorkoutDay {
  id: string;
  name: string;
  targetFocus: string; // e.g. "Klatka + Triceps + Przód barku"
  estimatedDuration: number; // min
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  goal: string;
  level: string;
  days: WorkoutDay[];
  author: 'ai' | 'user';
}

export interface WorkoutSetLog {
  setNum: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isPr?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: WorkoutSetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  planTitle: string;
  dayId: string;
  dayName: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  exercises: ExerciseLog[];
  totalVolumeKg: number;
  totalSets: number;
  completed: boolean;
  fatigueRating?: number; // 1-5
  difficultyRating?: number; // 1-5
  notes?: string;
  coachFeedback?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: {
    type: 'plan_proposal' | 'exercise_swap' | 'workout_feedback' | 'tip';
    planData?: WorkoutPlan;
    swapData?: { original: string; replacement: string; reason: string };
  };
}

export interface GoogleDriveConfig {
  isConnected: boolean;
  clientId: string;
  userEmail?: string;
  lastBackupDate?: string;
  autoBackup: boolean;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  coachPersona: 'motivational' | 'analytical' | 'strict' | 'friendly';
  coachName: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  googleDrive: GoogleDriveConfig;
  theme: 'dark' | 'light';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  plans: WorkoutPlan[];
  activePlanId: string | null;
  workoutSessions: WorkoutSession[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
}
