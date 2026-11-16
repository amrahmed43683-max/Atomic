import type {
  DailyWorkoutPlan,
  FitnessLevel,
  WorkoutExercise,
  WorkoutTier,
} from '../types/system';

export const DAY_NAMES_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

export const DEFAULT_WORKOUT_DAYS: number[] = [0, 1, 3, 4, 6];

export const WORKOUT_TIERS: Record<
  WorkoutTier,
  {
    tier: WorkoutTier;
    label: string;
    labelEn: string;
    description: string;
    restSec: number;
    estimatedMinutes: number;
  }
> = {
  1: {
    tier: 1,
    label: 'المستوى 1 · تأسيسي',
    labelEn: 'TIER I · FOUNDATION',
    description: 'حجم تدريبي خفيف لبناء التقنية الصحيحة وحماية المفاصل.',
    restSec: 60,
    estimatedMinutes: 18,
  },
  2: {
    tier: 2,
    label: 'المستوى 2 · البناء',
    labelEn: 'TIER II · BUILDER',
    description: 'زيادة المجموعات وإدخال أوزان الدامبلز الأساسية بتحكم ثابت.',
    restSec: 55,
    estimatedMinutes: 25,
  },
  3: {
    tier: 3,
    label: 'المستوى 3 · متوسط',
    labelEn: 'TIER III · INTERMEDIATE',
    description: 'تمارين مركبة بالدامبلز وإيقاع نزول بطيء لتحفيز القوة والكتلة.',
    restSec: 50,
    estimatedMinutes: 32,
  },
  4: {
    tier: 4,
    label: 'المستوى 4 · متقدم',
    labelEn: 'TIER IV · ADVANCED',
    description: 'حركات أحادية الجانب، سوبر-ست، وتحديات أعلى بالدامبلز ووزن الجسم.',
    restSec: 45,
    estimatedMinutes: 38,
  },
  5: {
    tier: 5,
    label: 'المستوى 5 · النخبة',
    labelEn: 'TIER V · MASTER',
    description: 'كثافة عالية، تمارين انفجارية ومركبات دامبلز متكاملة لأقصى أداء.',
    restSec: 40,
    estimatedMinutes: 45,
  },
};

export function recommendWorkoutTier(
  fitnessLevel: FitnessLevel,
  totalWorkouts: number,
  playerLevel: number
): WorkoutTier {
  const baseTier =
    fitnessLevel === 'advanced' ? 3 : fitnessLevel === 'intermediate' ? 2 : 1;
  const progressBonus =
    totalWorkouts >= 36 || playerLevel >= 25
      ? 2
      : totalWorkouts >= 14 || playerLevel >= 10
        ? 1
        : 0;
  const raw = Math.min(5, Math.max(1, baseTier + progressBonus));
  return raw as WorkoutTier;
}

export function resolveEffectiveWeightKg(
  baseWeightKg: number,
  factor: number,
  tier: WorkoutTier
): number {
  if (baseWeightKg <= 0) return 0;
  const tierScale = 1 + (tier - 1) * 0.1;
  const raw = baseWeightKg * factor * tierScale;
  return Math.max(1, Math.round(raw * 2) / 2);
}

interface RawSlot {
  id: string;
  muscleGroup: string;
  usesDumbbells: boolean;
  suggestedWeightFactor: number;
  byTier: Record<
    WorkoutTier,
    {
      name: string;
      nameEn: string;
      bwName?: string;
      bwNameEn?: string;
      sets: number;
      repsOrDuration: string;
      tempoNote: string;
      formCue: string;
    }
  >;
}

const PUSH_EXERCISES: RawSlot[] = [
  {
    id: 'push-1',
    muscleGroup: 'الصدر',
    usesDumbbells: false,
    suggestedWeightFactor: 0,
    byTier: {
      1: {
        name: 'ضغط مائل على الحائط أو الطاولة',
        nameEn: 'Incline Push-ups',
        sets: 2,
        repsOrDuration: '8–10 تكرار',
        tempoNote: 'نزول 2 ثانية',
        formCue: 'حافظ على استقامة الظهر وشد البطن طوال الحركة.',
      },
      2: {
        name: 'ضغط على الركبتين أو مائل منخفض',
        nameEn: 'Modified / Low Incline Push-ups',
        sets: 3,
        repsOrDuration: '10–12 تكرار',
        tempoNote: 'نزول 2 ثانية',
        formCue: 'المرفق بزاوية 45 درجة للخارج وليس مفتوحًا بالكامل.',
      },
      3: {
        name: 'ضغط كلاسيكي كامل',
        nameEn: 'Standard Push-ups',
        sets: 3,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '2-1-1',
        formCue: 'انزل حتى يقترب الصدر من الأرض مع ثبات الحوض.',
      },
      4: {
        name: 'ضغط مائل للأسفل (القدمين مرتفعة)',
        nameEn: 'Decline Push-ups',
        sets: 4,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'تركيز أعلى على الصدر العلوي والأكتاف الأمامية.',
      },
      5: {
        name: 'ضغط أرشر أو انفجاري متبادل',
        nameEn: 'Archer / Explosive Push-ups',
        sets: 4,
        repsOrDuration: '10–12 تكرار',
        tempoNote: 'نزول بطيء + دفع قوي',
        formCue: 'انقل الوزن بالتناوب لكل ذراع مع تحكم كامل.',
      },
    },
  },
  {
    id: 'push-2',
    muscleGroup: 'الصدر الأوسط',
    usesDumbbells: true,
    suggestedWeightFactor: 1.0,
    byTier: {
      1: {
        name: 'ضغط صدر أرضي بالدامبلز',
        nameEn: 'Dumbbell Floor Press',
        bwName: 'ضغط واسع على الأرض',
        bwNameEn: 'Wide Push-ups',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: 'ثبات ثانية بالأسفل',
        formCue: 'المس الأرض برفق بالعضد دون ارتداد وادفع للأعلى.',
      },
      2: {
        name: 'ضغط صدر أرضي بالدامبلز',
        nameEn: 'Dumbbell Floor Press',
        bwName: 'ضغط واسع بتحكم بطيء',
        bwNameEn: 'Tempo Wide Push-ups',
        sets: 3,
        repsOrDuration: '10–12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'اجمع لوحي الكتف للخلف لحماية الكتف.',
      },
      3: {
        name: 'ضغط صدر بالدامبلز بإيقاع بطيء',
        nameEn: 'Tempo Dumbbell Floor Press',
        bwName: 'ضغط صدر مع ثبات بالأسفل',
        bwNameEn: 'Pause Push-ups',
        sets: 4,
        repsOrDuration: '12 تكرار',
        tempoNote: '3-1-1',
        formCue: 'نزول في 3 ثوانٍ لزيادة الشد العضلي.',
      },
      4: {
        name: 'ضغط صدر بالدامبلز مع تفتيح (Press + Fly)',
        nameEn: 'DB Squeeze Press + Floor Fly',
        bwName: 'ضغط بذراع مائلة + ضغط ماسي',
        bwNameEn: 'Staggered Push-ups',
        sets: 4,
        repsOrDuration: '12–14 تكرار',
        tempoNote: '3-1-1',
        formCue: 'اضغط الدامبلين معًا في الأعلى لتنشيط ألياف الصدر.',
      },
      5: {
        name: 'ضغط دامبل بذراع واحدة مع ثبات الجذع',
        nameEn: 'Single-Arm DB Floor Press',
        bwName: 'ضغط بذراع شبه منفردة',
        bwNameEn: 'Assisted One-Arm Push-up',
        sets: 4,
        repsOrDuration: '12 لكل ذراع',
        tempoNote: '3-1-X',
        formCue: 'قاوم دوران الجذع بشد عضلات البطن والأرداف.',
      },
    },
  },
  {
    id: 'push-3',
    muscleGroup: 'الأكتاف',
    usesDumbbells: true,
    suggestedWeightFactor: 0.75,
    byTier: {
      1: {
        name: 'ضغط أكتاف جلوس بالدامبلز',
        nameEn: 'Seated DB Shoulder Press',
        bwName: 'بايك بوش أب خفيف (Pike)',
        bwNameEn: 'Incline Pike Hold',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: 'تحكم كامل',
        formCue: 'لا تقوّس أسفل الظهر أثناء رفع الدامبلز للأعلى.',
      },
      2: {
        name: 'ضغط أكتاف وقوف بالدامبلز',
        nameEn: 'Standing DB Overhead Press',
        bwName: 'بايك بوش أب',
        bwNameEn: 'Pike Push-ups',
        sets: 3,
        repsOrDuration: '10–12 تكرار',
        tempoNote: '2-0-1',
        formCue: 'شد البطن والأرداف لثبات العمود الفقري.',
      },
      3: {
        name: 'ضغط أرنولد بالدامبلز',
        nameEn: 'Dumbbell Arnold Press',
        bwName: 'بايك بوش أب عميق',
        bwNameEn: 'Deep Pike Push-ups',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'دوّر المعصم بسلاسة من أمام الصدر حتى الدفع للأعلى.',
      },
      4: {
        name: 'رفرفة جانبي + ضغط أكتاف بالدامبلز',
        nameEn: 'DB Lateral Raise + Press Combo',
        bwName: 'بايك بوش أب مع قدمين مرتفعتين',
        bwNameEn: 'Elevated Pike Push-ups',
        sets: 4,
        repsOrDuration: '10+10 تكرار',
        tempoNote: '2-1-1',
        formCue: 'ارفع حتى مستوى الكتف فقط وتجنب رفع الترقوة.',
      },
      5: {
        name: 'دروب-ست رفرفة جانبي بالدامبلز + بوش برس',
        nameEn: 'DB Push Press + Lateral Burnout',
        bwName: 'ضغط الوقوف على اليدين بالحائط',
        bwNameEn: 'Wall Handstand Push-up Negatives',
        sets: 4,
        repsOrDuration: '12 + 15 تكرار',
        tempoNote: 'نزول بطيء',
        formCue: 'تحكم بالهبوط لـ 3 ثوانٍ في الرفرفة الجانبية.',
      },
    },
  },
  {
    id: 'push-4',
    muscleGroup: 'الترايسبس',
    usesDumbbells: true,
    suggestedWeightFactor: 0.75,
    byTier: {
      1: {
        name: 'تمديد ترايسبس فوق الرأس بدمبل واحد',
        nameEn: 'DB Overhead Triceps Extension',
        bwName: 'ديبس على كرسي (ثني ركبتين)',
        bwNameEn: 'Chair Triceps Dips',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: '2-1-1',
        formCue: 'ثبت المرفقين قريبين من الرأس ولا تفتحهما للخارج.',
      },
      2: {
        name: 'تمديد ترايسبس بالدامبل فوق الرأس',
        nameEn: 'DB Overhead Triceps Extension',
        bwName: 'ديبس على كرسي بأرجل مستقيمة',
        bwNameEn: 'Straight-Leg Chair Dips',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'انزل بالدمبل خلف الرأس لمد كامل ثم افرد الذراع.',
      },
      3: {
        name: 'تمديد ترايسبس أرضي (Skull Crushers)',
        nameEn: 'DB Floor Skull Crushers',
        bwName: 'ضغط ضيق للترايسبس',
        bwNameEn: 'Close-Grip Push-ups',
        sets: 3,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'اثنِ المرفق فقط دون تحريك العضد.',
      },
      4: {
        name: 'تمديد ترايسبس بذراع واحدة + ضغط ماسي',
        nameEn: 'Single-Arm DB Extension + Diamond Push-ups',
        bwName: 'ضغط ماسي (Diamond Push-ups)',
        bwNameEn: 'Diamond Push-ups',
        sets: 3,
        repsOrDuration: '12 + 10 تكرار',
        tempoNote: '3-1-1',
        formCue: 'سوبر-ست: أكمل التمرينين متتاليين قبل الراحة.',
      },
      5: {
        name: 'سوبر-ست Skull Crushers بالدامبلز + ضغط ماسي للفشل',
        nameEn: 'Heavy DB Crushers + Diamond Failure',
        bwName: 'ضغط ماسي بطيء + ديبس',
        bwNameEn: 'Tempo Diamond + Dips',
        sets: 4,
        repsOrDuration: '15 + أقصى تكرار',
        tempoNote: '3-1-X',
        formCue: 'أقصى انقباض للترايسبس في نهاية كل تكرار.',
      },
    },
  },
];

const LOWER_EXERCISES: RawSlot[] = [
  {
    id: 'lower-1',
    muscleGroup: 'الأمامية والأرداف',
    usesDumbbells: true,
    suggestedWeightFactor: 1.0,
    byTier: {
      1: {
        name: 'سكوات جوبلت خفيف بالدامبل (أو كرسي)',
        nameEn: 'Light DB Goblet Squat',
        bwName: 'سكوات وزن الجسم (أو على كرسي)',
        bwNameEn: 'Bodyweight Squat',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: '2-1-1',
        formCue: 'ادفع الركبتين للخارج قليلًا وحافظ على كعبيك على الأرض.',
      },
      2: {
        name: 'سكوات جوبلت بالدامبل أمام الصدر',
        nameEn: 'Dumbbell Goblet Squat',
        bwName: 'سكوات عميق مع ثبات',
        bwNameEn: 'Pause Bodyweight Squat',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'الصدر مرفوع والنزول حتى توازِي الفخذين مع الأرض.',
      },
      3: {
        name: 'سكوات جوبلت عميق بإيقاع بطيء',
        nameEn: 'Tempo DB Goblet Squat',
        bwName: 'سكوات بطيء 3 ثوانٍ نزول',
        bwNameEn: '3-Sec Tempo Squat',
        sets: 4,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'ثانية ثبات في الأسفل قبل الصعود بقوة.',
      },
      4: {
        name: 'سكوات بالدامبلين على الكتفين (Front Squat)',
        nameEn: 'Double DB Front Squat',
        bwName: 'سكوات أحادي مدعوم (Pistol Prep)',
        bwNameEn: 'Assisted Pistol Squat',
        sets: 4,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'حافظ على استقامة الجذع وعدم ميل الركبتين للداخل.',
      },
      5: {
        name: 'سوبر-ست DB Front Squat + سكوات قفز',
        nameEn: 'DB Front Squat + Jump Squats',
        bwName: 'سكوات أحادي الساق + قفز',
        bwNameEn: 'Pistol Squat + Jump Squats',
        sets: 4,
        repsOrDuration: '12 + 12 تكرار',
        tempoNote: '3-0-X',
        formCue: 'هبوط ناعم على أطراف القدم في القفز لحماية الركبة.',
      },
    },
  },
  {
    id: 'lower-2',
    muscleGroup: 'العضلة الخلفية',
    usesDumbbells: true,
    suggestedWeightFactor: 1.0,
    byTier: {
      1: {
        name: 'ديدليفت روماني خفيف بالدامبلز (RDL)',
        nameEn: 'Light DB Romanian Deadlift',
        bwName: 'جسر أرداف على الأرض (Glute Bridge)',
        bwNameEn: 'Glute Bridge',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: '2-1-1',
        formCue: 'ادفع الحوض للخلف مع ثبات استقامة الظهر تمامًا.',
      },
      2: {
        name: 'ديدليفت روماني بالدامبلز',
        nameEn: 'Dumbbell Romanian Deadlift',
        bwName: 'جسر أرداف بساق واحدة',
        bwNameEn: 'Single-Leg Glute Bridge',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '3-1-1',
        formCue: 'أبقِ الدامبلز ملاصقين للساقين وانزل حتى منتصف الساق.',
      },
      3: {
        name: 'ديدليفت روماني بالدامبلز + ثبات',
        nameEn: 'Pause DB RDL',
        bwName: 'همسترينغ سلايد أو جسر مرتفع',
        bwNameEn: 'Elevated Single-Leg Bridge',
        sets: 4,
        repsOrDuration: '12–14 تكرار',
        tempoNote: '3-2-1',
        formCue: 'اشعر بالشد في العضلة الخلفية للفخذ وليس أسفل الظهر.',
      },
      4: {
        name: 'ديدليفت روماني بساق واحدة بالدامبل',
        nameEn: 'Single-Leg DB RDL',
        bwName: 'ديدليفت بساق واحدة وزن الجسم',
        bwNameEn: 'Single-Leg Bodyweight Hinge',
        sets: 3,
        repsOrDuration: '10–12 لكل ساق',
        tempoNote: '3-1-1',
        formCue: 'حافظ على توازن الحوض موازيًا للأرض.',
      },
      5: {
        name: 'ديدليفت روماني بساق واحدة ثقيل + جسر أرداف بالدامبل',
        nameEn: 'Heavy Single-Leg DB RDL + Weighted Bridge',
        bwName: 'نورديك هامسترينغ إكسنتريك',
        bwNameEn: 'Hamstring Walkouts',
        sets: 4,
        repsOrDuration: '12 لكل ساق',
        tempoNote: '3-1-1',
        formCue: 'تحكم كامل بالاتزان دون دوران الجذع.',
      },
    },
  },
  {
    id: 'lower-3',
    muscleGroup: 'التوازن والقوة الأحادية',
    usesDumbbells: true,
    suggestedWeightFactor: 0.75,
    byTier: {
      1: {
        name: 'لانجز ثابت بدون وزن أو بدمبل خفيف',
        nameEn: 'Static Split Squat',
        bwName: 'لانجز ثابت مدعوم',
        bwNameEn: 'Supported Split Squat',
        sets: 2,
        repsOrDuration: '8 لكل ساق',
        tempoNote: '2-0-1',
        formCue: 'ركبة الساق الأمامية فوق الكاحل تمامًا.',
      },
      2: {
        name: 'لانجز للخلف بالدامبلز',
        nameEn: 'DB Reverse Lunges',
        bwName: 'لانجز للخلف متناوب',
        bwNameEn: 'Reverse Lunges',
        sets: 3,
        repsOrDuration: '10 لكل ساق',
        tempoNote: '2-1-1',
        formCue: 'الرجوع للخلف يقلل الضغط على مفصل الركبة.',
      },
      3: {
        name: 'سبليت سكوات بالدامبلز (Bulgarian Prep)',
        nameEn: 'DB Split Squats',
        bwName: 'سبليت سكوات عميق',
        bwNameEn: 'Deep Split Squats',
        sets: 3,
        repsOrDuration: '12 لكل ساق',
        tempoNote: '3-1-1',
        formCue: 'انزل عموديًا للأسفل وادفع بكعب القدم الأمامية.',
      },
      4: {
        name: 'بلغاريان سبليت سكوات بالدامبلز',
        nameEn: 'DB Bulgarian Split Squat',
        bwName: 'بلغاريان سبليت سكوات',
        bwNameEn: 'Bulgarian Split Squat',
        sets: 3,
        repsOrDuration: '12 لكل ساق',
        tempoNote: '3-1-1',
        formCue: 'ضع مشط القدم الخلفية على كرسي وانزل بتحكم.',
      },
      5: {
        name: 'بلغاريان سبليت سكوات + قفز متناوب',
        nameEn: 'Heavy DB Bulgarian + Jump Lunges',
        bwName: 'لانجز قفز + بلغاريان',
        bwNameEn: 'Bulgarian + Jump Lunges',
        sets: 4,
        repsOrDuration: '12 + 12 لكل ساق',
        tempoNote: '3-0-X',
        formCue: 'إيقاع ثابت بدون انحناء الصدر للأمام.',
      },
    },
  },
  {
    id: 'lower-4',
    muscleGroup: 'البطن والكور',
    usesDumbbells: false,
    suggestedWeightFactor: 0,
    byTier: {
      1: {
        name: 'بلانك على الساعدين',
        nameEn: 'Forearm Plank',
        sets: 2,
        repsOrDuration: '20 ثانية',
        tempoNote: 'تنفس منتظم',
        formCue: 'لا ترفع الحوض للأعلى ولا تتركه يهبط.',
      },
      2: {
        name: 'بلانك + رفع الساق بالتناوب',
        nameEn: 'Plank + Alternating Leg Lift',
        sets: 3,
        repsOrDuration: '35 ثانية',
        tempoNote: 'ثبات كامل',
        formCue: 'شد عضلات البطن والأرداف طوال الثواني.',
      },
      3: {
        name: 'بلانك مع لمس الكتف (Shoulder Taps)',
        nameEn: 'Plank Shoulder Taps',
        sets: 3,
        repsOrDuration: '45 ثانية',
        tempoNote: 'حركة بطيئة',
        formCue: 'امنع تمايل الحوض يمينًا ويسارًا.',
      },
      4: {
        name: 'ثبات الجسم المجوف (Hollow Hold)',
        nameEn: 'Hollow Body Hold',
        sets: 4,
        repsOrDuration: '45 ثانية',
        tempoNote: 'أسفل الظهر ملتصق',
        formCue: 'اضغط أسفل الظهر على الأرض بالكامل.',
      },
      5: {
        name: 'بلانك ممدود + Hollow Rocks',
        nameEn: 'Long-Lever Plank + Hollow Rocks',
        sets: 4,
        repsOrDuration: '60 ثانية',
        tempoNote: 'تحكم مستمر',
        formCue: 'قدّم المرفقين للأمام بضع سنتيمترات لزيادة الصعوبة.',
      },
    },
  },
];

const PULL_EXERCISES: RawSlot[] = [
  {
    id: 'pull-1',
    muscleGroup: 'الظهر العريض',
    usesDumbbells: true,
    suggestedWeightFactor: 1.0,
    byTier: {
      1: {
        name: 'تجديف ظهر منحني بالدامبلز',
        nameEn: 'Bent-Over DB Rows',
        bwName: 'تجديف أرضي أو سوبرمان سحب',
        bwNameEn: 'Prone Floor Pulls',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: 'ثبات ثانية بالأعلى',
        formCue: 'اسحب المرفقين نحو الخصر مع ضم لوحي الكتف.',
      },
      2: {
        name: 'تجديف ظهر منحني بالدامبلز',
        nameEn: 'Bent-Over DB Rows',
        bwName: 'سوبرمان مع سحب المرفقين (W-Pull)',
        bwNameEn: 'Superman W-Pulls',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'ظهر مستقيم بزاوية 45 درجة دون تقوس.',
      },
      3: {
        name: 'تجديف بذراع واحدة مع ارتكاز بالدامبل',
        nameEn: 'Single-Arm Supported DB Row',
        bwName: 'سوبرمان W-Pull مع ثبات 3 ثوانٍ',
        bwNameEn: 'Pause Superman W-Pulls',
        sets: 4,
        repsOrDuration: '12 لكل ذراع',
        tempoNote: '2-2-1',
        formCue: 'اسحب الدامبل باتجاه الجيب وليس للكتف.',
      },
      4: {
        name: 'تجديف مائل مع توقف 2 ثانية بالأعلى',
        nameEn: '2-Sec Pause Bent-Over DB Row',
        bwName: 'سحب بالمنشفة إيزومتريك + سوبرمان',
        bwNameEn: 'Isometric Towel Row + Back Ext',
        sets: 4,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-2-1',
        formCue: 'عصر كامل لعضلات الظهر في قمة كل عدة.',
      },
      5: {
        name: 'تجديف غوريلا بالدامبلز (Gorilla Rows)',
        nameEn: 'Dumbbell Gorilla Rows',
        bwName: 'سحب ديناميكي عالي الكثافة',
        bwNameEn: 'Explosive Prone Rows',
        sets: 4,
        repsOrDuration: '14 لكل ذراع',
        tempoNote: '2-1-X',
        formCue: 'ثبات حديدي في الجذع أثناء التبديل بين الذراعين.',
      },
    },
  },
  {
    id: 'pull-2',
    muscleGroup: 'الكتف الخلفي وأعلى الظهر',
    usesDumbbells: true,
    suggestedWeightFactor: 0.6,
    byTier: {
      1: {
        name: 'رفرفة خلفي خفيفة بالدامبلز',
        nameEn: 'Bent-Over DB Rear Delt Fly',
        bwName: 'ملائكة الظهر على الأرض (Reverse Snow Angels)',
        bwNameEn: 'Reverse Snow Angels',
        sets: 2,
        repsOrDuration: '10 تكرار',
        tempoNote: '2-1-1',
        formCue: 'تحكم في الهبوط ولا تستخدم قوة الدفع من الظهر.',
      },
      2: {
        name: 'رفرفة خلفي بالدامبلز',
        nameEn: 'DB Rear Delt Flyes',
        bwName: 'Reverse Snow Angels بطيئة',
        bwNameEn: 'Slow Reverse Snow Angels',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'افتح الذراعين للخارج بزاوية مائلة مع شد أعلى الظهر.',
      },
      3: {
        name: 'رفرفة خلفي + هز الأكتاف بالدامبلز (Shrugs)',
        nameEn: 'DB Rear Delt Fly + Shrugs',
        bwName: 'Y-T-W لتحفيز أعلى الظهر',
        bwNameEn: 'Prone Y-T-W Raises',
        sets: 3,
        repsOrDuration: '12 + 12 تكرار',
        tempoNote: '2-2-1',
        formCue: 'اثبت ثانيتين في قمة كل رفعة.',
      },
      4: {
        name: 'رفرفة خلفي أحادية الذراع + Face Pull بالدامبل',
        nameEn: 'DB High Pull + Rear Fly',
        bwName: 'Prone Y-T-W مع ثبات',
        bwNameEn: 'Pause Y-T-W Raises',
        sets: 4,
        repsOrDuration: '15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'تحسن استقامة الكتفين وتقوي الظهر العلوي.',
      },
      5: {
        name: 'دروب-ست رفرفة خلفي بالدامبلز + شراجز',
        nameEn: 'DB Rear Delt Mechanical Drop-Set',
        bwName: 'Y-T-W عالية التكرار',
        bwNameEn: 'High-Rep Y-T-W',
        sets: 4,
        repsOrDuration: '15 + 15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'عند التعب، انتقل مباشرة لتجديف عالي بدون راحة.',
      },
    },
  },
  {
    id: 'pull-3',
    muscleGroup: 'البايسبس',
    usesDumbbells: true,
    suggestedWeightFactor: 0.75,
    byTier: {
      1: {
        name: 'كيرل بايسبس بالتناوب بالدامبلز',
        nameEn: 'Alternating DB Bicep Curls',
        bwName: 'شد بايسبس إيزومتريك باليد الأخرى',
        bwNameEn: 'Self-Resisted Bicep Curl',
        sets: 2,
        repsOrDuration: '10 لكل ذراع',
        tempoNote: '2-1-1',
        formCue: 'ثبت المرفق بجانب الجسم ولا تتأرجح.',
      },
      2: {
        name: 'كيرل هامر بالدامبلز (Hammer Curls)',
        nameEn: 'Dumbbell Hammer Curls',
        bwName: 'شد بايسبس بالمنشفة مع مقاومة الساق',
        bwNameEn: 'Towel Resistance Curl',
        sets: 3,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-1-1',
        formCue: 'قبضة محايدة تقوي البايسبس والساعد معًا.',
      },
      3: {
        name: 'كيرل بايسبس عادي + هامر بالتناوب',
        nameEn: 'Supinated + Hammer DB Curls',
        bwName: 'مقاومة منشفة بطيئة الهبوط',
        bwNameEn: 'Eccentric Towel Curls',
        sets: 3,
        repsOrDuration: '12–15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'هبوط بطيء لـ 3 ثوانٍ لتعظيم الشد.',
      },
      4: {
        name: 'كيرل زوتمان بالدامبلز (Zottman Curls)',
        nameEn: 'Dumbbell Zottman Curls',
        bwName: 'ثبات إيزومتريك 90 درجة بالمنشفة',
        bwNameEn: '90° Towel Hold + Curls',
        sets: 4,
        repsOrDuration: '12 تكرار',
        tempoNote: '3-1-1',
        formCue: 'اصعد بقبضة علوية وانزل بقبضة مقلوبة للساعد.',
      },
      5: {
        name: 'تحدي 21s بالدامبلز (7 سفلي + 7 علوي + 7 كامل)',
        nameEn: 'Dumbbell Bicep 21s',
        bwName: 'سوبر-ست مقاومة منشفة للفشل',
        bwNameEn: 'High-Tension Towel 21s',
        sets: 3,
        repsOrDuration: '21 تكرار',
        tempoNote: 'تحكم تام',
        formCue: 'حافظ على استقامة الظهر حتى في آخر 7 تكرارات.',
      },
    },
  },
  {
    id: 'pull-4',
    muscleGroup: 'أسفل الظهر والقبضة',
    usesDumbbells: true,
    suggestedWeightFactor: 1.0,
    byTier: {
      1: {
        name: 'ثبات سوبرمان + مشية المزارع الخفيفة',
        nameEn: 'Superman Hold + Light Farmer March',
        bwName: 'ثبات سوبرمان لتقوية أسفل الظهر',
        bwNameEn: 'Superman Back Hold',
        sets: 2,
        repsOrDuration: '25 ثانية',
        tempoNote: 'تنفس هادئ',
        formCue: 'ارفع الصدر والفخذين برفق دون شد الرقبة.',
      },
      2: {
        name: 'مشية المزارع في المكان بالدامبلز',
        nameEn: 'DB Farmer Carry March',
        bwName: 'سوبرمان متبادل (Bird-Dog)',
        bwNameEn: 'Bird-Dog Hold',
        sets: 3,
        repsOrDuration: '35 ثانية',
        tempoNote: 'خطوات ثابتة',
        formCue: 'الكتفان للخلف والصدر مرفوع طوال المشي.',
      },
      3: {
        name: 'مشية المزارع + ثبات سوبرمان',
        nameEn: 'DB Farmer Hold + Superman',
        bwName: 'Bird-Dog مع ثبات 3 ثوانٍ',
        bwNameEn: 'Pause Bird-Dog',
        sets: 3,
        repsOrDuration: '45 ثانية',
        tempoNote: 'ثبات الجذع',
        formCue: 'يقوي القبضة والساعدين وعضلات الثبات العميقة.',
      },
      4: {
        name: 'حمل دامبل في يد واحدة (Suitcase March)',
        nameEn: 'Single-Arm DB Suitcase March',
        bwName: 'سوبرمان متقدم + ثبات جانبي',
        bwNameEn: 'Superman + Side Plank',
        sets: 4,
        repsOrDuration: '45 ثانية لكل يد',
        tempoNote: 'مقاومة الميل',
        formCue: 'امنع الجسم من الميلان نحو اليد الحاملة للوزن.',
      },
      5: {
        name: 'حمل ثقيل بالدامبلز لأقصى ثبات + سوبرمان',
        nameEn: 'Heavy DB Farmer Hold + Pause Superman',
        bwName: 'Arch Body Hold',
        bwNameEn: 'Arch Body Hold',
        sets: 4,
        repsOrDuration: '60 ثانية',
        tempoNote: 'أقصى تركيز',
        formCue: 'تنفس ثابت تحت الحمل لبناء قوة الساعد والجذع.',
      },
    },
  },
];

const FULL_BODY_EXERCISES: RawSlot[] = [
  {
    id: 'full-1',
    muscleGroup: 'قوة شاملة بالدامبلز',
    usesDumbbells: true,
    suggestedWeightFactor: 0.85,
    byTier: {
      1: {
        name: 'سكوات ثم ضغط علوي خفيف بالدامبلز',
        nameEn: 'Light DB Squat-to-Press',
        bwName: 'سكوات + مد الذراعين للأعلى',
        bwNameEn: 'Squat to Overhead Reach',
        sets: 2,
        repsOrDuration: '8–10 تكرار',
        tempoNote: 'حركة سلسة',
        formCue: 'استخدم دفع الساقين لمساعدة الذراعين في الرفع.',
      },
      2: {
        name: 'ثراستر بالدامبلز (DB Thrusters)',
        nameEn: 'Dumbbell Thrusters',
        bwName: 'سكوات + ضغط (بدون وزن)',
        bwNameEn: 'Squat + Push-up Combo',
        sets: 3,
        repsOrDuration: '10–12 تكرار',
        tempoNote: 'إيقاع منتظم',
        formCue: 'حركة واحدة متصلة من أسفل السكوات حتى مد الذراعين.',
      },
      3: {
        name: 'ثراستر بالدامبلز متوسط الشدة',
        nameEn: 'DB Thrusters',
        bwName: 'بيربي بدون قفز + سكوات',
        bwNameEn: 'Step-Back Burpees',
        sets: 4,
        repsOrDuration: '12 تكرار',
        tempoNote: '2-0-X',
        formCue: 'تنفس: شهيق عند النزول، زفير قوي عند الدفع للأعلى.',
      },
      4: {
        name: 'كلين آند برس بالدامبلز (Clean & Press)',
        nameEn: 'Dumbbell Clean & Press',
        bwName: 'بيربي كامل + ضغط',
        bwNameEn: 'Full Burpee + Push-up',
        sets: 4,
        repsOrDuration: '12 تكرار',
        tempoNote: 'انفجاري من الحوض',
        formCue: 'اسحب الدامبلز قريبين من الجسم بحركة الحوض.',
      },
      5: {
        name: 'مركب دامبلز: كلين + سكوات + برس + تجديف',
        nameEn: 'DB Complex (Clean+Squat+Press+Row)',
        bwName: 'بيربي + ضغط + سكوات قفز',
        bwNameEn: 'Explosive Full-Body Complex',
        sets: 4,
        repsOrDuration: '8 جولات متصلة',
        tempoNote: 'بدون إفلات الدامبلز',
        formCue: 'أكمل الجولة كاملة قبل وضع الدامبلز على الأرض.',
      },
    },
  },
  {
    id: 'full-2',
    muscleGroup: 'الظهر والكور الديناميكي',
    usesDumbbells: true,
    suggestedWeightFactor: 0.85,
    byTier: {
      1: {
        name: 'سحب الدامبل من بلانك على الركبتين',
        nameEn: 'Kneeling DB Plank Pull-Through',
        bwName: 'بلانك على الركبتين مع رفع اليد',
        bwNameEn: 'Kneeling Plank Reach',
        sets: 2,
        repsOrDuration: '8 لكل يد',
        tempoNote: 'بطيء وثابت',
        formCue: 'افتح القدمين قليلًا لزيادة توازن الحوض.',
      },
      2: {
        name: 'سحب رينيجيد بالدامبلز (Renegade Row)',
        nameEn: 'DB Renegade Rows',
        bwName: 'بلانك مع لمس الكتفين',
        bwNameEn: 'Plank Shoulder Taps',
        sets: 3,
        repsOrDuration: '8 لكل ذراع',
        tempoNote: '2-1-1',
        formCue: 'حافظ على الحوض موازيًا للأرض دون التواء.',
      },
      3: {
        name: 'رينيجيد رو + ضغط بالدامبلز',
        nameEn: 'DB Push-up to Renegade Row',
        bwName: 'ضغط + لمس الكتفين',
        bwNameEn: 'Push-up to Shoulder Tap',
        sets: 3,
        repsOrDuration: '10 دورات',
        tempoNote: 'متحكم',
        formCue: 'شد البطن بقوة عند سحب كل دامبل.',
      },
      4: {
        name: 'تحدي الدامبل: مان ميكرز (Man Makers)',
        nameEn: 'Dumbbell Man Makers',
        bwName: 'متسلق الجبل + ضغط',
        bwNameEn: 'Mountain Climbers + Push-up',
        sets: 4,
        repsOrDuration: '8–10 تكرار',
        tempoNote: 'إيقاع رياضي',
        formCue: 'ضغط + سحب يمين + سحب يسار + قفز للسكوات + دفع للأعلى.',
      },
      5: {
        name: 'سوبر-ست مان ميكرز + متسلق الجبل السريع',
        nameEn: 'DB Man Makers + Sprint Climbers',
        bwName: 'بيربي ماسي + متسلق جبل',
        bwNameEn: 'Diamond Burpees + Climbers',
        sets: 4,
        repsOrDuration: '10 + 30 ثانية',
        tempoNote: 'أقصى جهد',
        formCue: 'حافظ على جودة التكنيك حتى مع ارتفاع نبض القلب.',
      },
    },
  },
  {
    id: 'full-3',
    muscleGroup: 'اللياقة وحرق السعرات',
    usesDumbbells: false,
    suggestedWeightFactor: 0,
    byTier: {
      1: {
        name: 'مشي سريع في المكان مع رفع الركبتين',
        nameEn: 'High-Knee March',
        sets: 2,
        repsOrDuration: '35 ثانية',
        tempoNote: 'منخفض الصدمة',
        formCue: 'حافظ على تنفس عميق وإيقاع مريح.',
      },
      2: {
        name: 'جامبينج جاكس (Jumping Jacks)',
        nameEn: 'Jumping Jacks',
        sets: 3,
        repsOrDuration: '35 ثانية',
        tempoNote: 'إيقاع ثابت',
        formCue: 'هبوط خفيف على مقدمة القدم.',
      },
      3: {
        name: 'متسلق الجبل (Mountain Climbers)',
        nameEn: 'Mountain Climbers',
        sets: 3,
        repsOrDuration: '40 ثانية',
        tempoNote: 'سريع ومتحكم',
        formCue: 'الكتفان فوق المعصمين مباشرة.',
      },
      4: {
        name: 'متسلق الجبل + سكوات قفز',
        nameEn: 'Climbers + Squat Jumps',
        sets: 4,
        repsOrDuration: '45 ثانية',
        tempoNote: 'كثافة عالية',
        formCue: 'انتقال مباشر بين التمرينين مع تحكم بالنزول.',
      },
      5: {
        name: 'تاباتا عالية الشدة (Sprawl + High Knees)',
        nameEn: 'Sprawls + Sprint High Knees',
        sets: 4,
        repsOrDuration: '45 ثانية عمل / 15 راحة',
        tempoNote: 'سرعة قصوى',
        formCue: 'ارفع الركبتين لمستوى الخصر بأقصى سرعة.',
      },
    },
  },
];

const CORE_MOBILITY_EXERCISES: RawSlot[] = [
  {
    id: 'core-1',
    muscleGroup: 'البطن الجانبي',
    usesDumbbells: true,
    suggestedWeightFactor: 0.65,
    byTier: {
      1: {
        name: 'التفاف الجذع بدون وزن أو بدمبل خفيف',
        nameEn: 'Seated Torso Twist',
        bwName: 'التفاف الجذع جلوسًا',
        bwNameEn: 'Seated Russian Twist',
        sets: 2,
        repsOrDuration: '14 تكرار',
        tempoNote: '2-0-2',
        formCue: 'حرك الكتفين مع الجذع وليس الذراعين فقط.',
      },
      2: {
        name: 'راشن تويست بالدامبل (Russian Twists)',
        nameEn: 'DB Russian Twists',
        bwName: 'راشن تويست مع رفع الكعبين',
        bwNameEn: 'Elevated Heel Russian Twists',
        sets: 3,
        repsOrDuration: '18 تكرار',
        tempoNote: 'متوازن',
        formCue: 'اجعل الظهر مفرودًا بزاوية 45 درجة.',
      },
      3: {
        name: 'حطّاب الخشب بالدامبل (Woodchoppers)',
        nameEn: 'DB Diagonal Woodchoppers',
        bwName: 'دراجة هوائية بطيئة (Bicycle Crunch)',
        bwNameEn: 'Slow Bicycle Crunches',
        sets: 3,
        repsOrDuration: '12 لكل جانب',
        tempoNote: '2-1-1',
        formCue: 'اربط حركة الجذع بدوران الحوض والقدمين.',
      },
      4: {
        name: 'راشن تويست بالدامبل + رفع الساقين',
        nameEn: 'DB Russian Twist + Leg Raises',
        bwName: 'رفع الساقين المستقيمين + دراجة',
        bwNameEn: 'Leg Raises + Bicycle Crunch',
        sets: 4,
        repsOrDuration: '20 + 12 تكرار',
        tempoNote: 'تحكم بالأسفل',
        formCue: 'لا تدع أسفل الظهر يتقوس عند إنزال الساقين.',
      },
      5: {
        name: 'وودتشوبر ثقيل + V-Ups بالدامبل',
        nameEn: 'DB Woodchoppers + Weighted V-Ups',
        bwName: 'V-Ups + دراجة بطيئة للفشل',
        bwNameEn: 'V-Ups + Slow Bicycles',
        sets: 4,
        repsOrDuration: '14/جانب + 15 تكرار',
        tempoNote: '3-1-1',
        formCue: 'تركيز أقصى على عضلات البطن العميقة والمائلة.',
      },
    },
  },
  {
    id: 'core-2',
    muscleGroup: 'الثبات الجانبي والمرونة',
    usesDumbbells: true,
    suggestedWeightFactor: 0.75,
    byTier: {
      1: {
        name: 'ديد باج (Dead Bug) + ميل جانبي خفيف',
        nameEn: 'Dead Bug + Light Side Bend',
        bwName: 'Dead Bug (ثبات العمود الفقري)',
        bwNameEn: 'Dead Bug',
        sets: 2,
        repsOrDuration: '10 لكل جانب',
        tempoNote: 'بطيء جدًا',
        formCue: 'تأكد من عدم وجود فراغ تحت أسفل الظهر.',
      },
      2: {
        name: 'بلانك جانبي على الركبتين أو كامل',
        nameEn: 'Side Plank',
        bwName: 'بلانك جانبي',
        bwNameEn: 'Side Plank',
        sets: 3,
        repsOrDuration: '25 ثانية لكل جانب',
        tempoNote: 'خط مستقيم',
        formCue: 'ارفع الخصر بعيدًا عن الأرض وحافظ على التنفس.',
      },
      3: {
        name: 'بلانك جانبي مع خفض ورفع الحوض + ميل بالدامبل',
        nameEn: 'Side Plank Dips + DB Side Bend',
        bwName: 'بلانك جانبي مع خفض ورفع الحوض',
        bwNameEn: 'Side Plank Hip Dips',
        sets: 3,
        repsOrDuration: '12 لكل جانب',
        tempoNote: '2-1-1',
        formCue: 'انزل برفق دون لمس الأرض واصعد بانقباض الجانب.',
      },
      4: {
        name: 'بلانك جانبي محمل بدمبل على الخصر',
        nameEn: 'Weighted Side Plank',
        bwName: 'بلانك جانبي نجمي (Star Side Plank)',
        bwNameEn: 'Star Side Plank',
        sets: 3,
        repsOrDuration: '35 ثانية لكل جانب',
        tempoNote: 'ثبات كامل',
        formCue: 'ضع الدامبل بلطف على عظم الورك العلوي.',
      },
      5: {
        name: 'بلانك جانبي مع تدوير بالدامبل (Thread the Needle)',
        nameEn: 'DB Side Plank Rotation',
        bwName: 'Star Side Plank + Rotation',
        bwNameEn: 'Star Side Plank Rotation',
        sets: 4,
        repsOrDuration: '12 لكل جانب',
        tempoNote: 'تحكم فائق',
        formCue: 'اقرن الثبات بالدوران البطيء للكتف والجذع.',
      },
    },
  },
  {
    id: 'core-3',
    muscleGroup: 'فك الشد والمرونة',
    usesDumbbells: false,
    suggestedWeightFactor: 0,
    byTier: {
      1: {
        name: 'إطالة القط والبقرة + فتح الورك',
        nameEn: 'Cat-Cow + Hip Opener Stretch',
        sets: 2,
        repsOrDuration: '60 ثانية',
        tempoNote: 'تنفس عميق',
        formCue: 'شهيق عند تمديد العمود الفقري وزفير عند تقويسه.',
      },
      2: {
        name: 'فتح الصدر والكتفين + تدوير العمود الفقري',
        nameEn: 'Thoracic Openers + World Greatest Stretch',
        sets: 2,
        repsOrDuration: '90 ثانية',
        tempoNote: 'تمدد مريح',
        formCue: 'حرك المفاصل بنطاق مريح بدون ألم.',
      },
      3: {
        name: 'سلسلة مرونة كاملة (الورك + الكاحل + الكتف)',
        nameEn: 'Full Mobility Flow',
        sets: 2,
        repsOrDuration: '3 دقائق',
        tempoNote: 'انسيابية',
        formCue: 'يسرّع الاستشفاء ويحسن عمق السكوات والضغط.',
      },
      4: {
        name: 'سلسلة مرونة متقدمة + Deep Squat Hold',
        nameEn: 'Deep Squat Pry + Mobility Flow',
        sets: 2,
        repsOrDuration: '3 دقائق',
        tempoNote: 'ثبات وفتح',
        formCue: 'اجلس في وضع السكوات العميق وافتح الركبتين بالمرفقين.',
      },
      5: {
        name: 'إطالة ديناميكية واستشفاء عضلي عميق',
        nameEn: 'Deep Recovery & Decompression Flow',
        sets: 2,
        repsOrDuration: '4 دقائق',
        tempoNote: 'استرخاء عضلي',
        formCue: 'ركّز على إبطاء الزفير لخفض التوتر العضلي.',
      },
    },
  },
];

const ACTIVE_RECOVERY_EXERCISES: WorkoutExercise[] = [
  {
    id: 'rec-1',
    name: 'مشي خفيف أو تحريك المفاصل',
    nameEn: 'Joint Mobility & Light Walk',
    muscleGroup: 'المفاصل والدورة الدموية',
    usesDumbbells: false,
    equipmentLabel: 'وزن الجسم',
    sets: 1,
    repsOrDuration: '5 دقائق',
    restSeconds: 30,
    tempoNote: 'هادئ ومريح',
    formCue: 'تدوير الكتفين، الرسغين، الوركين، والكاحلين بسلاسة.',
    suggestedWeightFactor: 0,
  },
  {
    id: 'rec-2',
    name: 'إطالة عضلات الصدر والظهر والورك',
    nameEn: 'Upper & Hip Mobility Flow',
    muscleGroup: 'المرونة والاستشفاء',
    usesDumbbells: false,
    equipmentLabel: 'وزن الجسم',
    sets: 2,
    repsOrDuration: '45 ثانية لكل جانب',
    restSeconds: 20,
    tempoNote: 'تنفس عميق',
    formCue: 'تجنب الإطالة المؤلمة؛ حافظ على شد خفيف ومريح.',
    suggestedWeightFactor: 0,
  },
  {
    id: 'rec-3',
    name: 'تمرين تنفس عميق وتهدئة الجهاز العصبي',
    nameEn: 'Box Breathing & Decompression',
    muscleGroup: 'الاستشفاء',
    usesDumbbells: false,
    equipmentLabel: 'وزن الجسم',
    sets: 1,
    repsOrDuration: '3 دقائق',
    restSeconds: 0,
    tempoNote: '4 شهيق · 4 ثبات · 4 زفير',
    formCue: 'الراحة والاستشفاء جزء أساسي من التطور البدني.',
    suggestedWeightFactor: 0,
  },
];

interface SplitDefinition {
  title: string;
  subtitle: string;
  focusMuscles: string;
  slots: RawSlot[];
}

const WEEKLY_SPLIT_BY_DAY: Record<number, SplitDefinition> = {
  0: {
    title: 'يوم الدفع والجزء العلوي',
    subtitle: 'UPPER PUSH · DUMBBELLS & BODYWEIGHT',
    focusMuscles: 'الصدر · الأكتاف · الترايسبس',
    slots: PUSH_EXERCISES,
  },
  1: {
    title: 'يوم الأرجل والكور',
    subtitle: 'LOWER BODY & CORE POWER',
    focusMuscles: 'الأمامية · الخلفية · الأرداف · البطن',
    slots: LOWER_EXERCISES,
  },
  2: {
    title: 'لياقة وحركة نشطة',
    subtitle: 'ACTIVE CONDITIONING & MOBILITY',
    focusMuscles: 'الكور · المرونة · التحمل',
    slots: CORE_MOBILITY_EXERCISES,
  },
  3: {
    title: 'يوم السحب والظهر والبايسبس',
    subtitle: 'UPPER PULL · DUMBBELL FOCUS',
    focusMuscles: 'الظهر · الكتف الخلفي · البايسبس · القبضة',
    slots: PULL_EXERCISES,
  },
  4: {
    title: 'القوة الشاملة بالدامبلز',
    subtitle: 'FULL BODY DUMBBELL CONDITIONING',
    focusMuscles: 'كامل الجسم · القوة · التحمل',
    slots: FULL_BODY_EXERCISES,
  },
  5: {
    title: 'مرونة وكور خفيف',
    subtitle: 'CORE STABILITY & RECOVERY FLOW',
    focusMuscles: 'الكور · أسفل الظهر · المرونة',
    slots: CORE_MOBILITY_EXERCISES,
  },
  6: {
    title: 'ثبات الكور والمرونة المتدرجة',
    subtitle: 'CORE STABILITY & MOBILITY',
    focusMuscles: 'البطن المائل · الثبات الجانبي · المفاصل',
    slots: CORE_MOBILITY_EXERCISES,
  },
};

function instantiateSlot(
  slot: RawSlot,
  tier: WorkoutTier,
  hasDumbbells: boolean,
  restSec: number
): WorkoutExercise {
  const cfg = slot.byTier[tier];
  const usesDumbbells = hasDumbbells && slot.usesDumbbells;
  const displayName = usesDumbbells ? cfg.name : cfg.bwName ?? cfg.name;
  const displayNameEn = usesDumbbells ? cfg.nameEn : cfg.bwNameEn ?? cfg.nameEn;

  return {
    id: slot.id,
    name: displayName,
    nameEn: displayNameEn,
    muscleGroup: slot.muscleGroup,
    usesDumbbells,
    equipmentLabel: usesDumbbells ? 'دامبلز' : 'وزن الجسم',
    sets: cfg.sets,
    repsOrDuration: cfg.repsOrDuration,
    restSeconds: restSec,
    tempoNote: cfg.tempoNote,
    formCue: cfg.formCue,
    suggestedWeightFactor: usesDumbbells ? slot.suggestedWeightFactor : 0,
  };
}

export function getWorkoutForDay(params: {
  dayIndex: number;
  workoutDays: number[];
  tier: WorkoutTier;
  hasDumbbells: boolean;
  forceActive?: boolean;
}): DailyWorkoutPlan {
  const { dayIndex, workoutDays, tier, hasDumbbells, forceActive = false } = params;
  const normalizedDay = ((dayIndex % 7) + 7) % 7;
  const isTrainingDay = forceActive || workoutDays.includes(normalizedDay);
  const tierMeta = WORKOUT_TIERS[tier];
  const split = WEEKLY_SPLIT_BY_DAY[normalizedDay] ?? WEEKLY_SPLIT_BY_DAY[0];

  if (!isTrainingDay) {
    return {
      dayIndex: normalizedDay,
      dayNameAr: DAY_NAMES_AR[normalizedDay],
      splitTitle: 'يوم راحة واستشفاء عضلي',
      splitSubtitle: 'REST & ACTIVE RECOVERY',
      focusMuscles: 'استشفاء العضلات · إطالات · تنفس',
      isRestOrRecovery: true,
      tier,
      tierLabel: tierMeta.label,
      estimatedMinutes: 10,
      exercises: ACTIVE_RECOVERY_EXERCISES,
    };
  }

  return {
    dayIndex: normalizedDay,
    dayNameAr: DAY_NAMES_AR[normalizedDay],
    splitTitle: split.title,
    splitSubtitle: split.subtitle,
    focusMuscles: split.focusMuscles,
    isRestOrRecovery: false,
    tier,
    tierLabel: tierMeta.label,
    estimatedMinutes: tierMeta.estimatedMinutes,
    exercises: split.slots.map((slot) =>
      instantiateSlot(slot, tier, hasDumbbells, tierMeta.restSec)
    ),
  };
}
