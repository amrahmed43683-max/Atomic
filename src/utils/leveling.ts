import type {
  AttributeKey,
  DayRecord,
  FitnessLevel,
  MultiProfileStore,
  PlayerInfo,
  PrayerKey,
  PrayerStatus,
  ProfileState,
  QuestItem,
  QuestTemplate,
  RankInfo,
  ScheduleSlot,
  WorkoutTier,
  XpValues,
} from '../types/system';
import { DEFAULT_WORKOUT_DAYS } from './workouts';

export const STORE_STORAGE_KEY = 'system_leveling_profiles_v3';

export const RANKS: RankInfo[] = [
  { name: 'E-RANK', minLevel: 1, color: '#94a3b8', desc: 'بداية الرحلة' },
  { name: 'D-RANK', minLevel: 5, color: '#10b981', desc: 'بناء العادات الأساسية' },
  { name: 'C-RANK', minLevel: 10, color: '#22d3ee', desc: 'انضباط متصاعد' },
  { name: 'B-RANK', minLevel: 20, color: '#3b82f6', desc: 'ثبات واستمرارية' },
  { name: 'A-RANK', minLevel: 30, color: '#8b5cf6', desc: 'تقدم متقدم' },
  { name: 'S-RANK', minLevel: 50, color: '#f59e0b', desc: 'إتقان طويل المدى' },
];

export const PRAYERS: { key: PrayerKey; name: string; en: string }[] = [
  { key: 'fajr', name: 'الفجر', en: 'FAJR' },
  { key: 'dhuhr', name: 'الظهر', en: 'DHUHR' },
  { key: 'asr', name: 'العصر', en: 'ASR' },
  { key: 'maghrib', name: 'المغرب', en: 'MAGHRIB' },
  { key: 'isha', name: 'العشاء', en: 'ISHA' },
];

export const MAIN_QUEST_DEFAULTS: QuestTemplate[] = [
  {
    title: 'أداء الصلوات الخمس في وقتها وتسجيلها',
    category: 'انضباط',
    xpKey: 'mainQuest',
    attr: 'discipline',
  },
  {
    title: 'إتمام جلسة التمرين المنزلي بالدامبلز',
    category: 'قوة بدنية',
    xpKey: 'workout',
    attr: 'strength',
    linkedToWorkout: true,
  },
  {
    title: 'جلسة مذاكرة أو تطوير مهارة (30–45 دقيقة)',
    category: 'معرفة',
    xpKey: 'mainQuest',
    attr: 'knowledge',
  },
  {
    title: 'تنظيم خطة الغد والاستعداد للنوم مبكرًا',
    category: 'استمرارية',
    xpKey: 'mainQuest',
    attr: 'consistency',
  },
];

export const SIDE_QUEST_POOL: QuestTemplate[] = [
  { title: 'تعلم 5 كلمات إنجليزية جديدة واستخدمها في جمل', category: 'لغة', attr: 'knowledge' },
  { title: 'قراءة 10 صفحات من كتاب مفيد', category: 'قراءة', attr: 'knowledge' },
  { title: 'شرب 8 أكواب ماء على مدار اليوم', category: 'صحة', attr: 'discipline' },
  { title: 'ترتيب المكتب وغرفة النوم في 10 دقائق', category: 'تنظيم', attr: 'consistency' },
  { title: 'تمارين إطالة وتنفس عميق لمدة 5 دقائق', category: 'استشفاء', attr: 'discipline' },
  { title: 'مراجعة ما تعلمته اليوم في ملخص سريع', category: 'دراسة', attr: 'knowledge' },
  { title: 'تطبيق عملي قصير في البرمجة أو مشروعك الشخصي', category: 'مهارة', attr: 'knowledge' },
  { title: 'مشي 15 دقيقة في الهواء الطلق بدون هاتف', category: 'لياقة', attr: 'strength' },
  { title: 'تدوين 3 إنجازات صغيرة تشعر بالامتنان لها', category: 'صفاء ذهني', attr: 'consistency' },
  { title: 'تحضير أدوات التمرين والعمل لليوم التالي', category: 'تنظيم', attr: 'consistency' },
  { title: 'تقليل وقت التصفح العشوائي ساعة واحدة اليوم', category: 'تركيز', attr: 'discipline' },
  { title: 'قراءة صفحة من القرآن وتدبر معناها', category: 'روحانيات', attr: 'discipline' },
];

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  { id: 'def-1', time: '06:00 - 07:00', name: 'الفجر + بداية اليوم وتجهيز الخطة', icon: 'sunrise' },
  { id: 'def-2', time: '08:00 - 15:00', name: 'الدراسة أو العمل (تركيز عميق)', icon: 'book' },
  { id: 'def-3', time: '15:30 - 16:30', name: 'غداء + قيلولة أو راحة', icon: 'coffee' },
  { id: 'def-4', time: '16:30 - 18:00', name: 'مذاكرة / تطوير مهارة', icon: 'target' },
  { id: 'def-5', time: '18:15 - 19:00', name: 'التمرين المنزلي بالدامبلز', icon: 'dumbbell' },
  { id: 'def-6', time: '19:30 - 21:00', name: 'مهام جانبية + وقت عائلي', icon: 'sparkles' },
  { id: 'def-7', time: '21:00 - 22:00', name: 'ترفيه حر بدون تأنيب', icon: 'gamepad' },
  { id: 'def-8', time: '22:00 - 22:30', name: 'تقرير اليوم + الاستعداد للنوم', icon: 'moon' },
];

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  check: (p: ProfileState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_quest', name: 'أول مهمة', desc: 'أكمل أول مهمة يومية أو جانبية', check: (p) => p.totalQuests >= 1 },
  { id: 'first_workout', name: 'بداية القوة', desc: 'أتمم أول جلسة تمرين منزلي', check: (p) => p.totalWorkouts >= 1 },
  { id: 'workouts_5', name: 'أسبوع حديدي', desc: 'أتمم 5 جلسات تمرين', check: (p) => p.totalWorkouts >= 5 },
  { id: 'workouts_20', name: 'بنية متينة', desc: 'أتمم 20 جلسة تمرين بالدامبلز أو وزن الجسم', check: (p) => p.totalWorkouts >= 20 },
  { id: 'quests_10', name: 'باحث عن المعرفة', desc: 'أكمل 10 مهام إجمالًا', check: (p) => p.totalQuests >= 10 },
  { id: 'quests_30', name: 'سيد المهام', desc: 'أكمل 30 مهمة إجمالًا', check: (p) => p.totalQuests >= 30 },
  { id: 'streak_3', name: 'ثلاثية الالتزام', desc: 'حافظ على سلسلة 3 أيام متتالية', check: (p) => p.player.streak >= 3 },
  { id: 'streak_7', name: 'محارب الأسبوع', desc: 'حافظ على سلسلة 7 أيام متتالية', check: (p) => p.player.streak >= 7 },
  { id: 'prayer_10', name: 'المواظب', desc: 'سجّل 10 صلوات في وقتها', check: (p) => p.totalPrayers >= 10 },
  { id: 'prayer_50', name: 'الثابت على الصلاة', desc: 'سجّل 50 صلاة في وقتها', check: (p) => p.totalPrayers >= 50 },
  { id: 'level_5', name: 'رتبة D', desc: 'الوصول إلى المستوى 5', check: (p) => p.player.level >= 5 },
  { id: 'level_10', name: 'رتبة C', desc: 'الوصول إلى المستوى 10', check: (p) => p.player.level >= 10 },
  { id: 'xp_500', name: 'جامع الخبرة', desc: 'اجمع 500 نقطة XP إجمالية', check: (p) => p.player.totalXp >= 500 },
  { id: 'xp_2000', name: 'المخضرم', desc: 'اجمع 2000 نقطة XP إجمالية', check: (p) => p.player.totalXp >= 2000 },
];

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateOffset(days: number, base: Date = new Date()): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

export function weekStartStr(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Week starts on Saturday (day 6 -> offset 0, Sunday 0 -> offset 1, ..., Friday 5 -> offset 6)
  const offset = (d.getDay() + 1) % 7;
  d.setDate(d.getDate() - offset);
  return localDateStr(d);
}

export function weekKeys(n: number, base: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(localDateStr(dateOffset(-i, base)));
  }
  return out;
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, Math.max(0, level - 1)));
}

export function rankForLevel(level: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) return RANKS[i];
  }
  return RANKS[0];
}

export function defaultXpValues(): XpValues {
  return {
    mainQuest: 20,
    workout: 35,
    prayer: 10,
    sideQuest: 10,
    sideBonus: 20,
    allDaily: 20,
    weekly: 60,
  };
}

export function freshDayRecord(
  dateStr: string,
  customMain: QuestTemplate[] = [],
  customSide: QuestTemplate[] = []
): DayRecord {
  const mainQuests: QuestItem[] = [
    ...MAIN_QUEST_DEFAULTS.map((t) => ({
      id: uid('mq'),
      title: t.title,
      category: t.category,
      attr: t.attr,
      xpKey: t.xpKey,
      done: false,
      linkedToWorkout: t.linkedToWorkout,
    })),
    ...customMain.map((t) => ({
      id: uid('mq'),
      title: t.title,
      category: t.category || 'مخصص',
      attr: t.attr || 'discipline',
      xpKey: t.xpKey || 'mainQuest',
      done: false,
      custom: true,
    })),
  ];

  const poolCopy = [...SIDE_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  const sideQuests: QuestItem[] = [
    ...poolCopy.map((t) => ({
      id: uid('sq'),
      title: t.title,
      category: t.category,
      attr: t.attr,
      done: false,
    })),
    ...customSide.map((t) => ({
      id: uid('sq'),
      title: t.title,
      category: t.category || 'مخصص',
      attr: t.attr || 'consistency',
      done: false,
      custom: true,
    })),
  ];

  return {
    date: dateStr,
    mainQuests,
    sideQuests,
    prayers: { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null },
    prayerXP: {},
    workoutDone: false,
    workoutRest: false,
    workoutXpGranted: 0,
    workoutLogs: {},
    sideBonusClaimed: false,
    allDailyClaimed: false,
    xpGained: 0,
    notes: null,
  };
}

export interface CreateProfileInput {
  id?: string;
  name: string;
  fitnessLevel?: FitnessLevel;
  hasDumbbells?: boolean;
  dumbbellWeightKg?: number;
  workoutDays?: number[];
}

export function createProfileState(input: CreateProfileInput): ProfileState {
  const cleanName = input.name.trim() || 'اللاعب الافتراضي';
  const id = input.id || uid('player');
  const today = localDateStr();

  const player: PlayerInfo = {
    id,
    name: cleanName,
    fitnessLevel: input.fitnessLevel ?? 'beginner',
    hasDumbbells: input.hasDumbbells ?? true,
    dumbbellWeightKg: input.dumbbellWeightKg ?? 5,
    workoutTierOverride: null,
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    createdAt: Date.now(),
  };

  return {
    player,
    attributes: {
      discipline: 10,
      knowledge: 10,
      strength: 10,
      consistency: 10,
    },
    settings: {
      showIntro: true,
      sound: true,
      reduceMotion: false,
      weeklyGoal: 20,
      xpValues: defaultXpValues(),
    },
    today: freshDayRecord(today),
    history: {},
    achievements: {},
    customMainQuests: [],
    customSideQuests: [],
    customSchedule: [],
    realRewards: [],
    workoutDays: input.workoutDays ?? [...DEFAULT_WORKOUT_DAYS],
    totalWorkouts: 0,
    totalQuests: 0,
    totalPrayers: 0,
    weekKey: weekStartStr(),
    weeklyClaimed: false,
    chestUnlocked: false,
    chestOpened: false,
    unlockedTitles: [],
  };
}

export function dayData(profile: ProfileState, dateStr: string): DayRecord | null {
  if (profile.today.date === dateStr) return profile.today;
  return profile.history[dateStr] ?? null;
}

export function isDayCommitted(day: DayRecord | null): boolean {
  if (!day) return false;
  const doneQuests =
    day.mainQuests.filter((q) => q.done).length +
    day.sideQuests.filter((q) => q.done).length;
  const prayedCount = Object.values(day.prayers).filter((v) => v === 'prayed').length;
  return doneQuests >= 2 || (day.workoutDone && prayedCount >= 2);
}

export function computeStreak(profile: ProfileState, now: Date = new Date()): number {
  let streak = 0;
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayRec = dayData(profile, localDateStr(cursor));
  if (isDayCommitted(todayRec)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (isDayCommitted(dayData(profile, localDateStr(cursor)))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weekQuestTotals(profile: ProfileState, now: Date = new Date()): number {
  let total = 0;
  for (const key of weekKeys(7, now)) {
    const d = dayData(profile, key);
    if (!d) continue;
    total += d.mainQuests.filter((q) => q.done).length;
    total += d.sideQuests.filter((q) => q.done).length;
  }
  return total;
}

export function weekCommittedDaysCount(profile: ProfileState, now: Date = new Date()): number {
  return weekKeys(7, now).filter((k) => isDayCommitted(dayData(profile, k))).length;
}

export function addXpToProfile(
  profile: ProfileState,
  amount: number,
  attrKey?: AttributeKey
): { profile: ProfileState; leveledUpTo: number | null } {
  const cleanAmount = Math.max(0, Math.round(amount));
  if (cleanAmount <= 0) return { profile, leveledUpTo: null };

  let xp = profile.player.xp + cleanAmount;
  let totalXp = profile.player.totalXp + cleanAmount;
  let level = profile.player.level;
  let leveledUpTo: number | null = null;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    leveledUpTo = level;
  }

  const attributes = { ...profile.attributes };
  if (attrKey) {
    attributes[attrKey] = Math.min(100, (attributes[attrKey] ?? 10) + Math.max(1, Math.ceil(cleanAmount / 10)));
  }

  return {
    profile: {
      ...profile,
      player: { ...profile.player, xp, totalXp, level },
      attributes,
      today: {
        ...profile.today,
        xpGained: profile.today.xpGained + cleanAmount,
      },
    },
    leveledUpTo,
  };
}

export function deductXpFromProfile(
  profile: ProfileState,
  amount: number,
  attrKey?: AttributeKey
): ProfileState {
  const cleanAmount = Math.max(0, Math.round(amount));
  if (cleanAmount <= 0) return profile;

  let xp = profile.player.xp - cleanAmount;
  let level = profile.player.level;
  while (xp < 0 && level > 1) {
    level--;
    xp += xpForLevel(level);
  }
  if (xp < 0) xp = 0;

  const totalXp = Math.max(0, profile.player.totalXp - cleanAmount);
  const attributes = { ...profile.attributes };
  if (attrKey) {
    attributes[attrKey] = Math.max(10, (attributes[attrKey] ?? 10) - Math.max(1, Math.ceil(cleanAmount / 10)));
  }

  return {
    ...profile,
    player: { ...profile.player, xp, totalXp, level },
    attributes,
    today: {
      ...profile.today,
      xpGained: Math.max(0, profile.today.xpGained - cleanAmount),
    },
  };
}

export function evaluateAchievements(
  profile: ProfileState,
  nowMs: number = Date.now()
): { profile: ProfileState; newlyUnlocked: AchievementDef[] } {
  const nextAchievements = { ...profile.achievements };
  const newlyUnlocked: AchievementDef[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!nextAchievements[ach.id] && ach.check(profile)) {
      nextAchievements[ach.id] = { unlockedAt: nowMs };
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length === 0) return { profile, newlyUnlocked };
  return {
    profile: { ...profile, achievements: nextAchievements },
    newlyUnlocked,
  };
}

export function rolloverProfileDay(
  profile: ProfileState,
  now: Date = new Date()
): ProfileState {
  let next = { ...profile };
  const currentDate = localDateStr(now);
  const currentWeek = weekStartStr(now);

  if (next.weekKey !== currentWeek) {
    next = {
      ...next,
      weekKey: currentWeek,
      weeklyClaimed: false,
      chestUnlocked: false,
      chestOpened: false,
    };
  }

  if (next.today.date !== currentDate) {
    const history = { ...next.history, [next.today.date]: next.today };
    next = {
      ...next,
      history,
      today: freshDayRecord(currentDate, next.customMainQuests, next.customSideQuests),
    };
  }

  const streak = computeStreak(next, now);
  if (streak !== next.player.streak) {
    next = { ...next, player: { ...next.player, streak } };
  }

  // Check weekly goal unlock
  const goal = next.settings.weeklyGoal || 20;
  if (!next.weeklyClaimed && weekQuestTotals(next, now) >= goal) {
    next = { ...next, weeklyClaimed: true, chestUnlocked: true };
    const res = addXpToProfile(next, next.settings.xpValues.weekly, 'consistency');
    next = res.profile;
  }

  return next;
}

export function parseScheduleTimeRange(raw: string): [number | null, number | null] {
  const rangeMatch = String(raw).match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (rangeMatch) {
    return [
      Number(rangeMatch[1]) * 60 + Number(rangeMatch[2]),
      Number(rangeMatch[3]) * 60 + Number(rangeMatch[4]),
    ];
  }
  const singleMatch = String(raw).match(/(\d{1,2}):(\d{2})/);
  if (singleMatch) {
    return [Number(singleMatch[1]) * 60 + Number(singleMatch[2]), null];
  }
  return [null, null];
}

export function togglePrayerInProfile(
  profile: ProfileState,
  key: PrayerKey,
  target: Exclude<PrayerStatus, null>
): { profile: ProfileState; deltaXp: number; leveledUpTo: number | null } {
  const current = profile.today.prayers[key];
  const nextStatus: PrayerStatus = current === target ? null : target;
  const grantedSoFar = profile.today.prayerXP[key] ?? 0;

  let next = {
    ...profile,
    today: {
      ...profile.today,
      prayers: { ...profile.today.prayers, [key]: nextStatus },
      prayerXP: { ...profile.today.prayerXP },
    },
  };

  let deltaXp = 0;
  let leveledUpTo: number | null = null;

  if (nextStatus === 'prayed' && grantedSoFar === 0) {
    const reward = profile.settings.xpValues.prayer;
    next.today.prayerXP[key] = reward;
    next.totalPrayers += 1;
    const res = addXpToProfile(next, reward, 'discipline');
    next = res.profile;
    deltaXp = reward;
    leveledUpTo = res.leveledUpTo;
  } else if (nextStatus !== 'prayed' && current === 'prayed') {
    next.totalPrayers = Math.max(0, next.totalPrayers - 1);
    if (grantedSoFar > 0) {
      delete next.today.prayerXP[key];
      next = deductXpFromProfile(next, grantedSoFar, 'discipline');
      deltaXp = -grantedSoFar;
    }
  }

  return { profile: next, deltaXp, leveledUpTo };
}

export function toggleWorkoutCompletion(
  profile: ProfileState,
  tierUsed: WorkoutTier
): { profile: ProfileState; deltaXp: number; leveledUpTo: number | null } {
  const wasDone = profile.today.workoutDone;

  if (!wasDone) {
    const reward = profile.settings.xpValues.workout;
    let next: ProfileState = {
      ...profile,
      totalWorkouts: profile.totalWorkouts + 1,
      today: {
        ...profile.today,
        workoutDone: true,
        workoutRest: false,
        workoutXpGranted: reward,
        workoutTierUsed: tierUsed,
        mainQuests: profile.today.mainQuests.map((q) =>
          q.linkedToWorkout && !q.done
            ? { ...q, done: true, grantedXp: 0 }
            : q
        ),
      },
    };
    const res = addXpToProfile(next, reward, 'strength');
    next = res.profile;
    next.player.streak = computeStreak(next);
    return { profile: next, deltaXp: reward, leveledUpTo: res.leveledUpTo };
  }

  // Undo workout completion cleanly
  const refund = profile.today.workoutXpGranted || 0;
  let next: ProfileState = {
    ...profile,
    totalWorkouts: Math.max(0, profile.totalWorkouts - 1),
    today: {
      ...profile.today,
      workoutDone: false,
      workoutXpGranted: 0,
      mainQuests: profile.today.mainQuests.map((q) =>
        q.linkedToWorkout ? { ...q, done: false, grantedXp: 0 } : q
      ),
    },
  };
  if (refund > 0) {
    next = deductXpFromProfile(next, refund, 'strength');
  }
  next.player.streak = computeStreak(next);
  return { profile: next, deltaXp: -refund, leveledUpTo: null };
}

export function normalizeProfileState(raw: Partial<ProfileState>): ProfileState {
  const base = createProfileState({
    id: raw.player?.id || uid('player'),
    name: raw.player?.name || 'اللاعب الافتراضي',
    fitnessLevel: raw.player?.fitnessLevel ?? 'beginner',
    hasDumbbells: raw.player?.hasDumbbells ?? true,
    dumbbellWeightKg: raw.player?.dumbbellWeightKg ?? 5,
    workoutDays: Array.isArray(raw.workoutDays) ? raw.workoutDays : [...DEFAULT_WORKOUT_DAYS],
  });

  const merged: ProfileState = {
    ...base,
    ...raw,
    player: { ...base.player, ...(raw.player ?? {}) },
    attributes: { ...base.attributes, ...(raw.attributes ?? {}) },
    settings: {
      ...base.settings,
      ...(raw.settings ?? {}),
      xpValues: { ...base.settings.xpValues, ...(raw.settings?.xpValues ?? {}) },
    },
    today: {
      ...base.today,
      ...(raw.today ?? {}),
      prayers: { ...base.today.prayers, ...(raw.today?.prayers ?? {}) },
      prayerXP: { ...(raw.today?.prayerXP ?? {}) },
      workoutLogs: { ...(raw.today?.workoutLogs ?? {}) },
      mainQuests: Array.isArray(raw.today?.mainQuests)
        ? raw.today!.mainQuests
        : base.today.mainQuests,
      sideQuests: Array.isArray(raw.today?.sideQuests)
        ? raw.today!.sideQuests
        : base.today.sideQuests,
    },
    history: raw.history ?? {},
    achievements: raw.achievements ?? {},
    customMainQuests: Array.isArray(raw.customMainQuests) ? raw.customMainQuests : [],
    customSideQuests: Array.isArray(raw.customSideQuests) ? raw.customSideQuests : [],
    customSchedule: Array.isArray(raw.customSchedule) ? raw.customSchedule : [],
    realRewards: Array.isArray(raw.realRewards) ? raw.realRewards : [],
    workoutDays: Array.isArray(raw.workoutDays) ? raw.workoutDays : [...DEFAULT_WORKOUT_DAYS],
    unlockedTitles: Array.isArray(raw.unlockedTitles) ? raw.unlockedTitles : [],
  };

  return rolloverProfileDay(merged);
}

export function loadMultiProfileStore(): {
  store: MultiProfileStore;
  needsOnboarding: boolean;
} {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MultiProfileStore>;
      if (parsed && parsed.profiles && Object.keys(parsed.profiles).length > 0) {
        const normalizedProfiles: Record<string, ProfileState> = {};
        for (const [id, p] of Object.entries(parsed.profiles)) {
          normalizedProfiles[id] = normalizeProfileState(p);
        }
        const defaultId =
          parsed.defaultProfileId && normalizedProfiles[parsed.defaultProfileId]
            ? parsed.defaultProfileId
            : Object.keys(normalizedProfiles)[0];
        const activeId = defaultId; // Launch into the user's configured default profile!
        return {
          store: {
            version: 3,
            activeProfileId: activeId,
            defaultProfileId: defaultId,
            profiles: normalizedProfiles,
          },
          needsOnboarding: false,
        };
      }
    }
  } catch {
    // Corrupted localStorage falls back cleanly to onboarding
  }

  const defaultProfile = createProfileState({
    id: 'default_player',
    name: 'اللاعب الافتراضي',
    fitnessLevel: 'beginner',
    hasDumbbells: true,
    dumbbellWeightKg: 5,
  });

  return {
    store: {
      version: 3,
      activeProfileId: defaultProfile.player.id,
      defaultProfileId: defaultProfile.player.id,
      profiles: { [defaultProfile.player.id]: defaultProfile },
    },
    needsOnboarding: true,
  };
}

export function saveMultiProfileStore(store: MultiProfileStore): void {
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota errors gracefully
  }
}
