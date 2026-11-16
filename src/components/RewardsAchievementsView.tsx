import { useState, type FormEvent } from 'react';
import { Award, Check, Gift, Lock, Package, Plus, Trash2, Trophy } from 'lucide-react';
import type { ProfileState } from '../types/system';
import { ACHIEVEMENTS, RANKS, weekQuestTotals } from '../utils/leveling';

interface RewardsViewProps {
  profile: ProfileState;
  onAddReward: (name: string) => void;
  onRedeemReward: (id: string) => void;
  onDeleteReward: (id: string) => void;
  onOpenShadowChest: () => void;
}

export function RewardsView({
  profile,
  onAddReward,
  onRedeemReward,
  onDeleteReward,
  onOpenShadowChest,
}: RewardsViewProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const weekDone = weekQuestTotals(profile);
  const goal = profile.settings.weeklyGoal || 20;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اكتب اسم المكافأة الواقعية أولًا.');
      return;
    }
    setError('');
    onAddReward(name.trim());
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Shadow Chest */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
              <Package className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#edf0fb]">صندوق المكافآت الأسبوعي</h2>
              <p className="mt-1 text-xs text-[#8e97b8]">
                أكمل {goal} مهمة خلال الأسبوع لفتح صندوق المكافأة الإضافية · التقدم الحالي:{' '}
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  {weekDone}/{goal}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={profile.chestOpened}
            onClick={onOpenShadowChest}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
              profile.chestOpened
                ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default'
                : profile.chestUnlocked
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'border border-[#242d4d] bg-[#121728] text-[#9aa3c2] hover:border-violet-500'
            }`}
          >
            {profile.chestOpened ? (
              <>
                <Check className="h-4 w-4" />
                <span>تم فتح صندوق هذا الأسبوع</span>
              </>
            ) : profile.chestUnlocked ? (
              <>
                <Gift className="h-4 w-4" />
                <span>افتح الصندوق الآن</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>مقفل ({weekDone}/{goal})</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Real-world Rewards */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="border-b border-[#1f2742] pb-3">
          <h3 className="text-sm font-bold text-[#edf0fb]">المكافآت الواقعية الشخصية</h3>
          <p className="mt-0.5 text-xs text-[#8e97b8]">
            أضف مكافآت بسيطة لنفسك عند تحقيق أهدافك اليومية (مثل: كوب قهوة مميز، حلقة مسلسل، وقت ألعاب)
          </p>
        </div>

        <div className="mt-4 divide-y divide-[#1a2138]">
          {profile.realRewards.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8e97b8]">
              لا توجد مكافآت مضافة بعد. أضف أول مكافأة بالأسفل.
            </p>
          ) : (
            profile.realRewards.map((rw) => (
              <div
                key={rw.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#edf0fb] truncate">
                    {rw.name}
                  </div>
                  <div className="text-xs text-[#7e87a8] font-mono tabular-nums">
                    مرات الاستلام: {rw.redeemedCount}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRedeemReward(rw.id)}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 whitespace-nowrap"
                  >
                    استلام المكافأة
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteReward(rw.id)}
                    aria-label={`حذف مكافأة ${rw.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6e7799] hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3 border-t border-[#1f2742] pt-4">
          <label htmlFor="reward-input" className="sr-only">
            اسم المكافأة
          </label>
          <input
            id="reward-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="مثال: مشاهدة حلقة مفضلة أو خروج مع الأصدقاء..."
            className="flex-1 rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مكافأة</span>
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
      </section>

      {profile.unlockedTitles.length > 0 && (
        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <h3 className="text-sm font-bold text-[#edf0fb] mb-3">الألقاب المفتوحة من الصندوق</h3>
          <div className="flex flex-wrap gap-3 text-sm text-amber-300">
            {profile.unlockedTitles.map((t, i) => (
              <span key={i} className="font-semibold">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function AchievementsView({ profile }: { profile: ProfileState }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex items-center gap-2 border-b border-[#1f2742] pb-3">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h2 className="text-base font-bold text-[#edf0fb]">سلم الرتب</h2>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RANKS.map((r) => {
            const unlocked = profile.player.level >= r.minLevel;
            return (
              <div
                key={r.name}
                className={`rounded-xl border p-3.5 transition-colors ${
                  unlocked
                    ? 'border-[#2a345a] bg-[#121728]'
                    : 'border-[#181e33] bg-[#090c16] opacity-55'
                }`}
              >
                <div className="font-display text-sm font-bold" style={{ color: r.color }}>
                  {r.name}
                </div>
                <div className="mt-1 text-xs text-[#c7cee8]">{r.desc}</div>
                <div className="mt-2 font-mono text-[11px] text-[#7e87a8] tabular-nums">
                  المستوى {r.minLevel}+
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex items-center justify-between border-b border-[#1f2742] pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-violet-400" />
            <h3 className="text-base font-bold text-[#edf0fb]">الإنجازات</h3>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400 tabular-nums">
            {Object.keys(profile.achievements).length} / {ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = profile.achievements[ach.id];
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-4 ${
                  unlocked
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-[#1f2742] bg-[#121728] opacity-65'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#edf0fb]">{ach.name}</span>
                  {unlocked ? (
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-[#6e7799] shrink-0" />
                  )}
                </div>
                <p className="mt-1 text-xs text-[#9aa3c2]">{ach.desc}</p>
                <div className="mt-2 text-[11px] text-[#7e87a8]">
                  {unlocked
                    ? `فُتح في ${new Date(unlocked.unlockedAt).toLocaleDateString('ar-EG')}`
                    : 'لم يفتح بعد'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
