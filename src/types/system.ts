export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutTier = 1 | 2 | 3 | 4 | 5;
export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerStatus = 'prayed' | 'missed' | null;
export type AttributeKey = 'discipline' | 'knowledge' | 'strength' | 'consistency';
export type XpKey =
  | 'mainQuest'
  | 'workout'
  | 'prayer'
  | 'sideQuest'
  | 'sideBonus'
  | 'allDaily'
  | 'weekly';

export type PageId =
  | 'dashboard'
  | 'quests'
  | 'side'
  | 'prayer'
  | 'workout'
  | 'schedule'
  | 'rewards'
  | 'achievements'
  | 'progress'
  | 'report'
  | 'settings';

export interface QuestTemplate {
  title: string;
  category: string;
  attr: AttributeKey;
  xpKey?: XpKey;
  custom?: boolean;
  linkedToWorkout?: boolean;
}

export interface QuestItem {
  id: string;
  title: string;
  category: string;
  attr: AttributeKey;
  xpKey?: XpKey;
  done: boolean;
  grantedXp?: number;
  custom?: boolean;
  linkedToWorkout?: boolean;
}

export interface ScheduleSlot {
  id: string;
  time: string;
  name: string;
  icon: string;
  custom?: boolean;
}

export interface RealReward {
  id: string;
  name: string;
  redeemedCount: number;
}

export interface ExerciseLog {
  setsDone: boolean[];
  weightKg: number;
}

export interface DailyNotes {
  learned: string;
  improve: string;
}

export interface DayRecord {
  date: string;
  mainQuests: QuestItem[];
  sideQuests: QuestItem[];
  prayers: Record<PrayerKey, PrayerStatus>;
  prayerXP: Partial<Record<PrayerKey, number>>;
  workoutDone: boolean;
  workoutRest: boolean;
  workoutXpGranted: number;
  workoutTierUsed?: WorkoutTier;
  workoutDayIdx?: number;
  workoutLogs: Record<string, ExerciseLog>;
  sideBonusClaimed: boolean;
  allDailyClaimed: boolean;
  xpGained: number;
  notes: DailyNotes | null;
}

export interface XpValues {
  mainQuest: number;
  workout: number;
  prayer: number;
  sideQuest: number;
  sideBonus: number;
  allDaily: number;
  weekly: number;
}

export interface UserSettings {
  showIntro: boolean;
  sound: boolean;
  reduceMotion: boolean;
  weeklyGoal: number;
  xpValues: XpValues;
}

export interface PlayerInfo {
  id: string;
  name: string;
  fitnessLevel: FitnessLevel;
  hasDumbbells: boolean;
  dumbbellWeightKg: number;
  workoutTierOverride: WorkoutTier | null;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  createdAt: number;
}

export interface ProfileState {
  player: PlayerInfo;
  attributes: Record<AttributeKey, number>;
  settings: UserSettings;
  today: DayRecord;
  history: Record<string, DayRecord>;
  achievements: Record<string, { unlockedAt: number }>;
  customMainQuests: QuestTemplate[];
  customSideQuests: QuestTemplate[];
  customSchedule: ScheduleSlot[];
  realRewards: RealReward[];
  /** Days of week (0=Sunday .. 6=Saturday) marked as active training days */
  workoutDays: number[];
  totalWorkouts: number;
  totalQuests: number;
  totalPrayers: number;
  weekKey: string;
  weeklyClaimed: boolean;
  chestUnlocked: boolean;
  chestOpened: boolean;
  unlockedTitles: string[];
}

export interface MultiProfileStore {
  version: 3;
  activeProfileId: string;
  defaultProfileId: string;
  profiles: Record<string, ProfileState>;
}

export interface RankInfo {
  name: string;
  minLevel: number;
  color: string;
  desc: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  nameEn: string;
  muscleGroup: string;
  usesDumbbells: boolean;
  equipmentLabel: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  tempoNote: string;
  formCue: string;
  suggestedWeightFactor: number; // multiplier relative to user's base dumbbell weight
}

export interface DailyWorkoutPlan {
  dayIndex: number; // 0..6
  dayNameAr: string;
  splitTitle: string;
  splitSubtitle: string;
  focusMuscles: string;
  isRestOrRecovery: boolean;
  tier: WorkoutTier;
  tierLabel: string;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
}
