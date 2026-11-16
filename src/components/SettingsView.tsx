import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Download,
  RotateCcw,
  Save,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
} from 'lucide-react';
import type { FitnessLevel, MultiProfileStore, ProfileState, XpKey } from '../types/system';

interface SettingsViewProps {
  store: MultiProfileStore;
  profile: ProfileState;
  onUpdatePlayerInfo: (payload: {
    name: string;
    fitnessLevel: FitnessLevel;
    hasDumbbells: boolean;
    dumbbellWeightKg: number;
  }) => void;
  onSetDefaultProfile: (profileId: string) => void;
  onOpenProfiles: () => void;
  onToggleSetting: (key: 'showIntro' | 'sound' | 'reduceMotion') => void;
  onUpdateXpValue: (key: XpKey, value: number) => void;
  onUpdateWeeklyGoal: (goal: number) => void;
  onExportData: () => void;
  onImportData: (jsonText: string) => void;
  onResetProfile: () => void;
}

const XP_FIELDS: { key: XpKey; label: string }[] = [
  { key: 'mainQuest', label: 'مهمة يومية أساسية' },
  { key: 'workout', label: 'إتمام جلسة التمرين' },
  { key: 'prayer', label: 'كل فرض صلاة' },
  { key: 'sideQuest', label: 'مهمة جانبية' },
  { key: 'sideBonus', label: 'مكافأة إكمال مهمتين جانبيتين' },
  { key: 'allDaily', label: 'مكافأة إكمال كل المهام الأساسية' },
  { key: 'weekly', label: 'مكافأة الهدف الأسبوعي' },
];

export function SettingsView({
  store,
  profile,
  onUpdatePlayerInfo,
  onSetDefaultProfile,
  onOpenProfiles,
  onToggleSetting,
  onUpdateXpValue,
  onUpdateWeeklyGoal,
  onExportData,
  onImportData,
  onResetProfile,
}: SettingsViewProps) {
  const [name, setName] = useState(profile.player.name);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(
    profile.player.fitnessLevel
  );
  const [hasDumbbells, setHasDumbbells] = useState(profile.player.hasDumbbells);
  const [dumbbellWeightKg, setDumbbellWeightKg] = useState(
    profile.player.dumbbellWeightKg
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isDefault = store.defaultProfileId === profile.player.id;

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdatePlayerInfo({
      name: name.trim() || profile.player.name,
      fitnessLevel,
      hasDumbbells,
      dumbbellWeightKg,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        onImportData(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Account & Profile Settings */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2742] pb-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-bold text-[#edf0fb]">حساب اللاعب والملف الافتراضي</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isDefault ? (
              <button
                type="button"
                onClick={() => onSetDefaultProfile(profile.player.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 whitespace-nowrap"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>تعيين هذا الحساب كافتراضي</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>الحساب الافتراضي الحالي</span>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenProfiles}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#242d4d] bg-[#121728] px-3 py-1.5 text-xs font-semibold text-[#c7cee8] hover:border-violet-500 hover:text-white whitespace-nowrap"
            >
              <Users className="h-3.5 w-3.5" />
              <span>إنشاء أو تبديل حساب ({Object.keys(store.profiles).length})</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="settings-player-name"
              className="block text-xs font-medium text-[#c7cee8] mb-1.5"
            >
              اسم اللاعب
            </label>
            <input
              id="settings-player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 text-sm text-[#edf0fb] focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="settings-fitness-level"
              className="block text-xs font-medium text-[#c7cee8] mb-1.5"
            >
              مستوى اللياقة الأساسي
            </label>
            <select
              id="settings-fitness-level"
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 text-sm text-[#edf0fb] focus:border-violet-500 focus:outline-none"
            >
              <option value="beginner">مبتدئ (Beginner)</option>
              <option value="intermediate">متوسط (Intermediate)</option>
              <option value="advanced">متقدم (Advanced)</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#1f2742] bg-[#121728] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[#edf0fb]">استخدام الدامبلز</div>
              <div className="text-xs text-[#8e97b8]">تفعيل تمارين الأوزان المنزلية</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hasDumbbells}
              aria-label="تبديل استخدام الدامبلز في الإعدادات"
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
              htmlFor="settings-db-kg"
              className="block text-xs font-medium text-[#c7cee8] mb-1.5"
            >
              وزن الدامبل الافتراضي (كجم لكل يد)
            </label>
            <input
              id="settings-db-kg"
              type="number"
              min={1}
              max={60}
              step={0.5}
              value={dumbbellWeightKg}
              onChange={(e) => setDumbbellWeightKg(Math.max(1, Number(e.target.value) || 5))}
              className="w-full rounded-xl border border-[#242d4d] bg-[#070911] px-4 py-2.5 font-mono text-sm text-[#edf0fb] tabular-nums focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500"
            >
              <Save className="h-4 w-4" />
              <span>حفظ تعديلات الحساب</span>
            </button>
          </div>
        </form>
      </section>

      {/* General Settings */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5 divide-y divide-[#1a2138]">
        <h3 className="text-sm font-bold text-[#edf0fb] pb-3">الإعدادات العامة</h3>

        {(
          [
            {
              key: 'showIntro',
              title: 'عرض شاشة البداية عند الفتح',
              desc: 'تُعطّل تلقائيًا بعد أول مرة ويمكنك تفعيلها من هنا',
            },
            {
              key: 'sound',
              title: 'المؤثرات الصوتية',
              desc: 'تنبيهات صوتية خفيفة عند الإنجاز أو انتهاء مؤقت الراحة',
            },
            {
              key: 'reduceMotion',
              title: 'تقليل الحركة والأنيميشن',
              desc: 'تخفيف الانتقالات البصرية لراحة العين',
            },
          ] as const
        ).map((item) => {
          const on = profile.settings[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <div className="text-sm font-semibold text-[#edf0fb]">{item.title}</div>
                <div className="text-xs text-[#8e97b8]">{item.desc}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={item.title}
                onClick={() => onToggleSetting(item.key)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  on ? 'bg-violet-600' : 'bg-[#252d4a]'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    on ? 'left-1' : 'right-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </section>

      {/* XP Values & Weekly Goal */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <h3 className="text-sm font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
          قيم XP والهدف الأسبوعي
        </h3>
        <div className="mt-3 divide-y divide-[#1a2138]">
          {XP_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4 py-3">
              <label htmlFor={`xp-${f.key}`} className="text-sm text-[#c7cee8]">
                {f.label}
              </label>
              <input
                id={`xp-${f.key}`}
                type="number"
                min={0}
                value={profile.settings.xpValues[f.key]}
                onChange={(e) =>
                  onUpdateXpValue(f.key, Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-24 rounded-lg border border-[#242d4d] bg-[#070911] px-3 py-1.5 text-center font-mono text-sm text-[#edf0fb] tabular-nums focus:border-violet-500 focus:outline-none"
              />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-3">
            <label htmlFor="weekly-goal-input" className="text-sm text-[#c7cee8]">
              عدد المهام المطلوب لصندوق الأسبوع
            </label>
            <input
              id="weekly-goal-input"
              type="number"
              min={5}
              max={100}
              value={profile.settings.weeklyGoal}
              onChange={(e) =>
                onUpdateWeeklyGoal(Math.max(5, parseInt(e.target.value, 10) || 20))
              }
              className="w-24 rounded-lg border border-[#242d4d] bg-[#070911] px-3 py-1.5 text-center font-mono text-sm text-[#edf0fb] tabular-nums focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Backup & Reset */}
      <section className="rounded-2xl border border-[#1f2742] bg-[#0d111e] p-5">
        <h3 className="text-sm font-bold text-[#edf0fb] border-b border-[#1f2742] pb-3">
          النسخ الاحتياطي والبيانات
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportData}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-500"
          >
            <Download className="h-4 w-4" />
            <span>تصدير نسخة JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#242d4d] bg-[#121728] px-4 py-2.5 text-xs font-semibold text-[#c7cee8] hover:border-cyan-400 hover:text-white"
          >
            <Upload className="h-4 w-4" />
            <span>استيراد نسخة</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              <span>إعادة ضبط بيانات الحساب</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetProfile();
                  setConfirmReset(false);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                تأكيد المسح النهائي
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-xl border border-[#242d4d] px-3 py-2 text-xs text-[#9aa3c2]"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
