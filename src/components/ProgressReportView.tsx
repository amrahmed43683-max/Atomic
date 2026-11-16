import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, FileText, Save } from 'lucide-react';
import type { ProfileState } from '../types/system';
import {
  ACHIEVEMENTS,
  dayData,
  PRAYERS,
  weekCommittedDaysCount,
  weekKeys,
  weekQuestTotals,
} from '../utils/leveling';
import { XpChart } from './XpChart';

export function ProgressView({ profile }: { profile: ProfileState }) {
  const [range, setRange] = useState<7 | 14 | 30>(7);

  const days = weekKeys(range);
  const points = days.map((dateStr) => {
    const rec = dayData(profile, dateStr);
    const d = new Date(`${dateStr}T12:00:00`);
    return {
      date: dateStr,
      label: d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' }),
      xp: rec?.xpGained ?? 0,
    };
  });

  const noteEntries = Object.keys(profile.history)
    .sort()
    .reverse()
    .map((k) => ({ date: k, notes: profile.history[k]?.notes }))
    .filter((x) => x.notes && (x.notes.learned || x.notes.improve))
    .slice(0, 10);

  if (profile.today.notes && (profile.today.notes.learned || profile.today.notes.improve)) {
    noteEntries.unshift({ date: profile.today.date, notes: profile.today.notes });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-bold text-[#edf0fb]">تقدم نقاط الخبرة (XP)</h2>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[#242d4d] bg-[#121728] p-1">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  range === r
                    ? 'bg-violet-600 text-white'
                    : 'text-[#8e97b8] hover:text-white'
                }`}
              >
                {r} يوم
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <XpChart points={points} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <h3 className="text-sm font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
            إحصائيات شاملة
          </h3>
          <dl className="mt-3 divide-y divide-[#1a2138] text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">إجمالي XP</dt>
              <dd className="font-mono font-bold text-cyan-400 tabular-nums">
                {profile.player.totalXp}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">المستوى الحالي</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {profile.player.level}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">إجمالي المهام المنجزة</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {profile.totalQuests}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">جلسات التمرين المكتملة</dt>
              <dd className="font-mono font-bold text-emerald-400 tabular-nums">
                {profile.totalWorkouts}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">الصلوات المسجلة</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {profile.totalPrayers}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-[#8e97b8]">الإنجازات المفتوحة</dt>
              <dd className="font-mono font-bold text-amber-400 tabular-nums">
                {Object.keys(profile.achievements).length} / {ACHIEVEMENTS.length}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <h3 className="text-sm font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
            سجل الملاحظات اليومية
          </h3>
          <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-[#1a2138]">
            {noteEntries.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8e97b8]">
                لا توجد ملاحظات محفوظة بعد — أضف ملاحظاتك من صفحة تقرير اليوم.
              </p>
            ) : (
              noteEntries.map((entry) => (
                <div key={entry.date} className="py-3 first:pt-1">
                  <div className="font-mono text-xs text-cyan-400 tabular-nums">
                    {entry.date}
                  </div>
                  {entry.notes?.learned && (
                    <p className="mt-1 text-xs text-[#edf0fb]">
                      <strong className="text-violet-300">تعلمت:</strong> {entry.notes.learned}
                    </p>
                  )}
                  {entry.notes?.improve && (
                    <p className="mt-1 text-xs text-[#9aa3c2]">
                      <strong className="text-cyan-300">تحسين:</strong> {entry.notes.improve}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface ReportViewProps {
  profile: ProfileState;
  onSaveNotes: (learned: string, improve: string) => void;
}

export function ReportView({ profile, onSaveNotes }: ReportViewProps) {
  const [learned, setLearned] = useState(profile.today.notes?.learned ?? '');
  const [improve, setImprove] = useState(profile.today.notes?.improve ?? '');
  const [savedBanner, setSavedBanner] = useState(false);

  // Sync cleanly when switching profiles or rolling over to a new day
  useEffect(() => {
    setLearned(profile.today.notes?.learned ?? '');
    setImprove(profile.today.notes?.improve ?? '');
  }, [profile.player.id, profile.today.date]);

  const t = profile.today;
  const prayed = PRAYERS.filter((p) => t.prayers[p.key] === 'prayed').length;
  const missed = PRAYERS.filter((p) => t.prayers[p.key] === 'missed').length;
  const mainDone = t.mainQuests.filter((q) => q.done).length;
  const sideDone = t.sideQuests.filter((q) => q.done).length;

  let wMain = 0;
  let wSide = 0;
  let wWork = 0;
  let wPray = 0;
  for (const k of weekKeys(7)) {
    const h = dayData(profile, k);
    if (!h) continue;
    wMain += h.mainQuests.filter((q) => q.done).length;
    wSide += h.sideQuests.filter((q) => q.done).length;
    if (h.workoutDone) wWork++;
    wPray += PRAYERS.filter((p) => h.prayers[p.key] === 'prayed').length;
  }

  const committedDays = weekCommittedDaysCount(profile);
  const weeklySummaryAdvice =
    committedDays >= 5
      ? 'أسبوع ممتاز! استمر على هذا الإيقاع ويمكنك رفع مستوى صعوبة التمرين درجة واحدة.'
      : committedDays >= 3
        ? 'تقدم جيد ومتوازن — حافظ على الاستمرارية مع مراعاة أيام الراحة.'
        : 'ابدأ بخطوات بسيطة وثابتة؛ الأهم هو الاستمرار بدون ضغط زائد.';

  const handleSave = () => {
    onSaveNotes(learned.trim(), improve.trim());
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <div className="flex items-center gap-2 border-b border-[#1f2742] pb-3">
            <FileText className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-bold text-[#edf0fb]">تقرير اليوم</h2>
          </div>
          <dl className="mt-3 divide-y divide-[#1a2138] text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-[#8e97b8]">XP المكتسبة اليوم</dt>
              <dd className="font-mono font-bold text-cyan-400 tabular-nums">+{t.xpGained}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#8e97b8]">المهام الأساسية</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {mainDone}/{t.mainQuests.length}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#8e97b8]">المهام الجانبية</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {sideDone}/{t.sideQuests.length}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#8e97b8]">الصلوات (مؤداة / فاتت)</dt>
              <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">
                {prayed}/5 · فات {missed}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#8e97b8]">التمرين</dt>
              <dd className="font-semibold text-[#edf0fb]">
                {t.workoutDone ? 'مكتمل ✓' : t.workoutRest ? 'يوم راحة' : 'لم يُسجل بعد'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
              ملخص الأسبوع
            </h3>
            <dl className="mt-3 divide-y divide-[#1a2138] text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-[#8e97b8]">مهام أساسية + جانبية</dt>
                <dd className="font-mono font-bold text-cyan-400 tabular-nums">
                  {wMain + wSide} / {profile.settings.weeklyGoal}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#8e97b8]">جلسات التمرين</dt>
                <dd className="font-mono font-bold text-emerald-400 tabular-nums">{wWork}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#8e97b8]">صلوات الأسبوع</dt>
                <dd className="font-mono font-bold text-[#edf0fb] tabular-nums">{wPray}/35</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-[#8e97b8]">أيام الالتزام</dt>
                <dd className="font-mono font-bold text-amber-400 tabular-nums">
                  {committedDays}/7
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 rounded-xl border border-[#242d4d] bg-[#121728] p-3 text-xs text-[#c7cee8] leading-relaxed">
            {weeklySummaryAdvice}
          </p>
        </section>
      </div>

      {/* Daily Reflections */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="notes-learned"
              className="block text-sm font-bold text-[#edf0fb] mb-2"
            >
              ماذا تعلمت اليوم؟
            </label>
            <textarea
              id="notes-learned"
              rows={3}
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="دوّن معلومة، فكرة، أو إنجازًا من يومك..."
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] p-3.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="notes-improve"
              className="block text-sm font-bold text-[#edf0fb] mb-2"
            >
              ماذا يمكنني تحسينه غدًا؟
            </label>
            <textarea
              id="notes-improve"
              rows={3}
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="نقطة واحدة تركز عليها غدًا..."
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] p-3.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500"
          >
            <Save className="h-4 w-4" />
            <span>حفظ الملاحظات</span>
          </button>
          {savedBanner && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              تم حفظ الملاحظات
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
