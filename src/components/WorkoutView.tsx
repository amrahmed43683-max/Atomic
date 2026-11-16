import { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Dumbbell,
  Flame,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { ProfileState, WorkoutTier } from '../types/system';
import { localDateStr, weekKeys } from '../utils/leveling';
import {
  DAY_NAMES_AR,
  getWorkoutForDay,
  recommendWorkoutTier,
  resolveEffectiveWeightKg,
  WORKOUT_TIERS,
} from '../utils/workouts';

interface WorkoutViewProps {
  profile: ProfileState;
  onToggleWorkoutDay: (dayIndex: number) => void;
  onCompleteWorkout: (tierUsed: WorkoutTier) => void;
  onToggleRestDay: () => void;
  onSetTierOverride: (tier: WorkoutTier | null) => void;
  onUpdateDumbbellConfig: (hasDumbbells: boolean, weightKg: number) => void;
  onToggleExerciseSet: (
    exerciseId: string,
    setIdx: number,
    totalSets: number,
    defaultWeightKg: number
  ) => void;
  onUpdateExerciseWeight: (exerciseId: string, weightKg: number, totalSets: number) => void;
  onTimerBeep: () => void;
}

export function WorkoutView({
  profile,
  onToggleWorkoutDay,
  onCompleteWorkout,
  onToggleRestDay,
  onSetTierOverride,
  onUpdateDumbbellConfig,
  onToggleExerciseSet,
  onUpdateExerciseWeight,
  onTimerBeep,
}: WorkoutViewProps) {
  const todayDayIdx = new Date().getDay();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayDayIdx);
  const [sessionActive, setSessionActive] = useState(false);
  const [editScheduleMode, setEditScheduleMode] = useState(false);

  // Built-in Rest Countdown Timer
  const [restRemaining, setRestRemaining] = useState(0);
  const [restRunning, setRestRunning] = useState(false);

  useEffect(() => {
    if (!restRunning) return;
    const id = window.setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          setRestRunning(false);
          onTimerBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [restRunning, onTimerBeep]);

  const startRest = (seconds: number) => {
    if (seconds <= 0) return;
    setRestRemaining(seconds);
    setRestRunning(true);
  };

  const recommendedTier = recommendWorkoutTier(
    profile.player.fitnessLevel,
    profile.totalWorkouts,
    profile.player.level
  );
  const activeTier: WorkoutTier = profile.player.workoutTierOverride ?? recommendedTier;
  const tierMeta = WORKOUT_TIERS[activeTier];

  const plan = getWorkoutForDay({
    dayIndex: selectedDayIdx,
    workoutDays: profile.workoutDays,
    tier: activeTier,
    hasDumbbells: profile.player.hasDumbbells,
  });

  const isViewingToday = selectedDayIdx === todayDayIdx;

  // Weekly statistics
  const weekSessions = weekKeys(7).filter((k) => {
    if (k === profile.today.date) return profile.today.workoutDone;
    return profile.history[k]?.workoutDone;
  }).length;

  let lastWorkoutDate: string | null = profile.today.workoutDone ? localDateStr() : null;
  if (!lastWorkoutDate) {
    const sortedKeys = Object.keys(profile.history).sort().reverse();
    for (const k of sortedKeys) {
      if (profile.history[k]?.workoutDone) {
        lastWorkoutDate = k;
        break;
      }
    }
  }

  const totalSetsInPlan = plan.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSetsInPlan = isViewingToday
    ? plan.exercises.reduce((acc, ex) => {
        const log = profile.today.workoutLogs[ex.id];
        if (!log) return acc;
        return acc + log.setsDone.filter(Boolean).length;
      }, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Balanced Split Selector */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#edf0fb]">
              الجدول الأسبوعي المتناسق
            </h2>
            <p className="mt-0.5 text-xs text-[#8e97b8]">
              توزيع متوازن للعضلات على مدار الأسبوع (دفع · أرجل · استشفاء · سحب · شامل · راحة · كور)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditScheduleMode((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              editScheduleMode
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                : 'border-[#242d4d] bg-[#121728] text-[#c7cee8] hover:border-violet-500/50'
            }`}
          >
            {editScheduleMode ? 'إنهاء تعديل الأيام' : 'تخصيص أيام التمرين'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {DAY_NAMES_AR.map((dayName, idx) => {
            const isTraining = profile.workoutDays.includes(idx);
            const isToday = idx === todayDayIdx;
            const isSelected = idx === selectedDayIdx;
            const dayPlan = getWorkoutForDay({
              dayIndex: idx,
              workoutDays: profile.workoutDays,
              tier: activeTier,
              hasDumbbells: profile.player.hasDumbbells,
            });

            return (
              <button
                key={dayName}
                type="button"
                onClick={() => {
                  if (editScheduleMode) {
                    onToggleWorkoutDay(idx);
                  } else {
                    setSelectedDayIdx(idx);
                  }
                }}
                className={`flex flex-col items-start justify-between rounded-xl border p-3 text-right transition-colors min-h-[84px] ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/15'
                    : isTraining
                      ? 'border-[#242d4d] bg-[#121728] hover:border-violet-500/40'
                      : 'border-[#1a2036] bg-[#0a0d17] text-[#7e87a8] hover:border-[#2a3354]'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#edf0fb]">
                    {dayName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isToday
                        ? 'text-cyan-400'
                        : isTraining
                          ? 'text-emerald-400'
                          : 'text-[#6e7799]'
                    }`}
                  >
                    {isToday ? 'اليوم' : isTraining ? 'تمرين' : 'راحة'}
                  </span>
                </div>
                <div className="mt-2 text-[11px] leading-snug text-[#9aa3c2] line-clamp-2">
                  {editScheduleMode
                    ? isTraining
                      ? 'يوم تمرين (اضغط للإلغاء)'
                      : 'يوم راحة (اضغط للتفعيل)'
                    : dayPlan.splitTitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Progressive Tier & Dumbbell Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-[#edf0fb]">
                تدرج الصعوبة التدريجي (المستوى {activeTier} من 5)
              </h3>
            </div>
            {profile.player.workoutTierOverride !== null ? (
              <button
                type="button"
                onClick={() => onSetTierOverride(null)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                العودة للتلقائي (المقترح: {recommendedTier})
              </button>
            ) : (
              <span className="text-xs text-[#8e97b8]">
                مقترح تلقائيًا حسب مستواك وجلساتك
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as WorkoutTier[]).map((t) => {
              const selected = activeTier === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSetTierOverride(t)}
                  className={`rounded-xl border py-2.5 px-2 text-center transition-colors ${
                    selected
                      ? 'border-violet-500 bg-violet-600/20 text-white'
                      : 'border-[#1f2742] bg-[#121728] text-[#8e97b8] hover:border-[#2e385c]'
                  }`}
                >
                  <div className="font-mono text-sm font-bold tabular-nums">T{t}</div>
                  <div className="mt-0.5 text-[10px] truncate">
                    {WORKOUT_TIERS[t].label.split('·')[1]?.trim()}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#9aa3c2]">{tierMeta.description}</p>
        </div>

        <div className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-[#edf0fb]">أوزان الدامبلز</h3>
                <p className="text-[11px] text-[#8e97b8]">
                  {profile.player.hasDumbbells ? 'مفعّلة في التمارين' : 'وضع وزن الجسم فقط'}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.player.hasDumbbells}
              aria-label="تبديل استخدام الدامبلز"
              onClick={() =>
                onUpdateDumbbellConfig(
                  !profile.player.hasDumbbells,
                  profile.player.dumbbellWeightKg
                )
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                profile.player.hasDumbbells ? 'bg-violet-600' : 'bg-[#252d4a]'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  profile.player.hasDumbbells ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#1f2742] bg-[#121728] px-3 py-2.5">
            <span className="text-xs text-[#9aa3c2]">الوزن الأساسي (لليد)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!profile.player.hasDumbbells || profile.player.dumbbellWeightKg <= 1}
                aria-label="إنقاص وزن الدامبل"
                onClick={() =>
                  onUpdateDumbbellConfig(
                    profile.player.hasDumbbells,
                    Math.max(1, profile.player.dumbbellWeightKg - 2.5)
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#242d4d] text-[#c7cee8] hover:border-cyan-400 disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[58px] text-center font-mono text-sm font-bold text-cyan-300 tabular-nums">
                {profile.player.dumbbellWeightKg} كجم
              </span>
              <button
                type="button"
                disabled={!profile.player.hasDumbbells}
                aria-label="زيادة وزن الدامبل"
                onClick={() =>
                  onUpdateDumbbellConfig(
                    profile.player.hasDumbbells,
                    Math.min(50, profile.player.dumbbellWeightKg + 2.5)
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#242d4d] text-[#c7cee8] hover:border-cyan-400 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Day Routine & Guided Session */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2742] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8e97b8]">
              <span className="font-semibold text-cyan-400">{plan.dayNameAr}</span>
              <span aria-hidden="true">·</span>
              <span>{plan.focusMuscles}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">~{plan.estimatedMinutes} دقيقة</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-[#edf0fb]">{plan.splitTitle}</h3>
          </div>

          {isViewingToday && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {!plan.isRestOrRecovery && (
                <button
                  type="button"
                  onClick={() => setSessionActive((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
                >
                  {sessionActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{sessionActive ? 'إخفاء مؤقت الجلسة' : 'ابدأ الجلسة'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onCompleteWorkout(activeTier)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  profile.today.workoutDone
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>
                  {profile.today.workoutDone
                    ? 'مكتمل اليوم (اضغط للتراجع)'
                    : `إتمام التمرين (+${profile.settings.xpValues.workout} XP)`}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleRestDay}
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  profile.today.workoutRest
                    ? 'border-amber-400/60 bg-amber-500/15 text-amber-300'
                    : 'border-[#242d4d] bg-[#121728] text-[#c7cee8] hover:border-amber-400/40'
                }`}
              >
                {profile.today.workoutRest ? 'إلغاء يوم الراحة' : 'تحديد كيوم راحة'}
              </button>
            </div>
          )}
        </div>

        {/* Built-in Rest Timer Bar */}
        {(sessionActive || restRemaining > 0) && isViewingToday && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-500/30 bg-[#0b1222] p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-xs text-[#9aa3c2]">مؤقت الراحة بين المجموعات</div>
                <div className="font-mono text-2xl font-bold text-cyan-300 tabular-nums">
                  {String(Math.floor(restRemaining / 60)).padStart(2, '0')}:
                  {String(restRemaining % 60).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[30, 45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => startRest(sec)}
                  className="rounded-lg border border-[#242d4d] bg-[#121728] px-3 py-1.5 font-mono text-xs font-semibold text-[#edf0fb] hover:border-cyan-400 tabular-nums"
                >
                  {sec}ث
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRestRunning(false);
                  setRestRemaining(0);
                }}
                aria-label="إيقاف مؤقت الراحة"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#242d4d] text-[#9aa3c2] hover:border-rose-400 hover:text-rose-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Session Progress Indicator */}
        {isViewingToday && !plan.isRestOrRecovery && (
          <div className="mt-4 flex items-center justify-between text-xs text-[#8e97b8]">
            <span>تقدم مجموعات اليوم</span>
            <span className="font-mono font-bold text-violet-300 tabular-nums">
              {completedSetsInPlan} / {totalSetsInPlan} مجموعات
            </span>
          </div>
        )}

        {/* Exercises List */}
        <div className="mt-4 space-y-3">
          {plan.exercises.map((ex, idx) => {
            const suggestedKg = ex.usesDumbbells
              ? resolveEffectiveWeightKg(
                  profile.player.dumbbellWeightKg,
                  ex.suggestedWeightFactor,
                  activeTier
                )
              : 0;
            const log = profile.today.workoutLogs[ex.id];
            const setsDone =
              log?.setsDone && log.setsDone.length === ex.sets
                ? log.setsDone
                : Array.from({ length: ex.sets }, (_, i) => log?.setsDone?.[i] ?? false);
            const activeWeightKg = log?.weightKg ?? suggestedKg;
            const allSetsChecked = setsDone.every(Boolean);

            return (
              <div
                key={ex.id}
                className={`rounded-xl border p-4 transition-colors ${
                  allSetsChecked && isViewingToday
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-[#1f2742] bg-[#121728]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8e97b8]">
                      <span className="font-mono text-violet-300 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ex.muscleGroup}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          ex.usesDumbbells
                            ? 'font-semibold text-cyan-400'
                            : 'text-[#9aa3c2]'
                        }
                      >
                        {ex.equipmentLabel}
                      </span>
                    </div>

                    <h4 className="mt-1 text-base font-bold text-[#edf0fb]">
                      {ex.name}
                    </h4>
                    <div className="mt-0.5 text-xs text-[#7e87a8] font-display">
                      {ex.nameEn}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#c7cee8] tabular-nums">
                      <span className="font-mono font-semibold text-amber-300">
                        {ex.sets} مجموعات × {ex.repsOrDuration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>الإيقاع: {ex.tempoNote}</span>
                      {ex.restSeconds > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>راحة: {ex.restSeconds}ث</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-[#8e97b8]">{ex.formCue}</p>
                  </div>

                  {/* Interactive Sets + Dumbbell Weight Adjustment */}
                  {isViewingToday && (
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
                      {ex.usesDumbbells && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-[#242d4d] bg-[#0b0f1c] px-2.5 py-1.5">
                          <span className="text-[11px] text-[#8e97b8]">الوزن:</span>
                          <button
                            type="button"
                            aria-label={`إنقاص وزن ${ex.name}`}
                            onClick={() =>
                              onUpdateExerciseWeight(
                                ex.id,
                                Math.max(1, activeWeightKg - 1),
                                ex.sets
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9aa3c2] hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[52px] text-center font-mono text-xs font-bold text-cyan-300 tabular-nums">
                            {activeWeightKg} كجم
                          </span>
                          <button
                            type="button"
                            aria-label={`زيادة وزن ${ex.name}`}
                            onClick={() =>
                              onUpdateExerciseWeight(
                                ex.id,
                                Math.min(60, activeWeightKg + 1),
                                ex.sets
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9aa3c2] hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {setsDone.map((done, setIdx) => (
                          <button
                            key={setIdx}
                            type="button"
                            aria-pressed={done}
                            onClick={() => {
                              onToggleExerciseSet(
                                ex.id,
                                setIdx,
                                ex.sets,
                                activeWeightKg
                              );
                              if (!done && ex.restSeconds > 0) {
                                startRest(ex.restSeconds);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                              done
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                                : 'border-[#242d4d] bg-[#0d111e] text-[#c7cee8] hover:border-violet-500'
                            }`}
                          >
                            <Check className={`h-3.5 w-3.5 ${done ? 'opacity-100' : 'opacity-30'}`} />
                            <span className="tabular-nums">جولة {setIdx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workout History Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8e97b8]">آخر جلسة تمرين</div>
            <div className="mt-1 font-mono text-base font-bold text-[#edf0fb] tabular-nums">
              {lastWorkoutDate ?? 'لم يبدأ بعد'}
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-violet-400" />
        </div>

        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8e97b8]">جلسات هذا الأسبوع</div>
            <div className="mt-1 font-mono text-base font-bold text-cyan-400 tabular-nums">
              {weekSessions} / {profile.workoutDays.length}
            </div>
          </div>
          <Flame className="h-5 w-5 text-amber-400" />
        </div>

        <div className="rounded-xl border border-[#1f2742] bg-[#0d111e] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8e97b8]">إجمالي الجلسات المكتملة</div>
            <div className="mt-1 font-mono text-base font-bold text-emerald-400 tabular-nums">
              {profile.totalWorkouts}
            </div>
          </div>
          <Dumbbell className="h-5 w-5 text-emerald-400" />
        </div>
      </section>
    </div>
  );
}
