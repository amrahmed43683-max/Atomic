import { useEffect, useState, type FormEvent } from 'react';
import { Clock, Pause, Play, Plus, RotateCcw, Trash2, Zap } from 'lucide-react';
import type { ProfileState } from '../types/system';
import { DEFAULT_SCHEDULE, parseScheduleTimeRange } from '../utils/leveling';

interface ScheduleViewProps {
  profile: ProfileState;
  onAddScheduleSlot: (time: string, name: string) => void;
  onDeleteScheduleSlot: (id: string) => void;
  onApplyQuickPlan: () => void;
  onTimerCompleteBeep: () => void;
}

export function ScheduleView({
  profile,
  onAddScheduleSlot,
  onDeleteScheduleSlot,
  onApplyQuickPlan,
  onTimerCompleteBeep,
}: ScheduleViewProps) {
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Focus Pomodoro Timer
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          onTimerCompleteBeep();
          return durationMin * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, durationMin, onTimerCompleteBeep]);

  const selectPreset = (mins: number) => {
    setRunning(false);
    setDurationMin(mins);
    setSecondsLeft(mins * 60);
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const allSlots = [...DEFAULT_SCHEDULE, ...profile.customSchedule].sort((a, b) => {
    const [sa] = parseScheduleTimeRange(a.time);
    const [sb] = parseScheduleTimeRange(b.time);
    return (sa ?? 9999) - (sb ?? 9999);
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!time.trim() || !name.trim()) {
      setError('يرجى إدخال الوقت واسم النشاط (مثال: 20:00 - 21:00).');
      return;
    }
    setError('');
    onAddScheduleSlot(time.trim(), name.trim());
    setTime('');
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#edf0fb]">الجدول اليومي</h2>
              <p className="mt-0.5 text-xs text-[#8e97b8]">
                الكتل الزمنية المخصصة ليومك مع تمييز الفترة النشطة حاليًا
              </p>
            </div>
            <button
              type="button"
              onClick={onApplyQuickPlan}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20 whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>خطة سريعة ليوم مزدحم</span>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {allSlots.map((slot) => {
              const [startMin, endMin] = parseScheduleTimeRange(slot.time);
              const isCurrent =
                startMin !== null &&
                currentMinutes >= startMin &&
                (endMin === null ? currentMinutes < startMin + 60 : currentMinutes < endMin);

              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    isCurrent
                      ? 'border-cyan-400/60 bg-cyan-500/10'
                      : 'border-[#1f2742] bg-[#121728]'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-violet-300 tabular-nums whitespace-nowrap">
                      {slot.time}
                    </span>
                    <span className="text-sm font-medium text-[#edf0fb] truncate">
                      {slot.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-bold text-cyan-400 whitespace-nowrap">
                        · الآن
                      </span>
                    )}
                  </div>

                  {slot.custom && (
                    <button
                      type="button"
                      onClick={() => onDeleteScheduleSlot(slot.id)}
                      aria-label={`حذف نشاط ${slot.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6e7799] hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#1f2742] pt-4"
          >
            <div>
              <label htmlFor="sch-time" className="sr-only">
                الوقت
              </label>
              <input
                id="sch-time"
                type="text"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (error) setError('');
                }}
                placeholder="الوقت (مثال: 20:00 - 21:00)"
                className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-3.5 py-2.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="sch-name" className="sr-only">
                اسم النشاط
              </label>
              <input
                id="sch-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="اسم النشاط..."
                className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-3.5 py-2.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة للجدول</span>
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </section>

        {/* Pomodoro Focus Timer */}
        <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 text-center">
          <div className="flex items-center justify-center gap-2 border-b border-[#1f2742] pb-3">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-[#edf0fb]">مؤقت التركيز (بومودورو)</h3>
          </div>

          <div className="my-6 font-mono text-5xl font-bold text-cyan-300 tabular-nums">
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </div>

          <div className="mb-5 flex justify-center gap-2">
            {[15, 25, 45].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectPreset(m)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs tabular-nums transition-colors ${
                  durationMin === m
                    ? 'border-violet-500 bg-violet-500/20 text-white'
                    : 'border-[#242d4d] bg-[#121728] text-[#9aa3c2]'
                }`}
              >
                {m} د
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{running ? 'إيقاف مؤقت' : 'ابدأ الجلسة'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(durationMin * 60);
              }}
              aria-label="إعادة ضبط المؤقت"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#242d4d] bg-[#121728] text-[#c7cee8] hover:border-cyan-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
