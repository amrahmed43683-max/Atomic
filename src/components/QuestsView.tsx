import { useState, type FormEvent } from 'react';
import { Check, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { AttributeKey, ProfileState } from '../types/system';

interface QuestsViewProps {
  mode: 'main' | 'side';
  profile: ProfileState;
  onToggleMainQuest: (id: string) => void;
  onToggleSideQuest: (id: string) => void;
  onAddQuest: (type: 'main' | 'side', title: string, attr: AttributeKey) => void;
  onDeleteQuest: (type: 'main' | 'side', id: string) => void;
  onRefreshSideQuests: () => void;
}

export function QuestsView({
  mode,
  profile,
  onToggleMainQuest,
  onToggleSideQuest,
  onAddQuest,
  onDeleteQuest,
  onRefreshSideQuests,
}: QuestsViewProps) {
  const [title, setTitle] = useState('');
  const [attr, setAttr] = useState<AttributeKey>(
    mode === 'main' ? 'discipline' : 'knowledge'
  );
  const [error, setError] = useState('');

  const list =
    mode === 'main' ? profile.today.mainQuests : profile.today.sideQuests;
  const doneCount = list.filter((q) => q.done).length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) {
      setError('اكتب عنوان المهمة أولًا.');
      return;
    }
    setError('');
    onAddQuest(mode, clean, attr);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#edf0fb]">
              {mode === 'main' ? 'المهام اليومية الأساسية' : 'المهام الجانبية المتجددة'}
            </h2>
            <p className="mt-0.5 text-xs text-[#8e97b8]">
              {mode === 'main'
                ? `أكمل كل المهام الأساسية للحصول على مكافأة إضافية (+${profile.settings.xpValues.allDaily} XP)`
                : `أكمل مهمتين جانبيتين لفتح مكافأة البونص (+${profile.settings.xpValues.sideBonus} XP)`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-cyan-400 tabular-nums">
              {doneCount} / {list.length} مكتمل
            </span>
            {mode === 'side' && (
              <button
                type="button"
                onClick={onRefreshSideQuests}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#242d4d] bg-[#121728] px-3 py-2 text-xs font-semibold text-[#c7cee8] transition-colors hover:border-violet-500 hover:text-white whitespace-nowrap"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>تبديل المهام</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#1a2138]">
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8e97b8]">
              لا توجد مهام حاليًا. أضف مهمة جديدة من النموذج بالأسفل.
            </p>
          ) : (
            list.map((q) => {
              const xpVal =
                mode === 'main'
                  ? profile.settings.xpValues[q.xpKey ?? 'mainQuest'] ?? 20
                  : profile.settings.xpValues.sideQuest;
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={q.done}
                      aria-label={q.done ? `إلغاء إكمال ${q.title}` : `إكمال ${q.title}`}
                      onClick={() =>
                        mode === 'main'
                          ? onToggleMainQuest(q.id)
                          : onToggleSideQuest(q.id)
                      }
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
                        {q.custom && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-violet-300">مخصصة</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteQuest(mode, q.id)}
                    aria-label={`حذف ${q.title}`}
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

      {/* Add New Quest Form */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <h3 className="text-sm font-bold text-[#edf0fb] mb-3">
          {mode === 'main' ? 'إضافة مهمة يومية دائمة' : 'إضافة مهمة جانبية'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor={`add-quest-${mode}`} className="sr-only">
              عنوان المهمة
            </label>
            <input
              id={`add-quest-${mode}`}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="اكتب عنوان المهمة الجديدة..."
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
            />
          </div>

          <label htmlFor={`attr-select-${mode}`} className="sr-only">
            الصفة المرتبطة
          </label>
          <select
            id={`attr-select-${mode}`}
            value={attr}
            onChange={(e) => setAttr(e.target.value as AttributeKey)}
            className="rounded-xl border border-[#242d4d] bg-[#070911] px-3 py-2.5 text-sm text-[#edf0fb] focus:border-violet-500 focus:outline-none"
          >
            <option value="discipline">الانضباط</option>
            <option value="knowledge">المعرفة</option>
            <option value="strength">القوة</option>
            <option value="consistency">الاستمرارية</option>
          </select>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة</span>
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
      </section>
    </div>
  );
}
