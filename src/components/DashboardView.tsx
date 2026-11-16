import {
  Award,
  Check,
  Dumbbell,
  Flame,
  Gem,
  ListChecks,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { AttributeKey, PageId, ProfileState } from '../types/system';
import {
  PRAYERS,
  rankForLevel,
  weekCommittedDaysCount,
  xpForLevel,
} from '../utils/leveling';
import { getWorkoutForDay, recommendWorkoutTier } from '../utils/workouts';

interface DashboardViewProps {
  profile: ProfileState;
  onToggleMainQuest: (id: string) => void;
  onDeleteQuest: (type: 'main' | 'side', id: string) => void;
  onNavigate: (page: PageId) => void;
  onOpenProfiles: () => void;
}

const ATTR_META: { key: AttributeKey; label: string; labelEn: string; barColor: string }[] = [
  { key: 'discipline', label: 'الانضباط', labelEn: 'DISCIPLINE', barColor: 'bg-violet-500' },
  { key: 'knowledge', label: 'المعرفة', labelEn: 'KNOWLEDGE', barColor: 'bg-cyan-400' },
  { key: 'strength', label: 'القوة', labelEn: 'STRENGTH', barColor: 'bg-emerald-400' },
  { key: 'consistency', label: 'الاستمرارية', labelEn: 'CONSISTENCY', barColor: 'bg-amber-400' },
];

export function DashboardView({
  profile,
  onToggleMainQuest,
  onDeleteQuest,
  onNavigate,
  onOpenProfiles,
}: DashboardViewProps) {
  const rank = rankForLevel(profile.player.level);
  const needed = xpForLevel(profile.player.level);
  const pct = Math.min(100, Math.round((profile.player.xp / needed) * 100));

  const mainDone = profile.today.mainQuests.filter((q) => q.done).length;
  const sideDone = profile.today.sideQuests.filter((q) => q.done).length;
  const todayTotalDone = mainDone + sideDone;
  const prayedCount = PRAYERS.filter((p) => profile.today.prayers[p.key] === 'prayed').length;
  const weeklyPct = Math.round((weekCommittedDaysCount(profile) / 7) * 100);

  const activeTier =
    profile.player.workoutTierOverride ??
    recommendWorkoutTier(
      profile.player.fitnessLevel,
      profile.totalWorkouts,
      profile.player.level
    );
  const todayPlan = getWorkoutForDay({
    dayIndex: new Date().getDay(),
    workoutDays: profile.workoutDays,
    tier: activeTier,
    hasDumbbells: profile.player.hasDumbbells,
  });

  const initial = profile.player.name.trim().charAt(0).toUpperCase() || 'P';

  return (
    <div className="space-y-6">
      {/* Hero Player Banner */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-600/15 font-display text-2xl font-bold text-violet-200">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold text-[#edf0fb] truncate">
                  {profile.player.name}
                </h2>
                <span
                  className="font-display text-xs font-bold tracking-wider"
                  style={{ color: rank.color }}
                >
                  {rank.name}
                </span>
                <span className="text-xs text-[#7e87a8]">·</span>
                <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                  LEVEL {profile.player.level}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8e97b8]">
                {rank.desc} · {profile.player.hasDumbbells ? `دامبلز ${profile.player.dumbbellWeightKg} كجم` : 'تدريب بوزن الجسم'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenProfiles}
              className="rounded-xl border border-[#242d4d] bg-[#121728] px-4 py-2 text-xs font-semibold text-[#c7cee8] transition-colors hover:border-violet-500/50 hover:text-white whitespace-nowrap shrink-0"
            >
              تبديل / إدارة الحساب
            </button>
            <button
              type="button"
              onClick={() => onNavigate('workout')}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap shrink-0"
            >
              <Dumbbell className="h-4 w-4" />
              <span>{profile.today.workoutDone ? 'مراجعة التمرين' : 'ابدأ تمرين اليوم'}</span>
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-mono text-[#9aa3c2] tabular-nums">
              XP: {profile.player.xp} / {needed}
            </span>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#161c30]">
            <div
              className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-violet-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* 4 KPI Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4">
          <div className="flex items-center justify-between text-xs text-[#8e97b8]">
            <span>إجمالي النقاط</span>
            <Gem className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#edf0fb] tabular-nums">
            {profile.player.totalXp}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7e87a8]">TOTAL XP</div>
        </div>

        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4">
          <div className="flex items-center justify-between text-xs text-[#8e97b8]">
            <span>أيام الالتزام</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#edf0fb] tabular-nums">
            {profile.player.streak}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7e87a8]">STREAK</div>
        </div>

        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4">
          <div className="flex items-center justify-between text-xs text-[#8e97b8]">
            <span>مهام اليوم المنجزة</span>
            <ListChecks className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#edf0fb] tabular-nums">
            {todayTotalDone}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7e87a8]">
            اليوم +{profile.today.xpGained} XP
          </div>
        </div>

        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4">
          <div className="flex items-center justify-between text-xs text-[#8e97b8]">
            <span>الإنجازات المفتوحة</span>
            <Award className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#edf0fb] tabular-nums">
            {Object.keys(profile.achievements).length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7e87a8]">ACHIEVEMENTS</div>
        </div>
      </section>

      {/* 2-Column Attributes + Quick Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1f2742] pb-3">
            <h3 className="text-sm font-bold text-[#edf0fb]">صفات اللاعب</h3>
            <span className="font-display text-xs text-[#7e87a8]">ATTRIBUTES</span>
          </div>
          <div className="mt-4 space-y-4">
            {ATTR_META.map((attr) => {
              const val = Math.max(0, Math.min(100, profile.attributes[attr.key] ?? 10));
              return (
                <div key={attr.key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#d7ddf5]">{attr.label}</span>
                    <span className="font-mono text-[#9aa3c2] tabular-nums">
                      {attr.labelEn} · {val}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#161c30]">
                    <div
                      className={`h-full rounded-full ${attr.barColor} transition-all duration-300`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1f2742] pb-3">
            <h3 className="text-sm font-bold text-[#edf0fb]">نظرة سريعة</h3>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <dl className="mt-4 divide-y divide-[#1a2138] text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">الصلوات اليوم</dt>
              <dd className="font-mono font-bold text-cyan-400 tabular-nums">{prayedCount}/5</dd>
            </div>
            <div className="flex items-center justify-between py-2.5 gap-4">
              <dt className="text-[#8e97b8]">تمرين اليوم</dt>
              <dd className="text-left font-semibold text-[#edf0fb] truncate">
                {profile.today.workoutDone
                  ? 'مكتمل ✓'
                  : profile.today.workoutRest
                    ? 'يوم راحة'
                    : todayPlan.splitTitle}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">المهام الجانبية</dt>
              <dd className="font-mono font-bold text-violet-300 tabular-nums">
                {sideDone}/{profile.today.sideQuests.length}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">الالتزام الأسبوعي</dt>
              <dd className="font-mono font-bold text-emerald-400 tabular-nums">{weeklyPct}%</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">الرتبة الحالية</dt>
              <dd className="font-display font-bold" style={{ color: rank.color }}>
                {rank.name}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Quick Today Quests */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex items-center justify-between border-b border-[#1f2742] pb-3">
          <h3 className="text-sm font-bold text-[#edf0fb]">مهام اليوم السريعة</h3>
          <button
            type="button"
            onClick={() => onNavigate('quests')}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 whitespace-nowrap"
          >
            إدارة كل المهام
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#1a2138]">
          {profile.today.mainQuests.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8e97b8]">
              لا توجد مهام حالية. أضف مهمة من صفحة المهام اليومية.
            </p>
          ) : (
            profile.today.mainQuests.map((q) => {
              const xpVal = profile.settings.xpValues[q.xpKey ?? 'mainQuest'] ?? 20;
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={q.done}
                      aria-label={q.done ? `إلغاء إكمال ${q.title}` : `إكمال ${q.title}`}
                      onClick={() => onToggleMainQuest(q.id)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        q.done
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-[#2b3559] bg-[#121728] text-transparent hover:border-violet-400'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          q.done ? 'line-through text-[#6e7799]' : 'text-[#edf0fb]'
                        }`}
                      >
                        {q.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#7e87a8]">
                        <span>{q.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-cyan-400 tabular-nums">+{xpVal} XP</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteQuest('main', q.id)}
                    aria-label={`حذف مهمة ${q.title}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6e7799] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
