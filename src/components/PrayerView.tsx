import { Check, Moon, Sun, Sunrise, Sunset, X } from 'lucide-react';
import type { PrayerKey, PrayerStatus, ProfileState } from '../types/system';
import { dayData, PRAYERS, weekKeys } from '../utils/leveling';

interface PrayerViewProps {
  profile: ProfileState;
  onSetPrayer: (key: PrayerKey, status: Exclude<PrayerStatus, null>) => void;
}

function PrayerIcon({ k }: { k: PrayerKey }) {
  switch (k) {
    case 'fajr':
      return <Sunrise className="h-5 w-5 text-amber-300" />;
    case 'dhuhr':
      return <Sun className="h-5 w-5 text-yellow-400" />;
    case 'asr':
      return <Sun className="h-5 w-5 text-orange-300" />;
    case 'maghrib':
      return <Sunset className="h-5 w-5 text-rose-400" />;
    case 'isha':
      return <Moon className="h-5 w-5 text-violet-300" />;
  }
}

export function PrayerView({ profile, onSetPrayer }: PrayerViewProps) {
  const prayedToday = PRAYERS.filter(
    (p) => profile.today.prayers[p.key] === 'prayed'
  ).length;
  const last7 = weekKeys(7).reverse();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#edf0fb]">متابعة الصلوات الخمس</h2>
            <p className="mt-0.5 text-xs text-[#8e97b8]">
              كل صلاة في وقتها تمنحك +{profile.settings.xpValues.prayer} XP · اضغط مرة أخرى للتراجع أو التعديل
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
            {prayedToday} / 5 اليوم
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#1a2138]">
          {PRAYERS.map((p) => {
            const st = profile.today.prayers[p.key];
            return (
              <div
                key={p.key}
                className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#242d4d] bg-[#121728]">
                    <PrayerIcon k={p.key} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#edf0fb]">{p.name}</div>
                    <div className="font-display text-[11px] text-[#7e87a8]">{p.en}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={st === 'prayed'}
                    onClick={() => onSetPrayer(p.key, 'prayed')}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                      st === 'prayed'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-[#242d4d] bg-[#121728] text-[#c7cee8] hover:border-emerald-500/50'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>صليت</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={st === 'missed'}
                    onClick={() => onSetPrayer(p.key, 'missed')}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                      st === 'missed'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                        : 'border-[#242d4d] bg-[#121728] text-[#8e97b8] hover:border-rose-500/50'
                    }`}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>فاتت</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <h3 className="text-sm font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
          سجل آخر 7 أيام
        </h3>
        <div className="mt-3 divide-y divide-[#1a2138]">
          {last7.map((dateStr) => {
            const rec = dayData(profile, dateStr);
            const prayed = rec
              ? PRAYERS.filter((p) => rec.prayers[p.key] === 'prayed').length
              : 0;
            const missed = rec
              ? PRAYERS.filter((p) => rec.prayers[p.key] === 'missed').length
              : 0;
            const d = new Date(`${dateStr}T12:00:00`);
            const label = d.toLocaleDateString('ar-EG', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={dateStr}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="text-[#c7cee8]">
                  {label}
                  {dateStr === profile.today.date ? ' (اليوم)' : ''}
                </span>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-emerald-400">{prayed}/5</span>
                  {missed > 0 && <span className="text-rose-400">فات {missed}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
