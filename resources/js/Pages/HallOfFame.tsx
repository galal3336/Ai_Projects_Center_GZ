import { Link } from '@inertiajs/react';
import SEOHead, { type SeoMeta } from '@/components/SEOHead';
import { useEffect, useRef, useState } from 'react';
import {
    Award,
    BarChart3,
    Brain,
    ChevronRight,
    Code2,
    Crown,
    Eye,
    Flame,
    GraduationCap,
    Medal,
    Sparkles,
    Star,
    Trophy,
    TrendingUp,
    Users,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HofProject {
    id: string | number; rank: number;
    // Real DB fields
    title?: string; title_ar?: string | null;
    slug?: string; thumbnail?: string | null;
    category?: string | null; category_ar?: string | null; category_color?: string | null;
    department?: string | null; academic_year?: number | null;
    views_count?: number; stars_count?: number; awards_count?: number;
    hof_score?: number; tags?: string[];
    // Legacy mock fields (kept for fallback rendering)
    titleEn?: string; titleAr?: string;
    categoryEn?: string; categoryAr?: string;
    team?: string; university?: string;
    views?: number; stars?: number; awards?: number;
    quality?: number; score?: number; year?: number;
    descriptionEn?: string; descriptionAr?: string;
    accentColor?: string;
}

interface HofStudent {
    id: number; rank: number;
    name: string;
    // Real DB fields
    avatar?: string | null; department?: string | null;
    graduation_year?: number | null;
    total_points?: number; projects_count?: number;
    awards_count?: number; stars_count?: number; views_count?: number;
    top_skills?: string[];
    // Legacy mock fields
    initials?: string; university?: string;
    totalPoints?: number; projects?: number; awards?: number;
    stars?: number; views?: number;
    accentColor?: string; graduationYear?: number;
    topSkills?: string[];
    bioEn?: string; bioAr?: string;
}

interface HofTeam {
    id: number; rank: number;
    name: string; university: string;
    members: number; projects: number;
    totalStars: number; totalAwards: number; totalViews: number;
    score: number; accentColor: string; initials: string;
    specializationEn: string; specializationAr: string;
}

interface HofAward {
    id: string | number;
    // Real DB fields
    title?: string; title_ar?: string | null;
    issuer?: string | null; rank?: string | null;
    awarded_at?: string | null; academic_year?: number | null;
    is_verified?: boolean;
    project_title?: string | null; project_title_ar?: string | null;
    project_slug?: string | null;
    competition_name?: string | null; competition_name_ar?: string | null;
    // Legacy mock fields
    titleEn?: string; titleAr?: string;
    recipient?: string;
    recipientType?: 'student' | 'team' | 'project';
    university?: string; year?: number;
    descriptionEn?: string; descriptionAr?: string;
    icon?: React.ElementType;
    tier?: 'gold' | 'silver' | 'bronze' | 'special';
    accentColor?: string;
}

interface HofStats {
    projects_judged: number;
    students_competed: number;
    total_awards: number;
    competitions_held: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const HOF_PROJECTS: HofProject[] = [
    { id: 1, rank: 1, titleEn: 'NeuroVision: Medical Imaging AI', titleAr: 'نيوروفيجن: ذكاء اصطناعي للتصوير الطبي', categoryEn: 'Computer Vision', categoryAr: 'رؤية الحاسوب', team: 'AlphaMinds', university: 'KFUPM', views: 28_470, stars: 1_842, awards: 4, quality: 98, score: 9840, year: 2025, descriptionEn: 'Transformer-based early tumor detection achieving 97.3% accuracy—outperforming radiologists in controlled clinical trials.', descriptionAr: 'كشف مبكر عن الأورام قائم على المحولات يحقق دقة 97.3%، متفوقاً على الأطباء في التجارب السريرية المضبوطة.', tags: ['PyTorch', 'Transformers', 'Medical AI', 'Computer Vision'], accentColor: '#f59e0b' },
    { id: 2, rank: 2, titleEn: 'ArabicNLU: SOTA Arabic Language Model', titleAr: 'عربيك-NLU: نموذج لغوي عربي متطور', categoryEn: 'NLP', categoryAr: 'معالجة اللغة', team: 'LinguaForge', university: 'KAU', views: 41_200, stars: 2_310, awards: 3, quality: 96, score: 8720, year: 2025, descriptionEn: 'Fine-tuned LLaMA-3 on 40B Arabic tokens, setting new state-of-the-art benchmarks across 12 Arabic NLU tasks.', descriptionAr: 'ضبط دقيق لنموذج LLaMA-3 على 40 مليار رمز عربي لتحقيق معايير جديدة في 12 مهمة لفهم اللغة العربية.', tags: ['LLMs', 'HuggingFace', 'Arabic NLP', 'CUDA'], accentColor: '#8b5cf6' },
    { id: 3, rank: 3, titleEn: 'ClimateNet: Climate Prediction via GNNs', titleAr: 'كلايمت-نت: التنبؤ المناخي عبر الشبكات العصبية الرسومية', categoryEn: 'Machine Learning', categoryAr: 'تعلم الآلة', team: 'GeoAI Lab', university: 'KAUST', views: 19_830, stars: 1_120, awards: 2, quality: 94, score: 7950, year: 2025, descriptionEn: 'Graph neural networks processing 30 years of satellite data for regional climate anomaly forecasting.', descriptionAr: 'شبكات عصبية رسومية تعالج 30 عاماً من بيانات الأقمار الاصطناعية للتنبؤ بالشذوذات المناخية الإقليمية.', tags: ['GNN', 'Spark', 'AWS', 'Climate Tech'], accentColor: '#10b981' },
    { id: 4, rank: 4, titleEn: 'DuneBot: Autonomous Sand Navigation', titleAr: 'دون-بوت: الملاحة الذاتية في الكثبان الرملية', categoryEn: 'Robotics & AI', categoryAr: 'الروبوتيات والذكاء الاصطناعي', team: 'RoboKFUPM', university: 'KFUPM', views: 12_450, stars: 876, awards: 2, quality: 91, score: 6430, year: 2024, descriptionEn: 'RL-based autonomous agent for sand dune traversal with zero prior mapping, validated in live desert conditions.', descriptionAr: 'عميل مستقل قائم على التعلم المعزز لاجتياز الكثبان الرملية دون خرائط مسبقة، مُختبَر في بيئة صحراوية حقيقية.', tags: ['RL', 'ROS', 'OpenCV', 'Embedded AI'], accentColor: '#ec4899' },
    { id: 5, rank: 5, titleEn: 'SignBridge: Real-Time Sign Language', titleAr: 'سيجن-بريدج: ترجمة لغة الإشارة في الوقت الفعلي', categoryEn: 'Computer Vision', categoryAr: 'رؤية الحاسوب', team: 'AccessAI', university: 'KSU', views: 9_870, stars: 743, awards: 1, quality: 89, score: 5870, year: 2025, descriptionEn: '94% accurate ASL-to-text live translation system enabling real-time communication for the deaf community.', descriptionAr: 'نظام ترجمة فورية للغة الإشارة إلى نص بدقة 94% لتمكين التواصل الآني للصم.', tags: ['TensorFlow', 'OpenCV', 'FastAPI', 'GCP'], accentColor: '#3b82f6' },
];

const HOF_STUDENTS: HofStudent[] = [
    { id: 1, rank: 1, name: 'Sara Al-Rashid', initials: 'SA', university: 'KFUPM', department: 'Computer Science', totalPoints: 9840, projects: 7, awards: 4, stars: 1842, views: 28470, accentColor: '#f59e0b', graduationYear: 2025, topSkills: ['Computer Vision', 'Deep Learning', 'Research'], bioEn: 'Published in Nature Digital Medicine. First-ever AI student to win 4 consecutive national awards.', bioAr: 'منشورة في مجلة Nature للطب الرقمي. أول طالبة ذكاء اصطناعي تفوز بـ4 جوائز وطنية متتالية.' },
    { id: 2, rank: 2, name: 'Omar Khalil', initials: 'OK', university: 'KAU', department: 'AI & Data Science', totalPoints: 8720, projects: 5, awards: 3, stars: 2310, views: 41200, accentColor: '#8b5cf6', graduationYear: 2025, topSkills: ['NLP', 'LLMs', 'Open Source'], bioEn: 'Most-viewed student profile on the platform. Arabic NLP pioneer with 40B token dataset.', bioAr: 'الملف الشخصي الأكثر مشاهدةً على المنصة. رائد في معالجة اللغة العربية بمجموعة بيانات 40 مليار رمز.' },
    { id: 3, rank: 3, name: 'Nour Hassan', initials: 'NH', university: 'KAUST', department: 'Computer Science', totalPoints: 7950, projects: 9, awards: 2, stars: 1120, views: 19830, accentColor: '#10b981', graduationYear: 2024, topSkills: ['Machine Learning', 'Data Science', 'Climate AI'], bioEn: 'Highest project count in the cohort. Climate AI researcher with satellite data expertise.', bioAr: 'الأعلى عدداً من المشاريع في الفوج. باحث في ذكاء اصطناعي المناخ متخصص في بيانات الأقمار الاصطناعية.' },
    { id: 4, rank: 4, name: 'Lina Karimi', initials: 'LK', university: 'KAUST', department: 'AI Security', totalPoints: 4980, projects: 4, awards: 2, stars: 934, views: 14560, accentColor: '#ec4899', graduationYear: 2027, topSkills: ['AI Security', 'Federated Learning', 'Privacy ML'], bioEn: 'Rising star in privacy-preserving AI. Youngest featured researcher in AiKFS history.', bioAr: 'نجمة صاعدة في مجال الذكاء الاصطناعي المحافظ على الخصوصية. الباحثة الأصغر سناً المُبرزة في تاريخ AiKFS.' },
    { id: 5, rank: 5, name: 'Khalid Mohammed', initials: 'KM', university: 'KFUPM', department: 'Robotics', totalPoints: 6430, projects: 6, awards: 2, stars: 876, views: 12450, accentColor: '#6366f1', graduationYear: 2026, topSkills: ['Reinforcement Learning', 'Robotics', 'RL'], bioEn: 'Pioneering autonomous navigation in extreme environments. Three robotics patents filed.', bioAr: 'رائد في الملاحة المستقلة في البيئات القاسية. ثلاثة براءات اختراع مُقدَّمة في مجال الروبوتيات.' },
];

const HOF_TEAMS: HofTeam[] = [
    { id: 1, rank: 1, name: 'AlphaMinds', university: 'KFUPM', members: 4, projects: 7, totalStars: 2840, totalAwards: 6, totalViews: 48_300, score: 9600, accentColor: '#f59e0b', initials: 'AM', specializationEn: 'Medical AI & Computer Vision', specializationAr: 'الذكاء الاصطناعي الطبي ورؤية الحاسوب' },
    { id: 2, rank: 2, name: 'LinguaForge', university: 'KAU', members: 3, projects: 5, totalStars: 3120, totalAwards: 4, totalViews: 62_500, score: 8800, accentColor: '#8b5cf6', initials: 'LF', specializationEn: 'Arabic NLP & Generative AI', specializationAr: 'معالجة اللغة العربية والذكاء الاصطناعي التوليدي' },
    { id: 3, rank: 3, name: 'GeoAI Lab', university: 'KAUST', members: 5, projects: 9, totalStars: 1940, totalAwards: 3, totalViews: 31_200, score: 7800, accentColor: '#10b981', initials: 'GL', specializationEn: 'Climate AI & GNNs', specializationAr: 'ذكاء اصطناعي المناخ والشبكات العصبية الرسومية' },
    { id: 4, rank: 4, name: 'RoboKFUPM', university: 'KFUPM', members: 6, projects: 6, totalStars: 1320, totalAwards: 3, totalViews: 22_100, score: 6200, accentColor: '#ec4899', initials: 'RK', specializationEn: 'Robotics & Embedded AI', specializationAr: 'الروبوتيات والذكاء الاصطناعي المُدمَج' },
    { id: 5, rank: 5, name: 'AccessAI', university: 'KSU', members: 4, projects: 4, totalStars: 1090, totalAwards: 2, totalViews: 17_800, score: 5400, accentColor: '#3b82f6', initials: 'AA', specializationEn: 'Accessibility AI & CV', specializationAr: 'ذكاء اصطناعي إمكانية الوصول ورؤية الحاسوب' },
    { id: 6, rank: 6, name: 'NeuralCraft', university: 'KAU', members: 3, projects: 5, totalStars: 870, totalAwards: 2, totalViews: 14_300, score: 4800, accentColor: '#14b8a6', initials: 'NC', specializationEn: 'Deep Learning Research', specializationAr: 'أبحاث التعلم العميق' },
];

const HOF_AWARDS: HofAward[] = [
    { id: 1, titleEn: '1st Place — National AI Championship', titleAr: 'المركز الأول — بطولة الذكاء الاصطناعي الوطنية', recipient: 'Sara Al-Rashid', recipientType: 'student', university: 'KFUPM', year: 2025, descriptionEn: 'Awarded for NeuroVision: the highest-scoring project in competition history with a 98/100 quality score.', descriptionAr: 'مُمنحة لمشروع نيوروفيجن: أعلى مشروع تسجيلاً في تاريخ المسابقة بدرجة جودة 98/100.', icon: Crown, tier: 'gold', accentColor: '#f59e0b' },
    { id: 2, titleEn: 'Most Impactful Project', titleAr: 'أكثر المشاريع تأثيراً', recipient: 'LinguaForge', recipientType: 'team', university: 'KAU', year: 2025, descriptionEn: 'ArabicNLU became the most-starred student project on the platform, cited in 14 research papers.', descriptionAr: 'أصبح مشروع ArabicNLU الأكثر نجوماً على المنصة ومُستشهداً به في 14 ورقة بحثية.', icon: Flame, tier: 'gold', accentColor: '#f97316' },
    { id: 3, titleEn: 'Best Research Innovation', titleAr: 'أفضل ابتكار بحثي', recipient: 'Omar Khalil', recipientType: 'student', university: 'KAU', year: 2025, descriptionEn: 'Recognized for breakthrough fine-tuning methodology adopted by three regional universities.', descriptionAr: 'تكريماً لمنهجية الضبط الدقيق الرائدة التي تبنّتها ثلاث جامعات إقليمية.', icon: Sparkles, tier: 'silver', accentColor: '#94a3b8' },
    { id: 4, titleEn: 'Industry Choice Award', titleAr: 'جائزة اختيار الصناعة', recipient: 'AlphaMinds', recipientType: 'team', university: 'KFUPM', year: 2025, descriptionEn: 'Selected by a panel of 20 industry leaders as the project with the highest commercialization potential.', descriptionAr: 'انتخبه 20 قائداً صناعياً باعتباره المشروع الأعلى إمكانية للتسويق التجاري.', icon: Trophy, tier: 'silver', accentColor: '#94a3b8' },
    { id: 5, titleEn: 'Rising Star Award', titleAr: 'جائزة النجم الصاعد', recipient: 'Lina Karimi', recipientType: 'student', university: 'KAUST', year: 2025, descriptionEn: 'Youngest featured researcher recognized for pioneering work in privacy-preserving federated learning.', descriptionAr: 'أصغر باحثة مُبرزة تكريماً لعملها الرائد في التعلم الاتحادي المحافظ على الخصوصية.', icon: Star, tier: 'special', accentColor: '#ec4899' },
    { id: 6, titleEn: '3rd Place — National AI Championship', titleAr: 'المركز الثالث — بطولة الذكاء الاصطناعي الوطنية', recipient: 'GeoAI Lab', recipientType: 'team', university: 'KAUST', year: 2025, descriptionEn: 'ClimateNet awarded for most novel application of AI to a global humanitarian challenge.', descriptionAr: 'مُكافأ على التطبيق الأكثر ابتكاراً للذكاء الاصطناعي على تحدٍّ إنساني عالمي.', icon: Award, tier: 'bronze', accentColor: '#cd7c30' },
];

const SCORE_FACTORS = [
    { labelKey: 'hof.metrics.views',  icon: Eye,    weight: '25%', color: 'text-blue-400' },
    { labelKey: 'hof.metrics.stars',  icon: Star,   weight: '30%', color: 'text-amber-400' },
    { labelKey: 'hof.metrics.awards', icon: Trophy, weight: '30%', color: 'text-violet-400' },
    { labelKey: 'hof.metrics.quality',icon: Zap,    weight: '15%', color: 'text-emerald-400' },
];

const TIER_STYLES: Record<HofAward['tier'], { border: string; bg: string; labelKey: string; labelColor: string }> = {
    gold:    { border: 'border-amber-500/25',  bg: 'from-amber-500/[0.07] to-transparent',  labelKey: 'hof.metrics.gold',   labelColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    silver:  { border: 'border-slate-400/20',  bg: 'from-slate-400/[0.06] to-transparent',  labelKey: 'hof.metrics.silver', labelColor: 'text-slate-300 border-slate-400/30 bg-slate-400/10' },
    bronze:  { border: 'border-orange-600/20', bg: 'from-orange-700/[0.06] to-transparent', labelKey: 'hof.metrics.bronze', labelColor: 'text-orange-400 border-orange-600/30 bg-orange-700/10' },
    special: { border: 'border-pink-500/20',   bg: 'from-pink-500/[0.06] to-transparent',   labelKey: 'hof.metrics.special',labelColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
};

// ─── Shared sub-components ─────────────────────────────────────────────────────

function RankOrnament({ rank }: { rank: number }) {
    if (rank === 1) return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"><Crown className="h-4 w-4 text-white" /></div>;
    if (rank === 2) return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-400/20"><Medal className="h-4 w-4 text-white" /></div>;
    if (rank === 3) return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-700 shadow-lg shadow-orange-500/20"><Award className="h-4 w-4 text-white" /></div>;
    return <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"><span className="font-mono text-[11px] font-black text-white/35">#{rank}</span></div>;
}

function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: React.ElementType; title: string; subtitle: string; color: string }) {
    return (
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} shadow-lg`}><Icon className="h-6 w-6 text-white" /></div>
            <h2 className="hof-heading text-3xl font-black text-white/95 md:text-4xl">{title}</h2>
            <p className="max-w-xl text-[14px] leading-relaxed text-white/40">{subtitle}</p>
            <div className="mt-1 h-px w-24 bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </div>
    );
}

function ScoreBar({ score, max = 10000, color }: { score: number; max?: number; color: string }) {
    const pct = Math.round((score / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="w-12 text-right font-mono text-[11px] font-bold text-white/40">{score.toLocaleString()}</span>
        </div>
    );
}

// ─── Normalizers (real DB ↔ mock) ──────────────────────────────────────────────

const ACCENT_PALETTE = ['#f59e0b','#8b5cf6','#10b981','#ec4899','#3b82f6','#14b8a6','#f97316','#6366f1'];

function normalizeProject(p: HofProject, idx: number) {
    const accent = p.accentColor ?? ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
    return {
        id:          p.id,
        rank:        p.rank,
        titleEn:     p.title    ?? p.titleEn    ?? '',
        titleAr:     p.title_ar ?? p.titleAr    ?? '',
        categoryEn:  p.category    ?? p.categoryEn ?? '',
        categoryAr:  p.category_ar ?? p.categoryAr ?? '',
        team:        p.team   ?? p.department ?? '',
        university:  p.university ?? '',
        views:       p.views_count ?? p.views  ?? 0,
        stars:       p.stars_count ?? p.stars  ?? 0,
        awards:      p.awards_count ?? p.awards ?? 0,
        quality:     p.quality ?? 0,
        score:       p.hof_score ?? p.score ?? 0,
        year:        p.academic_year ?? p.year ?? 0,
        descriptionEn: p.descriptionEn ?? '',
        descriptionAr: p.descriptionAr ?? '',
        tags:        p.tags ?? [],
        accentColor: accent,
    };
}

function normalizeStudent(s: HofStudent, idx: number) {
    const accent = s.accentColor ?? ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
    const initials = s.initials ?? s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return {
        id:             s.id,
        rank:           s.rank,
        name:           s.name,
        initials,
        university:     s.university ?? s.department ?? '',
        department:     s.department ?? '',
        totalPoints:    s.total_points   ?? s.totalPoints   ?? 0,
        projects:       s.projects_count ?? s.projects      ?? 0,
        awards:         s.awards_count   ?? s.awards        ?? 0,
        stars:          s.stars_count    ?? s.stars         ?? 0,
        views:          s.views_count    ?? s.views         ?? 0,
        accentColor:    accent,
        graduationYear: s.graduation_year ?? s.graduationYear ?? 0,
        topSkills:      s.top_skills ?? s.topSkills ?? [],
        bioEn:          s.bioEn ?? '',
        bioAr:          s.bioAr ?? '',
    };
}

// ─── TOP PROJECTS ───────────────────────────────────────────────────────────────

function ProjectPodium({ projects: rawProjects }: { projects: HofProject[] }) {
    const { t, locale } = useI18n();
    const isAr = locale === 'ar';
    const projects = rawProjects.map(normalizeProject);
    const top3 = projects.slice(0, 3);

    return (
        <div className="mb-12">
            {/* Gold card */}
            <div className="mb-4 overflow-hidden rounded-3xl border border-amber-500/20 bg-linear-to-br from-amber-500/[0.07] to-transparent p-8 shadow-2xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/30">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    <div className="flex shrink-0 flex-col items-center gap-3">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-2xl"
                                style={{ background: `linear-gradient(135deg, ${top3[0].accentColor}cc, ${top3[0].accentColor}44)`, border: `2px solid ${top3[0].accentColor}55` }}>
                                {(isAr ? top3[0].categoryAr : top3[0].categoryEn).slice(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40 ring-2 ring-[#0a0a0a]">
                                <Crown className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
                            <Crown className="h-3 w-3 text-amber-400" />
                            <span className="text-[11px] font-black text-amber-300">{t('hof.metrics.gold')}</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-amber-500/20 bg-amber-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-amber-400">{isAr ? top3[0].categoryAr : top3[0].categoryEn}</span>
                            <span className="text-[11px] text-white/25">{top3[0].year}</span>
                        </div>
                        <h3 className="hof-heading mb-2 text-2xl font-black text-white/95 md:text-3xl">{isAr ? top3[0].titleAr : top3[0].titleEn}</h3>
                        <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-white/50">{isAr ? top3[0].descriptionAr : top3[0].descriptionEn}</p>
                        <div className="mb-5 flex flex-wrap gap-1.5">
                            {top3[0].tags.map(t => <span key={t} className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/45">{t}</span>)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: Eye,    labelKey: 'hof.metrics.views',   value: top3[0].views.toLocaleString() },
                                { icon: Star,   labelKey: 'hof.metrics.stars',   value: top3[0].stars.toLocaleString() },
                                { icon: Trophy, labelKey: 'hof.metrics.awards',  value: top3[0].awards },
                                { icon: Zap,    labelKey: 'hof.metrics.quality', value: `${top3[0].quality}/100` },
                            ].map(({ icon: Icon, labelKey, value }) => (
                                <div key={labelKey} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-white/30" />
                                    <div className="text-base font-black text-white/85">{value}</div>
                                    <div className="text-[10px] text-white/30">{t(labelKey)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 text-center lg:text-right">
                        <div className="hof-heading text-5xl font-black" style={{ color: top3[0].accentColor }}>{top3[0].score.toLocaleString()}</div>
                        <div className="text-[11px] text-white/30">{t('hof.hof_score')}</div>
                        <div className="mt-2 text-[12px] text-white/40">{top3[0].university}</div>
                        <div className="text-[11px] text-white/25">{top3[0].team}</div>
                    </div>
                </div>
            </div>

            {/* Silver + Bronze */}
            <div className="grid gap-4 md:grid-cols-2">
                {top3.slice(1).map(p => (
                    <div key={p.id} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                                    style={{ background: `linear-gradient(135deg, ${p.accentColor}bb, ${p.accentColor}44)`, border: `1.5px solid ${p.accentColor}44` }}>
                                    {(isAr ? p.categoryAr : p.categoryEn).slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[11px] text-white/30">{isAr ? p.categoryAr : p.categoryEn}</div>
                                    <h3 className="hof-heading text-[16px] font-black text-white/90 leading-tight">{isAr ? p.titleAr : p.titleEn}</h3>
                                </div>
                            </div>
                            <RankOrnament rank={p.rank} />
                        </div>
                        <p className="mb-4 line-clamp-2 text-[12px] leading-relaxed text-white/40">{isAr ? p.descriptionAr : p.descriptionEn}</p>
                        <div className="mb-3 flex gap-2 text-[12px] text-white/35">
                            <Eye className="h-3.5 w-3.5" /> {p.views.toLocaleString()}
                            <Star className="ms-2 h-3.5 w-3.5 text-amber-400/70" /> {p.stars.toLocaleString()}
                            <Trophy className="ms-2 h-3.5 w-3.5 text-violet-400/70" /> {p.awards}
                        </div>
                        <ScoreBar score={p.score} color={p.accentColor} />
                        <div className="mt-3 text-[11px] text-white/25">{p.university} · {p.team}</div>
                    </div>
                ))}
            </div>

            {/* Ranks 4-5 */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                {projects.slice(3).map(p => (
                    <div key={p.id} className="flex items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]">
                        <RankOrnament rank={p.rank} />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white" style={{ background: `linear-gradient(135deg, ${p.accentColor}aa, ${p.accentColor}33)` }}>
                            {(isAr ? p.categoryAr : p.categoryEn).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-bold text-white/80">{isAr ? p.titleAr : p.titleEn}</div>
                            <div className="text-[11px] text-white/30">{p.university} · {isAr ? p.categoryAr : p.categoryEn}</div>
                        </div>
                        <div className="hidden items-center gap-4 text-[12px] text-white/35 sm:flex">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400/70" />{p.stars.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-violet-400/70" />{p.awards}</span>
                        </div>
                        <div className="font-mono text-sm font-black" style={{ color: p.accentColor }}>{p.score.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── TOP STUDENTS ───────────────────────────────────────────────────────────────

function StudentPodium({ students: rawStudents }: { students: HofStudent[] }) {
    const { t, locale } = useI18n();
    const isAr = locale === 'ar';
    const students = rawStudents.map(normalizeStudent);
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="mb-12">
            <div className="mb-8 flex items-end justify-center gap-4">
                {[1, 0, 2].map((idx) => {
                    const s = students[idx];
                    const isGold = idx === 0;
                    const heights = ['h-36', 'h-48', 'h-28'];
                    const glows = ['shadow-slate-400/20', 'shadow-amber-500/30', 'shadow-orange-500/20'];
                    const podiumGrad = [
                        'from-slate-500/20 to-slate-700/10 border-slate-500/25',
                        'from-amber-500/25 to-amber-700/10 border-amber-500/30',
                        'from-orange-600/20 to-orange-800/10 border-orange-600/25',
                    ];
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-3" onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)}>
                            {isGold && <Crown className="h-5 w-5 text-amber-400 drop-shadow-lg" />}
                            <div className="relative cursor-default transition-transform duration-200" style={{ transform: hovered === s.id ? 'translateY(-4px)' : 'none' }}>
                                <div className={`flex items-center justify-center rounded-2xl font-black text-white shadow-2xl ${glows[idx]}`}
                                    style={{ width: isGold ? 64 : 52, height: isGold ? 64 : 52, background: `linear-gradient(135deg, ${s.accentColor}cc, ${s.accentColor}55)`, border: `2px solid ${s.accentColor}55` }}>
                                    {s.initials}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className={`font-black text-white/90 ${isGold ? 'text-[14px]' : 'text-[12px]'}`}>{s.name.split(' ')[0]}</div>
                                <div className="font-mono text-[11px] font-bold" style={{ color: s.accentColor }}>{s.totalPoints.toLocaleString()}</div>
                                <div className="text-[10px] text-white/25">{s.university}</div>
                            </div>
                            <div className={`w-28 rounded-t-2xl border bg-linear-to-b ${podiumGrad[idx]} ${heights[idx]} flex items-center justify-center`}>
                                <RankOrnament rank={s.rank} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {students.map(s => (
                    <div key={s.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5">
                        <div className="pointer-events-none absolute -top-8 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full blur-2xl opacity-20" style={{ background: s.accentColor }} />
                        <div className="relative mb-4 flex items-start justify-between gap-2">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black text-white shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${s.accentColor}cc, ${s.accentColor}44)`, border: `1.5px solid ${s.accentColor}44` }}>
                                {s.initials}
                            </div>
                            <RankOrnament rank={s.rank} />
                        </div>
                        <div className="relative mb-1 text-[14px] font-black text-white/90">{s.name}</div>
                        <div className="mb-3 text-[11px] text-white/30">{s.university} · {s.department}</div>
                        <p className="mb-4 line-clamp-2 text-[11px] leading-relaxed text-white/40">{isAr ? s.bioAr : s.bioEn}</p>
                        <div className="mb-3 flex flex-wrap gap-1">
                            {s.topSkills.slice(0, 2).map(sk => (
                                <span key={sk} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-white/45">{sk}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                            {[
                                { labelKey: 'hof.metrics.points',  value: s.totalPoints.toLocaleString() },
                                { labelKey: 'hof.metrics.awards',  value: s.awards },
                                { labelKey: 'hof.metrics.stars',   value: s.stars.toLocaleString() },
                            ].map(({ labelKey, value }) => (
                                <div key={labelKey} className="text-center">
                                    <div className="text-[12px] font-black text-white/80">{value}</div>
                                    <div className="text-[9px] text-white/25">{t(labelKey)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3"><ScoreBar score={s.totalPoints} color={s.accentColor} /></div>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/25">
                            <GraduationCap className="h-3 w-3 text-violet-400/50" />
                            {t('hof.class_of_year', { year: String(s.graduationYear) })}
                            <span className="ms-auto flex items-center gap-0.5"><Eye className="h-3 w-3" />{s.views.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── TOP TEAMS ──────────────────────────────────────────────────────────────────

function TeamsSection({ teams }: { teams: HofTeam[] }) {
    const { t, locale } = useI18n();
    const isAr = locale === 'ar';
    const top = teams[0];
    const rest = teams.slice(1);

    return (
        <div className="mb-12">
            <div className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] p-8"
                style={{ background: `linear-gradient(135deg, ${top.accentColor}10 0%, transparent 60%), rgba(255,255,255,0.015)` }}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-2xl"
                                style={{ background: `linear-gradient(135deg, ${top.accentColor}cc, ${top.accentColor}44)`, border: `2px solid ${top.accentColor}55` }}>
                                {top.initials}
                            </div>
                            <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 ring-2 ring-[#0a0a0a]">
                                <Crown className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-white/30">{t('hof.team_label')}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="hof-heading mb-1 text-3xl font-black text-white/95">{top.name}</h3>
                        <div className="mb-2 text-[13px] text-white/40">{top.university} · {isAr ? top.specializationAr : top.specializationEn}</div>
                        <div className="mb-4 flex flex-wrap gap-3 text-[12px] text-white/35">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{top.members} {t('hof.metrics.members').toLowerCase()}</span>
                            <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{top.projects} {t('hof.metrics.projects').toLowerCase()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: Eye,       labelKey: 'hof.total_views',  value: top.totalViews.toLocaleString() },
                                { icon: Star,      labelKey: 'hof.total_stars',  value: top.totalStars.toLocaleString() },
                                { icon: Trophy,    labelKey: 'hof.awards_won',   value: top.totalAwards },
                                { icon: TrendingUp,labelKey: 'hof.hof_score',    value: top.score.toLocaleString() },
                            ].map(({ icon: Icon, labelKey, value }) => (
                                <div key={labelKey} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-white/30" />
                                    <div className="text-[14px] font-black text-white/85">{value}</div>
                                    <div className="text-[10px] text-white/30">{t(labelKey)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {rest.map(team => (
                    <div key={team.id} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white"
                                style={{ background: `linear-gradient(135deg, ${team.accentColor}bb, ${team.accentColor}44)`, border: `1.5px solid ${team.accentColor}44` }}>
                                {team.initials}
                            </div>
                            <RankOrnament rank={team.rank} />
                        </div>
                        <div className="mb-1 text-[14px] font-black text-white/90">{team.name}</div>
                        <div className="mb-3 text-[11px] text-white/30">{team.university}</div>
                        <div className="mb-3 text-[11px] leading-relaxed text-white/35">{isAr ? team.specializationAr : team.specializationEn}</div>
                        <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                            {[
                                { labelKey: 'hof.metrics.members',  value: team.members },
                                { labelKey: 'hof.metrics.projects', value: team.projects },
                                { labelKey: 'hof.metrics.awards',   value: team.totalAwards },
                            ].map(({ labelKey, value }) => (
                                <div key={labelKey} className="text-center">
                                    <div className="text-[13px] font-black text-white/80">{value}</div>
                                    <div className="text-[9px] text-white/25">{t(labelKey)}</div>
                                </div>
                            ))}
                        </div>
                        <ScoreBar score={team.score} color={team.accentColor} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Award rank → tier mapping ────────────────────────────────────────────────

const RANK_TO_TIER: Record<string, 'gold' | 'silver' | 'bronze' | 'special'> = {
    first:             'gold',
    second:            'silver',
    third:             'bronze',
    honorable_mention: 'special',
    finalist:          'special',
    special:           'special',
};

const RANK_ICON_MAP: Record<string, React.ElementType> = {
    first:             Crown,
    second:            Medal,
    third:             Award,
    honorable_mention: Star,
    finalist:          Star,
    special:           Sparkles,
};

const RANK_COLOR_MAP: Record<string, string> = {
    first:             '#f59e0b',
    second:            '#94a3b8',
    third:             '#cd7c30',
    honorable_mention: '#3b82f6',
    finalist:          '#a855f7',
    special:           '#ec4899',
};

// ─── TOP AWARDS ─────────────────────────────────────────────────────────────────

function AwardsSection({ awards }: { awards: HofAward[] }) {
    const { t, locale } = useI18n();
    const isAr = locale === 'ar';

    return (
        <div className="mb-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards.map(aw => {
                    // Support both real DB shape and mock shape
                    const rankKey  = (aw.rank ?? (aw.tier === 'gold' ? 'first' : aw.tier === 'silver' ? 'second' : aw.tier === 'bronze' ? 'third' : 'special')) ?? 'special';
                    const tier     = aw.tier ?? RANK_TO_TIER[rankKey] ?? 'special';
                    const ts       = TIER_STYLES[tier];
                    const Icon     = aw.icon ?? RANK_ICON_MAP[rankKey] ?? Award;
                    const color    = aw.accentColor ?? RANK_COLOR_MAP[rankKey] ?? '#6366f1';
                    const titleStr = isAr ? (aw.title_ar ?? aw.titleAr ?? aw.title ?? '') : (aw.title ?? aw.titleEn ?? '');
                    const recipient = aw.recipient ?? aw.project_title ?? '—';
                    const subLabel  = aw.competition_name ?? aw.university ?? '';
                    const year      = aw.academic_year ?? aw.year ?? '';
                    const desc      = isAr
                        ? (aw.competition_name_ar ?? aw.descriptionAr ?? '')
                        : (aw.competition_name ?? aw.descriptionEn ?? '');
                    const verified  = aw.is_verified;

                    return (
                        <div key={aw.id} className={`group relative overflow-hidden rounded-2xl border bg-linear-to-br p-6 transition-all duration-200 hover:-translate-y-0.5 ${ts.border} ${ts.bg}`}>
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg" style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}>
                                    <Icon className="h-6 w-6" style={{ color }} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {verified === true && (
                                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">✓</span>
                                    )}
                                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${ts.labelColor}`}>{t(ts.labelKey)}</span>
                                </div>
                            </div>
                            <h3 className="hof-heading mb-2 text-[16px] font-black leading-tight text-white/90">{titleStr}</h3>
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ background: color }}>
                                    {recipient.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-[12px] font-bold text-white/75">{recipient}</span>
                                    {subLabel && <span className="ms-1.5 text-[10px] text-white/30">· {subLabel}</span>}
                                </div>
                            </div>
                            {desc && <p className="mb-3 text-[12px] leading-relaxed text-white/40">{desc}</p>}
                            {year && <div className="text-right text-[11px] text-white/25">{year}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Ranking Formula ────────────────────────────────────────────────────────────

function RankingFormula() {
    const { t } = useI18n();
    return (
        <div className="mb-16 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] px-6 py-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-bold text-white/70">{t('hof.ranking_formula')}</span>
                    <span className="ms-auto text-[11px] text-white/25">{t('hof.weighted_score')}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-4">
                {SCORE_FACTORS.map(({ labelKey, icon: Icon, weight, color }) => (
                    <div key={labelKey} className="flex flex-col items-center gap-2 bg-[#0a0a0a] p-5">
                        <Icon className={`h-6 w-6 ${color}`} />
                        <div className="hof-heading text-2xl font-black text-white/90">{weight}</div>
                        <div className="text-[11px] text-white/35">{t(labelKey)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Hero ───────────────────────────────────────────────────────────────────────

function Hero({ stats }: { stats?: HofStats }) {
    const { t } = useI18n();
    const year = new Date().getFullYear();
    const statItems = stats ? [
        { value: stats.projects_judged.toLocaleString(),   labelKey: 'hof.projects_judged' },
        { value: stats.students_competed.toLocaleString(), labelKey: 'hof.students_competed' },
        { value: stats.total_awards.toLocaleString(),      labelKey: 'hof.award_categories' },
        { value: stats.competitions_held.toLocaleString(), labelKey: 'stats.competitions' },
    ] : [
        { value: '2,400+', labelKey: 'hof.projects_judged' },
        { value: '1,800+', labelKey: 'hof.students_competed' },
        { value: '48',     labelKey: 'stats.universities' },
        { value: '12',     labelKey: 'hof.award_categories' },
    ];
    return (
        <section className="relative overflow-hidden pb-16 pt-20 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-500/8 blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />
            <div className="relative mx-auto max-w-3xl px-6">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[12px] font-bold text-amber-300">{t('hof.class_of', { year: String(year) })}</span>
                </div>
                <h1 className="hof-heading mb-4 text-5xl font-black tracking-tight text-white md:text-7xl">
                    {t('hof.page_title').split(' ')[0]}{' '}
                    <span className="bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl">
                        {t('hof.page_title').split(' ').slice(1).join(' ')}
                    </span>
                </h1>
                <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-white/45">{t('hof.description')}</p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                    {statItems.map(({ value, labelKey }) => (
                        <div key={labelKey}>
                            <div className="hof-heading text-2xl font-black text-white/90">{value}</div>
                            <div className="text-[11px] text-white/30">{t(labelKey)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Tab Navigation ─────────────────────────────────────────────────────────────

type TabId = 'projects' | 'students' | 'teams' | 'awards';

// ─── Main Page ──────────────────────────────────────────────────────────────────

interface HallOfFameProps {
    auth: { user: { name: string; email: string } | null };
    topProjects?: HofProject[];
    topStudents?: HofStudent[];
    hofAwards?:   HofAward[];
    hofStats?:    HofStats;
    seo?:         SeoMeta;
}

export default function HallOfFame({ auth, topProjects, topStudents, hofAwards, hofStats, seo }: HallOfFameProps) {
    const { t, dir } = useI18n();
    const [activeTab, setActiveTab] = useState<TabId>('projects');
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [activeTab]);

    const displayProjects = (topProjects && topProjects.length > 0) ? topProjects : HOF_PROJECTS;
    const displayStudents = (topStudents && topStudents.length > 0) ? topStudents : HOF_STUDENTS;
    const displayAwards   = (hofAwards   && hofAwards.length   > 0) ? hofAwards   : HOF_AWARDS;

    const TABS: { id: TabId; labelKey: string; icon: React.ElementType; count: number }[] = [
        { id: 'projects', labelKey: 'hof.tabs.projects', icon: Code2,         count: displayProjects.length },
        { id: 'students', labelKey: 'hof.tabs.students', icon: GraduationCap, count: displayStudents.length },
        { id: 'teams',    labelKey: 'hof.tabs.teams',    icon: Users,         count: HOF_TEAMS.length },
        { id: 'awards',   labelKey: 'hof.tabs.awards',   icon: Trophy,        count: displayAwards.length },
    ];

    return (
        <>
            {seo
                ? <SEOHead seo={seo} />
                : <SEOHead seo={{ title: `${t('hof.page_title')} — AiKFS` }} />
            }
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap');
                .hof-heading { font-family: 'Bodoni Moda', Georgia, serif; }
                html { scroll-behavior: smooth; }
            `}</style>

            <div className="min-h-dvh" dir={dir} style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

                {/* Top Bar */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px) saturate(180%)' }}>
                    <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-6">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            <span className="hidden text-sm font-black sm:block">Ai<span className="text-violet-400">KFS</span></span>
                        </Link>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-300">{t('hof.page_title')}</span>
                        </div>
                        <div className="ms-auto flex items-center gap-3">
                            <LanguageSwitcher variant="minimal" />
                            {auth.user ? (
                                <Link href="/dashboard" className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90">
                                    {t('nav.dashboard')} <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <Link href="/login" className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-violet-500">
                                    {t('nav.sign_in')}
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <Hero stats={hofStats} />

                <div className="mx-auto max-w-[1200px] px-6">
                    <RankingFormula />
                </div>

                {/* Tabs */}
                <div ref={tabsRef} className="sticky top-14 z-30 border-b border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)' }}>
                    <div className="mx-auto max-w-[1200px] px-6">
                        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-pressed={isActive}
                                        className={['flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-5 py-4 text-[13px] font-semibold transition-all duration-150', isActive ? 'border-amber-400 text-white/90' : 'border-transparent text-white/35 hover:text-white/60'].join(' ')}>
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : ''}`} />
                                        {t(tab.labelKey)}
                                        <span className={['flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black', isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.05] text-white/25'].join(' ')}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <main className="mx-auto max-w-[1200px] px-6 py-12">
                    {activeTab === 'projects' && (
                        <>
                            <SectionHeader icon={Code2} title={t('hof.tabs.projects')} subtitle={t('hof.sections.projects_subtitle')} color="bg-linear-to-br from-violet-500 to-purple-700" />
                            <ProjectPodium projects={displayProjects as HofProject[]} />
                        </>
                    )}
                    {activeTab === 'students' && (
                        <>
                            <SectionHeader icon={GraduationCap} title={t('hof.tabs.students')} subtitle={t('hof.sections.students_subtitle')} color="bg-linear-to-br from-amber-500 to-orange-600" />
                            <StudentPodium students={displayStudents as HofStudent[]} />
                        </>
                    )}
                    {activeTab === 'teams' && (
                        <>
                            <SectionHeader icon={Users} title={t('hof.tabs.teams')} subtitle={t('hof.sections.teams_subtitle')} color="bg-linear-to-br from-blue-500 to-cyan-600" />
                            <TeamsSection teams={HOF_TEAMS} />
                        </>
                    )}
                    {activeTab === 'awards' && (
                        <>
                            <SectionHeader icon={Trophy} title={t('hof.tabs.awards')} subtitle={t('hof.sections.awards_subtitle')} color="bg-linear-to-br from-emerald-500 to-teal-600" />
                            <AwardsSection awards={displayAwards as HofAward[]} />
                        </>
                    )}

                    {/* CTA */}
                    <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/[0.07] p-10 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(245,158,11,0.05) 100%)' }}>
                        <Trophy className="mx-auto mb-4 h-10 w-10 text-amber-400/70" />
                        <h2 className="hof-heading mb-3 text-3xl font-black text-white/90">{t('hof.cta.title')}</h2>
                        <p className="mx-auto mb-8 max-w-md text-[14px] leading-relaxed text-white/40">{t('hof.cta.description')}</p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link href={auth.user ? '/student/projects/create' : '/register'}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500">
                                <Sparkles className="h-4 w-4" />
                                {auth.user ? t('hof.cta.submit_project') : t('hof.cta.join')}
                            </Link>
                            <Link href="/projects"
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-[14px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90">
                                {t('hof.cta.browse')} <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </main>

                <footer className="mt-12 border-t border-white/[0.05] py-8 text-center">
                    <p className="text-[12px] text-white/20">{t('footer.copyright', { year: String(new Date().getFullYear()) })}</p>
                </footer>
            </div>
        </>
    );
}
