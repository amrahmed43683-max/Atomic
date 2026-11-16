import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  CalendarClock,
  CheckSquare,
  Compass,
  Dumbbell,
  FileText,
  Gift,
  LayoutDashboard,
  Menu,
  MoonStar,
  Settings,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { OnboardingModal } from './components/OnboardingModal';
import { PrayerView } from './components/PrayerView';
import { ProgressView, ReportView } from './components/ProgressReportView';
import { QuestsView } from './components/QuestsView';
import { AchievementsView, RewardsView } from './components/RewardsAchievementsView';
import { ScheduleView } from './components/ScheduleView';
import { SettingsView } from './components/SettingsView';
import { WorkoutView } from './components/WorkoutView';
import type {
  AttributeKey,
  FitnessLevel,
  MultiProfileStore,
  PageId,
  PrayerKey,
  PrayerStatus,
  ProfileState,
  WorkoutTier,
  XpKey,
} from './types/system';
import {
  addXpToProfile,
  computeStreak,
  createProfileState,
  deductXpFromProfile,
  evaluateAchievements,
  loadMultiProfileStore,
  localDateStr,
  normalizeProfileState,
  parseScheduleTimeRange,
  rankForLevel,
  rolloverProfileDay,
  saveMultiProfileStore,
  SIDE_QUEST_POOL,
  togglePrayerInProfile,
  toggleWorkoutCompletion,
  uid,
  weekQuestTotals,
} from './utils/leveling';
import { playBeep, playLevelUpChime } from './utils/sound';

interface ToastItem {
  id: string;
  title: string;
  body?: string;
  tone: 'default' | 'success' | 'gold' | 'error';
}

const NAV_ITEMS: { id: PageId; label: string; en: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', en: 'DASHBOARD', Icon: LayoutDashboard },
  { id: 'workout', label: 'التمرين المنزلي', en: 'HOME WORKOUT', Icon: Dumbbell },
  { id: 'quests', label: 'المهام اليومية', en: 'DAILY QUESTS', Icon: CheckSquare },
  { id: 'side', label: 'المهام الجانبية', en: 'SIDE QUESTS', Icon: Compass },
  { id: 'prayer', label: 'متتبع الصلاة', en: 'PRAYER TRACKER', Icon: MoonStar },
  { id: 'schedule', label: 'الجدول اليومي', en: 'DAILY SCHEDULE', Icon: CalendarClock },
  { id: 'rewards', label: 'المكافآت', en: 'REWARDS', Icon: Gift },
  { id: 'achievements', label: 'الإنجازات', en: 'ACHIEVEMENTS', Icon: Award },
  { id: 'progress', label: 'التقدم', en: 'PROGRESS', Icon: BarChart3 },
  { id: 'report', label: 'تقرير اليوم', en: 'DAILY REPORT', Icon: FileText },
  { id: 'settings', label: 'الإعدادات', en: 'SETTINGS', Icon: Settings },
];

export default function App() {
  const autostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const initialLoad = useMemo(() => loadMultiProfileStore(), []);
  const [store, setStore] = useState<MultiProfileStore>(initialLoad.store);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(
    !autostart && initialLoad.needsOnboarding
  );
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(
    !autostart && initialLoad.needsOnboarding
  );

  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [chestLootText, setChestLootText] = useState<string | null>(null);

  const activeProfile: ProfileState =
    store.profiles[store.activeProfileId] ??
    Object.values(store.profiles)[0];

  const [introVisible, setIntroVisible] = useState<boolean>(
    () =>
      !autostart &&
      !initialLoad.needsOnboarding &&
      Boolean(
        (
          initialLoad.store.profiles[initialLoad.store.activeProfileId] ??
          Object.values(initialLoad.store.profiles)[0]
        )?.settings.showIntro
      )
  );

  // Sync reduce-motion class on body
  useEffect(() => {
    document.body.classList.toggle('reduce-motion', !!activeProfile.settings.reduceMotion);
  }, [activeProfile.settings.reduceMotion]);

  // Persist store on change
  useEffect(() => {
    saveMultiProfileStore(store);
  }, [store]);

  // Auto-dismiss intro
  useEffect(() => {
    if (!introVisible) return;
    const t = window.setTimeout(() => {
      setIntroVisible(false);
      setStore((prev) => {
        const p = prev.profiles[prev.activeProfileId];
        if (!p || !p.settings.showIntro) return prev;
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [p.player.id]: {
              ...p,
              settings: { ...p.settings, showIntro: false },
            },
          },
        };
      });
    }, 3400);
    return () => window.clearTimeout(t);
  }, [introVisible]);

  // Periodic midnight rollover check
  useEffect(() => {
    const id = window.setInterval(() => {
      setStore((prev) => {
        const p = prev.profiles[prev.activeProfileId];
        if (!p) return prev;
        const rolled = rolloverProfileDay(p);
        if (rolled.today.date === p.today.date && rolled.weekKey === p.weekKey) return prev;
        return {
          ...prev,
          profiles: { ...prev.profiles, [p.player.id]: rolled },
        };
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const pushToast = useCallback(
    (title: string, body?: string, tone: ToastItem['tone'] = 'default') => {
      const id = uid('toast');
      setToasts((prev) => [...prev.slice(-3), { id, title, body, tone }]);
      if (tone === 'success') playBeep(activeProfile.settings.sound, 880, 0.12);
      if (tone === 'gold') playLevelUpChime(activeProfile.settings.sound);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 4000);
    },
    [activeProfile.settings.sound]
  );

  const updateActiveProfile = useCallback(
    (updater: (p: ProfileState) => { next: ProfileState; leveledUpTo?: number | null }) => {
      let leveled: number | null = null;
      let unlockedNames: string[] = [];

      setStore((prev) => {
        const current = prev.profiles[prev.activeProfileId];
        if (!current) return prev;
        const { next, leveledUpTo } = updater(current);
        if (leveledUpTo) leveled = leveledUpTo;

        // Recompute streak & check weekly goal & achievements
        let finalized: ProfileState = {
          ...next,
          player: { ...next.player, streak: computeStreak(next) },
        };

        const goal = finalized.settings.weeklyGoal || 20;
        if (!finalized.weeklyClaimed && weekQuestTotals(finalized) >= goal) {
          finalized = {
            ...finalized,
            weeklyClaimed: true,
            chestUnlocked: true,
          };
          const bonusRes = addXpToProfile(
            finalized,
            finalized.settings.xpValues.weekly,
            'consistency'
          );
          finalized = bonusRes.profile;
          if (bonusRes.leveledUpTo) leveled = bonusRes.leveledUpTo;
        }

        const achRes = evaluateAchievements(finalized);
        finalized = achRes.profile;
        unlockedNames = achRes.newlyUnlocked.map((a) => a.name);

        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [finalized.player.id]: finalized,
          },
        };
      });

      window.setTimeout(() => {
        if (leveled) {
          setLevelUpModal(leveled);
          playLevelUpChime(activeProfile.settings.sound);
        }
        for (const name of unlockedNames) {
          pushToast('إنجاز جديد مفتوح', name, 'gold');
        }
      }, 0);
    },
    [activeProfile.settings.sound, pushToast]
  );

  // ---------------- Quest Handlers ----------------
  const handleToggleMainQuest = (id: string) => {
    const q = activeProfile.today.mainQuests.find((x) => x.id === id);
    if (!q) return;

    if (q.linkedToWorkout) {
      handleCompleteWorkout(activeProfile.player.workoutTierOverride ?? 1);
      return;
    }

    const xpAmount = activeProfile.settings.xpValues[q.xpKey ?? 'mainQuest'] ?? 20;

    updateActiveProfile((p) => {
      const target = p.today.mainQuests.find((x) => x.id === id);
      if (!target) return { next: p };
      const markingDone = !target.done;
      let next: ProfileState = {
        ...p,
        totalQuests: markingDone ? p.totalQuests + 1 : Math.max(0, p.totalQuests - 1),
        today: {
          ...p.today,
          mainQuests: p.today.mainQuests.map((item) =>
            item.id === id
              ? { ...item, done: markingDone, grantedXp: markingDone ? xpAmount : 0 }
              : item
          ),
        },
      };

      let leveledUpTo: number | null = null;
      if (markingDone) {
        const res = addXpToProfile(next, xpAmount, target.attr);
        next = res.profile;
        leveledUpTo = res.leveledUpTo;

        if (
          !next.today.allDailyClaimed &&
          next.today.mainQuests.length > 0 &&
          next.today.mainQuests.every((item) => item.done)
        ) {
          next.today.allDailyClaimed = true;
          const allBonus = addXpToProfile(
            next,
            next.settings.xpValues.allDaily,
            'consistency'
          );
          next = allBonus.profile;
          if (allBonus.leveledUpTo) leveledUpTo = allBonus.leveledUpTo;
        }
      } else {
        const refund = target.grantedXp ?? xpAmount;
        next = deductXpFromProfile(next, refund, target.attr);
      }
      return { next, leveledUpTo };
    });

    if (!q.done) pushToast(`+${xpAmount} XP`, `تم إنجاز: ${q.title}`, 'success');
  };

  const handleToggleSideQuest = (id: string) => {
    const q = activeProfile.today.sideQuests.find((x) => x.id === id);
    if (!q) return;
    const xpAmount = activeProfile.settings.xpValues.sideQuest;

    updateActiveProfile((p) => {
      const target = p.today.sideQuests.find((x) => x.id === id);
      if (!target) return { next: p };
      const markingDone = !target.done;
      let next: ProfileState = {
        ...p,
        totalQuests: markingDone ? p.totalQuests + 1 : Math.max(0, p.totalQuests - 1),
        today: {
          ...p.today,
          sideQuests: p.today.sideQuests.map((item) =>
            item.id === id
              ? { ...item, done: markingDone, grantedXp: markingDone ? xpAmount : 0 }
              : item
          ),
        },
      };

      let leveledUpTo: number | null = null;
      if (markingDone) {
        const res = addXpToProfile(next, xpAmount, target.attr);
        next = res.profile;
        leveledUpTo = res.leveledUpTo;

        const doneCount = next.today.sideQuests.filter((x) => x.done).length;
        if (doneCount >= 2 && !next.today.sideBonusClaimed) {
          next.today.sideBonusClaimed = true;
          const bonus = addXpToProfile(
            next,
            next.settings.xpValues.sideBonus,
            'consistency'
          );
          next = bonus.profile;
          if (bonus.leveledUpTo) leveledUpTo = bonus.leveledUpTo;
        }
      } else {
        const refund = target.grantedXp ?? xpAmount;
        next = deductXpFromProfile(next, refund, target.attr);
      }

      return { next, leveledUpTo };
    });

    if (!q.done) pushToast(`+${xpAmount} XP`, `مهمة جانبية: ${q.title}`, 'success');
  };

  const handleAddQuest = (type: 'main' | 'side', title: string, attr: AttributeKey) => {
    const attrLabels: Record<AttributeKey, string> = {
      discipline: 'انضباط',
      knowledge: 'معرفة',
      strength: 'قوة',
      consistency: 'استمرارية',
    };

    updateActiveProfile((p) => {
      const newItem = {
        id: uid(type === 'main' ? 'mq' : 'sq'),
        title,
        category: attrLabels[attr],
        attr,
        xpKey: (type === 'main' ? 'mainQuest' : 'sideQuest') as XpKey,
        done: false,
        custom: true,
      };
      if (type === 'main') {
        return {
          next: {
            ...p,
            customMainQuests: [
              ...p.customMainQuests,
              { title, category: attrLabels[attr], attr, xpKey: 'mainQuest', custom: true },
            ],
            today: { ...p.today, mainQuests: [...p.today.mainQuests, newItem] },
          },
        };
      }
      return {
        next: {
          ...p,
          customSideQuests: [
            ...p.customSideQuests,
            { title, category: attrLabels[attr], attr, custom: true },
          ],
          today: { ...p.today, sideQuests: [...p.today.sideQuests, newItem] },
        },
      };
    });
    pushToast('تمت إضافة المهمة', title, 'success');
  };

  const handleDeleteQuest = (type: 'main' | 'side', id: string) => {
    updateActiveProfile((p) => {
      if (type === 'main') {
        const target = p.today.mainQuests.find((x) => x.id === id);
        return {
          next: {
            ...p,
            today: {
              ...p.today,
              mainQuests: p.today.mainQuests.filter((x) => x.id !== id),
            },
            customMainQuests: target?.custom
              ? p.customMainQuests.filter((c) => c.title !== target.title)
              : p.customMainQuests,
          },
        };
      }
      const target = p.today.sideQuests.find((x) => x.id === id);
      return {
        next: {
          ...p,
          today: {
            ...p.today,
            sideQuests: p.today.sideQuests.filter((x) => x.id !== id),
          },
          customSideQuests: target?.custom
            ? p.customSideQuests.filter((c) => c.title !== target.title)
            : p.customSideQuests,
        },
      };
    });
  };

  const handleRefreshSideQuests = () => {
    updateActiveProfile((p) => {
      const keep = p.today.sideQuests.filter((q) => q.done || q.custom);
      const usedTitles = new Set(p.today.sideQuests.map((q) => q.title));
      const available = SIDE_QUEST_POOL.filter((t) => !usedTitles.has(t.title)).sort(
        () => Math.random() - 0.5
      );
      const need = Math.max(3 - keep.length, 0);
      const picks = available.slice(0, need).map((t) => ({
        id: uid('sq'),
        title: t.title,
        category: t.category,
        attr: t.attr,
        done: false,
      }));
      return {
        next: {
          ...p,
          today: { ...p.today, sideQuests: [...picks, ...keep] },
        },
      };
    });
    pushToast('تم تحديث المهام الجانبية', 'تحديات جديدة متاحة اليوم', 'success');
  };

  // ---------------- Prayer Handler ----------------
  const handleSetPrayer = (key: PrayerKey, status: Exclude<PrayerStatus, null>) => {
    let gained = 0;
    updateActiveProfile((p) => {
      const res = togglePrayerInProfile(p, key, status);
      gained = res.deltaXp;
      return { next: res.profile, leveledUpTo: res.leveledUpTo };
    });
    if (gained > 0) pushToast(`+${gained} XP`, 'تم تسجيل الصلاة في وقتها', 'success');
  };

  // ---------------- Workout Handlers ----------------
  const handleToggleWorkoutDay = (dayIndex: number) => {
    updateActiveProfile((p) => {
      const exists = p.workoutDays.includes(dayIndex);
      const nextDays = exists
        ? p.workoutDays.filter((d) => d !== dayIndex)
        : [...p.workoutDays, dayIndex].sort((a, b) => a - b);
      return { next: { ...p, workoutDays: nextDays } };
    });
  };

  const handleCompleteWorkout = (tierUsed: WorkoutTier) => {
    let delta = 0;
    updateActiveProfile((p) => {
      const res = toggleWorkoutCompletion(p, tierUsed);
      delta = res.deltaXp;
      return { next: res.profile, leveledUpTo: res.leveledUpTo };
    });
    if (delta > 0) {
      pushToast(`+${delta} XP`, 'أحسنت! تم إتمام جلسة التمرين وتحديث القوة', 'success');
    } else if (delta < 0) {
      pushToast('تم التراجع', 'تم إلغاء تسجيل تمرين اليوم');
    }
  };

  const handleToggleRestDay = () => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        today: { ...p.today, workoutRest: !p.today.workoutRest },
      },
    }));
  };

  const handleSetTierOverride = (tier: WorkoutTier | null) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        player: { ...p.player, workoutTierOverride: tier },
      },
    }));
  };

  const handleUpdateDumbbellConfig = (hasDumbbells: boolean, weightKg: number) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        player: { ...p.player, hasDumbbells, dumbbellWeightKg: weightKg },
      },
    }));
  };

  const handleToggleExerciseSet = (
    exerciseId: string,
    setIdx: number,
    totalSets: number,
    defaultWeightKg: number
  ) => {
    updateActiveProfile((p) => {
      const existing = p.today.workoutLogs[exerciseId];
      const baseSets =
        existing?.setsDone && existing.setsDone.length === totalSets
          ? [...existing.setsDone]
          : Array.from({ length: totalSets }, (_, i) => existing?.setsDone?.[i] ?? false);
      baseSets[setIdx] = !baseSets[setIdx];

      return {
        next: {
          ...p,
          today: {
            ...p.today,
            workoutLogs: {
              ...p.today.workoutLogs,
              [exerciseId]: {
                setsDone: baseSets,
                weightKg: existing?.weightKg ?? defaultWeightKg,
              },
            },
          },
        },
      };
    });
  };

  const handleUpdateExerciseWeight = (
    exerciseId: string,
    weightKg: number,
    totalSets: number
  ) => {
    updateActiveProfile((p) => {
      const existing = p.today.workoutLogs[exerciseId];
      const setsDone =
        existing?.setsDone && existing.setsDone.length === totalSets
          ? existing.setsDone
          : Array.from({ length: totalSets }, (_, i) => existing?.setsDone?.[i] ?? false);
      return {
        next: {
          ...p,
          today: {
            ...p.today,
            workoutLogs: {
              ...p.today.workoutLogs,
              [exerciseId]: { setsDone, weightKg },
            },
          },
        },
      };
    });
  };

  // ---------------- Schedule / Rewards / Notes Handlers ----------------
  const handleAddScheduleSlot = (time: string, name: string) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        customSchedule: [...p.customSchedule, { id: uid('sch'), time, name, icon: 'pin', custom: true }].sort(
          (a, b) => (parseScheduleTimeRange(a.time)[0] ?? 9999) - (parseScheduleTimeRange(b.time)[0] ?? 9999)
        ),
      },
    }));
    pushToast('تمت الإضافة للجدول', name, 'success');
  };

  const handleDeleteScheduleSlot = (id: string) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        customSchedule: p.customSchedule.filter((s) => s.id !== id),
      },
    }));
  };

  const handleApplyQuickPlan = () => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        customSchedule: [
          { id: uid('qp'), time: '16:00 - 16:30', name: 'راحة سريعة + وجبة خفيفة', icon: 'coffee', custom: true },
          { id: uid('qp'), time: '16:30 - 17:30', name: 'المهمة الأهم في اليوم', icon: 'target', custom: true },
          { id: uid('qp'), time: '17:30 - 18:00', name: 'تمرين دامبلز سريع (20 دقيقة)', icon: 'dumbbell', custom: true },
          { id: uid('qp'), time: '20:30 - 21:00', name: 'مراجعة سريعة + استعداد للنوم', icon: 'moon', custom: true },
        ],
      },
    }));
    pushToast('تم إنشاء الخطة السريعة', 'خطة مختصرة ليوم مزدحم', 'success');
  };

  const handleAddReward = (name: string) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        realRewards: [...p.realRewards, { id: uid('rw'), name, redeemedCount: 0 }],
      },
    }));
    pushToast('تمت إضافة المكافأة', name, 'success');
  };

  const handleRedeemReward = (id: string) => {
    const rw = activeProfile.realRewards.find((r) => r.id === id);
    if (!rw) return;
    updateActiveProfile((p) => ({
      next: {
        ...p,
        realRewards: p.realRewards.map((r) =>
          r.id === id ? { ...r, redeemedCount: r.redeemedCount + 1 } : r
        ),
      },
    }));
    pushToast('مكافأة مستحقة', `${rw.name} — استمتع بوقتك`, 'gold');
  };

  const handleDeleteReward = (id: string) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        realRewards: p.realRewards.filter((r) => r.id !== id),
      },
    }));
  };

  const handleOpenShadowChest = () => {
    const goal = activeProfile.settings.weeklyGoal || 20;
    const total = weekQuestTotals(activeProfile);
    if (!activeProfile.chestUnlocked) {
      pushToast('الصندوق مقفل', `أكمل ${total}/${goal} مهمة هذا الأسبوع لفتحه`);
      return;
    }
    if (activeProfile.chestOpened) return;

    const lootPool = [
      { label: 'لقب جديد: فارس الاستمرارية', xp: 0 },
      { label: 'مكافأة خبرة إضافية +50 XP', xp: 50 },
      { label: 'لقب جديد: بطل الدامبلز', xp: 0 },
      { label: 'مكافأة خبرة نادرة +100 XP', xp: 100 },
    ];
    const pick = lootPool[Math.floor(Math.random() * lootPool.length)];

    updateActiveProfile((p) => {
      let next: ProfileState = {
        ...p,
        chestOpened: true,
        unlockedTitles:
          pick.xp === 0 ? [...p.unlockedTitles, pick.label] : p.unlockedTitles,
      };
      let leveled: number | null = null;
      if (pick.xp > 0) {
        const res = addXpToProfile(next, pick.xp, 'consistency');
        next = res.profile;
        leveled = res.leveledUpTo;
      }
      return { next, leveledUpTo: leveled };
    });

    setChestLootText(pick.label);
    playLevelUpChime(activeProfile.settings.sound);
  };

  const handleSaveNotes = (learned: string, improve: string) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        today: { ...p.today, notes: { learned, improve } },
      },
    }));
    pushToast('تم حفظ الملاحظات', 'أُضيفت لسجل التقدم اليومي', 'success');
  };

  // ---------------- Profile & Account Management ----------------
  const handleCreateProfile = (payload: {
    name: string;
    fitnessLevel: FitnessLevel;
    hasDumbbells: boolean;
    dumbbellWeightKg: number;
    setAsDefault: boolean;
  }) => {
    const newProfile = createProfileState({
      name: payload.name,
      fitnessLevel: payload.fitnessLevel,
      hasDumbbells: payload.hasDumbbells,
      dumbbellWeightKg: payload.dumbbellWeightKg,
    });
    newProfile.settings.showIntro = false;

    setStore((prev) => {
      // If replacing initial onboarding placeholder that has 0 progress, clean it up
      const profiles = { ...prev.profiles };
      if (
        needsOnboarding &&
        profiles['default_player'] &&
        profiles['default_player'].player.totalXp === 0
      ) {
        delete profiles['default_player'];
      }
      profiles[newProfile.player.id] = newProfile;
      return {
        version: 3,
        activeProfileId: newProfile.player.id,
        defaultProfileId: payload.setAsDefault
          ? newProfile.player.id
          : prev.defaultProfileId && profiles[prev.defaultProfileId]
            ? prev.defaultProfileId
            : newProfile.player.id,
        profiles,
      };
    });

    setNeedsOnboarding(false);
    setProfileModalOpen(false);
    setIntroVisible(false);
    pushToast(`أهلاً ${newProfile.player.name}`, 'تم إنشاء حسابك وتجهيز خطة التمرين', 'success');
  };

  const handleQuickDefaultProfile = () => {
    setStore((prev) => {
      const p = prev.profiles[prev.activeProfileId];
      if (!p) return prev;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [p.player.id]: {
            ...p,
            settings: { ...p.settings, showIntro: false },
          },
        },
      };
    });
    setNeedsOnboarding(false);
    setProfileModalOpen(false);
    pushToast('تم الدخول بالحساب الافتراضي', 'يمكنك تعديل اسمك في أي وقت من الإعدادات', 'success');
  };

  const handleSwitchProfile = (profileId: string) => {
    if (!store.profiles[profileId]) return;
    setStore((prev) => ({
      ...prev,
      activeProfileId: profileId,
      profiles: {
        ...prev.profiles,
        [profileId]: rolloverProfileDay(prev.profiles[profileId]),
      },
    }));
    setProfileModalOpen(false);
    pushToast('تم تبديل الحساب', store.profiles[profileId].player.name, 'success');
  };

  const handleSetDefaultProfile = (profileId: string) => {
    if (!store.profiles[profileId]) return;
    setStore((prev) => ({ ...prev, defaultProfileId: profileId }));
    pushToast(
      'تم تعيين الحساب الافتراضي',
      `سيفتح التطبيق تلقائيًا بحساب ${store.profiles[profileId].player.name}`,
      'success'
    );
  };

  const handleDeleteProfile = (profileId: string) => {
    if (Object.keys(store.profiles).length <= 1) return;
    setStore((prev) => {
      const profiles = { ...prev.profiles };
      delete profiles[profileId];
      const remainingIds = Object.keys(profiles);
      const nextActive =
        prev.activeProfileId === profileId ? remainingIds[0] : prev.activeProfileId;
      const nextDefault =
        prev.defaultProfileId === profileId ? remainingIds[0] : prev.defaultProfileId;
      return {
        ...prev,
        activeProfileId: nextActive,
        defaultProfileId: nextDefault,
        profiles,
      };
    });
  };

  const handleUpdatePlayerInfo = (payload: {
    name: string;
    fitnessLevel: FitnessLevel;
    hasDumbbells: boolean;
    dumbbellWeightKg: number;
  }) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        player: {
          ...p.player,
          name: payload.name,
          fitnessLevel: payload.fitnessLevel,
          hasDumbbells: payload.hasDumbbells,
          dumbbellWeightKg: payload.dumbbellWeightKg,
        },
      },
    }));
    pushToast('تم حفظ بيانات الحساب', payload.name, 'success');
  };

  const handleToggleSetting = (key: 'showIntro' | 'sound' | 'reduceMotion') => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        settings: { ...p.settings, [key]: !p.settings[key] },
      },
    }));
  };

  const handleUpdateXpValue = (key: XpKey, value: number) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        settings: {
          ...p.settings,
          xpValues: { ...p.settings.xpValues, [key]: value },
        },
      },
    }));
  };

  const handleUpdateWeeklyGoal = (goal: number) => {
    updateActiveProfile((p) => ({
      next: {
        ...p,
        settings: { ...p.settings, weeklyGoal: goal },
      },
    }));
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(activeProfile, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `system-${activeProfile.player.name}-${localDateStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    pushToast('تم التصدير', 'حُفظت نسخة احتياطية بصيغة JSON', 'success');
  };

  const handleImportData = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<ProfileState>;
      const normalized = normalizeProfileState({
        ...parsed,
        player: {
          ...(parsed.player ?? activeProfile.player),
          id: activeProfile.player.id,
        },
      });
      setStore((prev) => ({
        ...prev,
        profiles: { ...prev.profiles, [activeProfile.player.id]: normalized },
      }));
      pushToast('تم استيراد البيانات', 'تمت استعادة التقدم بنجاح', 'success');
    } catch {
      pushToast('تعذر الاستيراد', 'تأكد من صحة ملف JSON المختار', 'error');
    }
  };

  const handleResetProfile = () => {
    const fresh = createProfileState({
      id: activeProfile.player.id,
      name: activeProfile.player.name,
      fitnessLevel: activeProfile.player.fitnessLevel,
      hasDumbbells: activeProfile.player.hasDumbbells,
      dumbbellWeightKg: activeProfile.player.dumbbellWeightKg,
    });
    setStore((prev) => ({
      ...prev,
      profiles: { ...prev.profiles, [activeProfile.player.id]: fresh },
    }));
    pushToast('تمت إعادة الضبط', 'بدأ الحساب من المستوى 1', 'success');
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === activePage) ?? NAV_ITEMS[0];
  const rank = rankForLevel(activeProfile.player.level);

  return (
    <div className="min-h-screen bg-[#070911] text-[#edf0fb]">
      {/* Intro Splash (only when enabled & not autostart) */}
      {introVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060c]/95 p-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-violet-500/40 bg-[#0d111e] p-8 text-center shadow-2xl">
            <div className="font-display text-2xl font-bold tracking-widest text-violet-400">
              SYSTEM INITIALIZED
            </div>
            <div className="mt-4 space-y-2 text-xs text-cyan-300">
              <p>اللاعب: <strong className="text-white">{activeProfile.player.name}</strong></p>
              <p dir="ltr" className="font-mono">RANK: {rank.name} · LEVEL {activeProfile.player.level}</p>
              <p>المهام اليومية وجدول الدامبلز جاهزان</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIntroVisible(false);
                setStore((prev) => {
                  const p = prev.profiles[prev.activeProfileId];
                  if (!p || !p.settings.showIntro) return prev;
                  return {
                    ...prev,
                    profiles: {
                      ...prev.profiles,
                      [p.player.id]: {
                        ...p,
                        settings: { ...p.settings, showIntro: false },
                      },
                    },
                  };
                });
              }}
              className="mt-6 rounded-xl border border-cyan-500/40 px-5 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/15"
            >
              تخطي المقدمة
            </button>
          </div>
        </div>
      )}

      {/* Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 sm:right-auto sm:bottom-auto sm:top-20 sm:left-6 z-50 flex flex-col gap-2 sm:max-w-xs sm:w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border bg-[#0d111e]/95 px-4 py-3 shadow-lg backdrop-blur-md ${
              t.tone === 'gold'
                ? 'border-amber-400/60'
                : t.tone === 'success'
                  ? 'border-emerald-500/50'
                  : t.tone === 'error'
                    ? 'border-rose-500/60'
                    : 'border-[#242d4d]'
            }`}
          >
            <div className="text-xs font-bold text-[#edf0fb]">{t.title}</div>
            {t.body && <div className="mt-0.5 text-[11px] text-[#9aa3c2]">{t.body}</div>}
          </div>
        ))}
      </div>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* RTL Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-[#1f2742] bg-[#0a0d17] transition-transform duration-200 lg:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1f2742] px-5 py-4">
          <div>
            <div className="font-display text-lg font-extrabold tracking-wider text-[#edf0fb]">
              SYSTEM
            </div>
            <div className="text-[11px] text-[#7e87a8]">التطوير الشخصي</div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="إغلاق القائمة"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2742] text-[#8e97b8] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="التنقل الرئيسي">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActivePage(id);
                  setDrawerOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-violet-600/20 text-violet-200 border border-violet-500/40'
                    : 'text-[#8e97b8] border border-transparent hover:bg-[#121728] hover:text-[#edf0fb]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-violet-400' : ''}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Profile Footer */}
        <div className="border-t border-[#1f2742] p-3">
          <button
            type="button"
            onClick={() => {
              setProfileModalOpen(true);
              setDrawerOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#1f2742] bg-[#0f1424] px-3 py-2.5 text-right transition-colors hover:border-violet-500/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 font-bold text-xs text-violet-300">
                {activeProfile.player.name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#edf0fb] truncate">
                  {activeProfile.player.name}
                </div>
                <div className="text-[11px] text-[#7e87a8] font-mono tabular-nums">
                  LVL {activeProfile.player.level} · {rank.name}
                </div>
              </div>
            </div>
            <UserCheck className="h-4 w-4 shrink-0 text-cyan-400" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:mr-64 min-h-screen flex flex-col">
        {/* Top Bar (Single Row, <=15% Mobile Sticky Cap) */}
        <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-[#1f2742] bg-[#070911]/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="فتح قائمة التنقل"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1f2742] text-[#c7cee8] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#edf0fb] truncate">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
              <span>
                <span className="text-[#7e87a8]">LVL </span>
                <strong className="text-amber-400">{activeProfile.player.level}</strong>
              </span>
              <span className="hidden sm:inline">
                <span className="text-[#7e87a8]">XP </span>
                <strong className="text-cyan-400">{activeProfile.player.totalXp}</strong>
              </span>
              <span>
                <span className="text-[#7e87a8]">STREAK </span>
                <strong className="text-emerald-400">{activeProfile.player.streak}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#242d4d] bg-[#0d111e] px-3.5 py-2 text-xs font-semibold text-[#edf0fb] transition-colors hover:border-violet-500 whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>حساب: {activeProfile.player.name}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <DashboardView
              profile={activeProfile}
              onToggleMainQuest={handleToggleMainQuest}
              onDeleteQuest={handleDeleteQuest}
              onNavigate={setActivePage}
              onOpenProfiles={() => setProfileModalOpen(true)}
            />
          )}

          {activePage === 'workout' && (
            <WorkoutView
              profile={activeProfile}
              onToggleWorkoutDay={handleToggleWorkoutDay}
              onCompleteWorkout={handleCompleteWorkout}
              onToggleRestDay={handleToggleRestDay}
              onSetTierOverride={handleSetTierOverride}
              onUpdateDumbbellConfig={handleUpdateDumbbellConfig}
              onToggleExerciseSet={handleToggleExerciseSet}
              onUpdateExerciseWeight={handleUpdateExerciseWeight}
              onTimerBeep={() => {
                playBeep(activeProfile.settings.sound, 980, 0.2);
                pushToast('انتهى وقت الراحة', 'استعد للمجموعة التالية', 'success');
              }}
            />
          )}

          {activePage === 'quests' && (
            <QuestsView
              mode="main"
              profile={activeProfile}
              onToggleMainQuest={handleToggleMainQuest}
              onToggleSideQuest={handleToggleSideQuest}
              onAddQuest={handleAddQuest}
              onDeleteQuest={handleDeleteQuest}
              onRefreshSideQuests={handleRefreshSideQuests}
            />
          )}

          {activePage === 'side' && (
            <QuestsView
              mode="side"
              profile={activeProfile}
              onToggleMainQuest={handleToggleMainQuest}
              onToggleSideQuest={handleToggleSideQuest}
              onAddQuest={handleAddQuest}
              onDeleteQuest={handleDeleteQuest}
              onRefreshSideQuests={handleRefreshSideQuests}
            />
          )}

          {activePage === 'prayer' && (
            <PrayerView profile={activeProfile} onSetPrayer={handleSetPrayer} />
          )}

          {activePage === 'schedule' && (
            <ScheduleView
              profile={activeProfile}
              onAddScheduleSlot={handleAddScheduleSlot}
              onDeleteScheduleSlot={handleDeleteScheduleSlot}
              onApplyQuickPlan={handleApplyQuickPlan}
              onTimerCompleteBeep={() => {
                playLevelUpChime(activeProfile.settings.sound);
                pushToast('انتهت جلسة التركيز', 'خذ استراحة قصيرة ثم أكمل', 'success');
              }}
            />
          )}

          {activePage === 'rewards' && (
            <RewardsView
              profile={activeProfile}
              onAddReward={handleAddReward}
              onRedeemReward={handleRedeemReward}
              onDeleteReward={handleDeleteReward}
              onOpenShadowChest={handleOpenShadowChest}
            />
          )}

          {activePage === 'achievements' && <AchievementsView profile={activeProfile} />}

          {activePage === 'progress' && <ProgressView profile={activeProfile} />}

          {activePage === 'report' && (
            <ReportView profile={activeProfile} onSaveNotes={handleSaveNotes} />
          )}

          {activePage === 'settings' && (
            <SettingsView
              store={store}
              profile={activeProfile}
              onUpdatePlayerInfo={handleUpdatePlayerInfo}
              onSetDefaultProfile={handleSetDefaultProfile}
              onOpenProfiles={() => setProfileModalOpen(true)}
              onToggleSetting={handleToggleSetting}
              onUpdateXpValue={handleUpdateXpValue}
              onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetProfile={handleResetProfile}
            />
          )}
        </main>
      </div>

      {/* Onboarding & Multi-Profile Modal */}
      <OnboardingModal
        isOpen={profileModalOpen}
        isFirstSetup={needsOnboarding}
        store={store}
        onClose={() => setProfileModalOpen(false)}
        onCreateProfile={handleCreateProfile}
        onQuickDefaultProfile={handleQuickDefaultProfile}
        onSwitchProfile={handleSwitchProfile}
        onSetDefaultProfile={handleSetDefaultProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Level Up Modal */}
      {levelUpModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="ترقية المستوى"
        >
          <div className="w-full max-w-sm rounded-2xl border border-amber-400/50 bg-[#0d111e] p-6 text-center shadow-2xl">
            <div className="font-display text-xs font-bold tracking-widest text-amber-400">
              LEVEL UP
            </div>
            <div className="my-4 font-mono text-5xl font-extrabold text-[#edf0fb] tabular-nums">
              {levelUpModal}
            </div>
            <p className="text-sm text-[#c7cee8]">
              أحسنت يا {activeProfile.player.name}! ارتفع مستواك وزادت قدراتك.
            </p>
            <button
              type="button"
              onClick={() => setLevelUpModal(null)}
              className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              متابعة
            </button>
          </div>
        </div>
      )}

      {/* Shadow Chest Loot Modal */}
      {chestLootText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="مكافأة الصندوق الأسبوعي"
        >
          <div className="w-full max-w-sm rounded-2xl border border-violet-500/50 bg-[#0d111e] p-6 text-center shadow-2xl">
            <div className="font-display text-xs font-bold tracking-widest text-cyan-400">
              WEEKLY CHEST REWARD
            </div>
            <p className="my-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm font-bold text-amber-300">
              {chestLootText}
            </p>
            <button
              type="button"
              onClick={() => setChestLootText(null)}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500"
            >
              استلام
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
