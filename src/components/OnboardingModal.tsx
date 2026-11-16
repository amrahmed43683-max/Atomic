import { useState, type FormEvent } from 'react';
import { Check, Dumbbell, Plus, ShieldCheck, Trash2, User, X } from 'lucide-react';
import type { FitnessLevel, MultiProfileStore } from '../types/system';
import { rankForLevel } from '../utils/leveling';

interface OnboardingModalProps {
  isOpen: boolean;
  isFirstSetup: boolean;
  store: MultiProfileStore;
  onClose: () => void;
  onCreateProfile: (payload: {
    name: string;
    fitnessLevel: FitnessLevel;
    hasDumbbells: boolean;
    dumbbellWeightKg: number;
    setAsDefault: boolean;
  }) => void;
  onQuickDefaultProfile: () => void;
  onSwitchProfile: (profileId: string) => void;
  onSetDefaultProfile: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
}

const FITNESS_OPTIONS: { value: FitnessLevel; label: string; hint: string }[] = [
  { value: 'beginner', label: 'مبتدئ', hint: 'يبدأ بالمستوى التأسيسي (2 مجموعات)' },
  { value: 'intermediate', label: 'متوسط', hint: 'يبدأ بمستوى البناء والدامبلز (3 مجموعات)' },
  { value: 'advanced', label: 'متقدم', hint: 'يبدأ بالمستوى المتوسط/المتقدم (4 مجموعات)' },
];

export function OnboardingModal({
  isOpen,
  isFirstSetup,
  store,
  onClose,
  onCreateProfile,
  onQuickDefaultProfile,
  onSwitchProfile,
  onSetDefaultProfile,
  onDeleteProfile,
}: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('beginner');
  const [hasDumbbells, setHasDumbbells] = useState(true);
  const [dumbbellWeightKg, setDumbbellWeightKg] = useState(5);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const profileList = Object.values(store.profiles);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('يرجى إدخال اسم اللاعب أو اختيار الدخول بحساب افتراضي.');
      return;
    }
    setError('');
    onCreateProfile({
      name: trimmed,
      fitnessLevel,
      hasDumbbells,
      dumbbellWeightKg,
      setAsDefault,
    });
    setName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#242d4d] bg-[#0d111e] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#1f2742] pb-4">
          <div>
            <h2
              id="profile-modal-title"
              className="text-xl font-bold text-[#edf0fb]"
            >
              {isFirstSetup ? 'أنشئ حسابك الشخصي' : 'حسابات اللاعبين'}
            </h2>
            <p className="mt-1 text-sm text-[#8e97b8]">
              {isFirstSetup
                ? 'أنشئ ملفك بالاسم والمستوى الذي يناسبك أو ابدأ فورًا بحساب افتراضي.'
                : 'يمكنك إنشاء حساب جديد، تبديل الحساب النشط، أو تعيين حسابك الافتراضي عند الفتح.'}
            </p>
          </div>
          {!isFirstSetup && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة الحسابات"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1f2742] text-[#8e97b8] transition-colors hover:border-violet-500/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {!isFirstSetup && profileList.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[#c7cee8] mb-3">
              الحسابات المحفوظة ({profileList.length})
            </h3>
            <div className="space-y-2.5">
              {profileList.map((prof) => {
                const isActive = prof.player.id === store.activeProfileId;
                const isDefault = prof.player.id === store.defaultProfileId;
                const rank = rankForLevel(prof.player.level);
                return (
                  <div
                    key={prof.player.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                      isActive
                        ? 'border-violet-500/60 bg-violet-500/10'
                        : 'border-[#1f2742] bg-[#121728]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 font-bold text-violet-300 border border-violet-500/30">
                        {prof.player.name.trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#edf0fb] truncate">
                            {prof.player.name}
                          </span>
                          {isDefault && (
                            <span className="text-xs text-cyan-400 font-medium whitespace-nowrap">
                              · افتراضي
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8e97b8] tabular-nums">
                          {rank.name} · المستوى {prof.player.level} · {prof.player.totalXp} XP
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => onSwitchProfile(prof.player.id)}
                          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
                        >
                          تبديل للحساب
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          نشط الآن
                        </span>
                      )}

                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => onSetDefaultProfile(prof.player.id)}
                          className="rounded-lg border border-[#242d4d] px-3 py-2 text-xs font-medium text-[#c7cee8] transition-colors hover:border-cyan-400/50 hover:text-cyan-300 whitespace-nowrap"
                        >
                          تعيين كافتراضي
                        </button>
                      )}

                      {profileList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProfile(prof.player.id)}
                          aria-label={`حذف حساب ${prof.player.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#242d4d] text-[#8e97b8] transition-colors hover:border-rose-500/50 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-[#1f2742] pt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#edf0fb] flex items-center gap-2">
              <User className="h-4 w-4 text-violet-400" />
              إنشاء حساب جديد
            </h3>
            {isFirstSetup && (
              <button
                type="button"
                onClick={onQuickDefaultProfile}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20 whitespace-nowrap"
              >
                دخول سريع بحساب افتراضي
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor="new-player-name"
              className="block text-xs font-medium text-[#c7cee8] mb-1.5"
            >
              اسم اللاعب
            </label>
            <input
              id="new-player-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="اكتب اسمك (مثال: أحمد، كريم، سارة...)"
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 text-sm text-[#edf0fb] placeholder:text-[#5c6482] focus:border-violet-500 focus:outline-none"
            />
            {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
          </div>

          <div>
            <span className="block text-xs font-medium text-[#c7cee8] mb-2">
              مستوى اللياقة البدنية المبدئي
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FITNESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFitnessLevel(opt.value)}
                  className={`rounded-xl border p-3 text-right transition-colors ${
                    fitnessLevel === opt.value
                      ? 'border-violet-500 bg-violet-500/15 text-white'
                      : 'border-[#1f2742] bg-[#121728] text-[#9aa3c2] hover:border-[#2e385c]'
                  }`}
                >
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="mt-1 text-[11px] text-[#8e97b8] leading-relaxed">
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#1f2742] bg-[#121728] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#edf0fb]">توفر الدامبلز</div>
                  <div className="text-xs text-[#8e97b8]">دمج تمارين الدامبلز في الجدول</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hasDumbbells}
                aria-label="تفعيل تمارين الدامبلز"
                onClick={() => setHasDumbbells((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  hasDumbbells ? 'bg-violet-600' : 'bg-[#252d4a]'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    hasDumbbells ? 'left-1' : 'right-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label
                htmlFor="new-player-db-kg"
                className="block text-xs font-medium text-[#c7cee8] mb-1.5"
              >
                وزن الدامبل الأساسي (كجم لكل يد)
              </label>
              <div className="flex items-center gap-2">
                {[2.5, 5, 7.5, 10, 12.5, 15].map((w) => (
                  <button
                    key={w}
                    type="button"
                    disabled={!hasDumbbells}
                    onClick={() => setDumbbellWeightKg(w)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums border transition-colors ${
                      dumbbellWeightKg === w && hasDumbbells
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                        : 'border-[#242d4d] bg-[#070911] text-[#9aa3c2] disabled:opacity-40'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#c7cee8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-[#242d4d] bg-[#070911] accent-violet-600"
            />
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>تعيين هذا الحساب كالحساب الافتراضي عند فتح التطبيق</span>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>حفظ والبدء بهذا الحساب</span>
            </button>
            {isFirstSetup && (
              <button
                type="button"
                onClick={onQuickDefaultProfile}
                className="rounded-xl border border-[#242d4d] px-4 py-2.5 text-sm font-medium text-[#c7cee8] transition-colors hover:border-[#3c4875] hover:text-white whitespace-nowrap"
              >
                استخدام الحساب الافتراضي مباشرة
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
