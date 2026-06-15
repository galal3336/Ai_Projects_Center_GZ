import { Head, Link } from '@inertiajs/react';
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
    Globe,
    BookOpen,
    Shield,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HofProject {
    id: number;
    title: string;
    category: string;
    team: string;
    university: string;
    views: number;
    stars: number;
    awards: number;
    quality: number; // 0–100
    score: number;
    description: string;
    tags: string[];
    accentColor: string;
    rank: number;
    year: number;
}

interface HofStudent {
    id: number;
    name: string;
    initials: string;
    university: string;
    department: string;
    totalPoints: number;
    projects: number;
    awards: number;
    stars: number;
    views: number;
    rank: number;
    accentColor: string;
    graduationYear: number;
    topSkills: string[];
    bio: string;
}

interface HofTeam {
    id: number;
    name: string;
    university: string;
    members: number;
    projects: number;
    totalStars: number;
    totalAwards: number;
    totalViews: number;
    score: number;
    rank: number;
    accentColor: string;
    initials: string;
    specialization: string;
}

interface HofAward {
    id: number;
    title: string;
    recipient: string;
    recipientType: 'student' | 'team' | 'project';
    university: string;
    year: number;
    description: string;
    icon: React.ElementType;
    tier: 'gold' | 'silver' | 'bronze' | 'special';
    accentColor: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const HOF_PROJECTS: HofProject[] = [
    {
        id: 1, rank: 1, title: 'NeuroVision: Medical Imaging AI', category: 'Computer Vision',
        team: 'AlphaMinds', university: 'KFUPM', views: 28_470, stars: 1_842, awards: 4,
        quality: 98, score: 9840, year: 2025,
        description: 'Transformer-based early tumor detection achieving 97.3% accuracy—outperforming radiologists in controlled clinical trials.',
        tags: ['PyTorch', 'Transformers', 'Medical AI', 'Computer Vision'],
        accentColor: '#f59e0b',
    },
    {
        id: 2, rank: 2, title: 'ArabicNLU: SOTA Arabic Language Model', category: 'NLP',
        team: 'LinguaForge', university: 'KAU', views: 41_200, stars: 2_310, awards: 3,
        quality: 96, score: 8720, year: 2025,
        description: 'Fine-tuned LLaMA-3 on 40B Arabic tokens, setting new state-of-the-art benchmarks across 12 Arabic NLU tasks.',
        tags: ['LLMs', 'HuggingFace', 'Arabic NLP', 'CUDA'],
        accentColor: '#8b5cf6',
    },
    {
        id: 3, rank: 3, title: 'ClimateNet: Climate Prediction via GNNs', category: 'Machine Learning',
        team: 'GeoAI Lab', university: 'KAUST', views: 19_830, stars: 1_120, awards: 2,
        quality: 94, score: 7950, year: 2025,
        description: 'Graph neural networks processing 30 years of satellite data for regional climate anomaly forecasting.',
        tags: ['GNN', 'Spark', 'AWS', 'Climate Tech'],
        accentColor: '#10b981',
    },
    {
        id: 4, rank: 4, title: 'DuneBot: Autonomous Sand Navigation', category: 'Robotics & AI',
        team: 'RoboKFUPM', university: 'KFUPM', views: 12_450, stars: 876, awards: 2,
        quality: 91, score: 6430, year: 2024,
        description: 'RL-based autonomous agent for sand dune traversal with zero prior mapping, validated in live desert conditions.',
        tags: ['RL', 'ROS', 'OpenCV', 'Embedded AI'],
        accentColor: '#ec4899',
    },
    {
        id: 5, rank: 5, title: 'SignBridge: Real-Time Sign Language', category: 'Computer Vision',
        team: 'AccessAI', university: 'KSU', views: 9_870, stars: 743, awards: 1,
        quality: 89, score: 5870, year: 2025,
        description: '94% accurate ASL-to-text live translation system enabling real-time communication for the deaf community.',
        tags: ['TensorFlow', 'OpenCV', 'FastAPI', 'GCP'],
        accentColor: '#3b82f6',
    },
];

const HOF_STUDENTS: HofStudent[] = [
    {
        id: 1, rank: 1, name: 'Sara Al-Rashid', initials: 'SA', university: 'KFUPM',
        department: 'Computer Science', totalPoints: 9840, projects: 7, awards: 4,
        stars: 1842, views: 28470, accentColor: '#f59e0b', graduationYear: 2025,
        topSkills: ['Computer Vision', 'Deep Learning', 'Research'],
        bio: 'Published in Nature Digital Medicine. First-ever AI student to win 4 consecutive national awards.',
    },
    {
        id: 2, rank: 2, name: 'Omar Khalil', initials: 'OK', university: 'KAU',
        department: 'AI & Data Science', totalPoints: 8720, projects: 5, awards: 3,
        stars: 2310, views: 41200, accentColor: '#8b5cf6', graduationYear: 2025,
        topSkills: ['NLP', 'LLMs', 'Open Source'],
        bio: 'Most-viewed student profile on the platform. Arabic NLP pioneer with 40B token dataset.',
    },
    {
        id: 3, rank: 3, name: 'Nour Hassan', initials: 'NH', university: 'KAUST',
        department: 'Computer Science', totalPoints: 7950, projects: 9, awards: 2,
        stars: 1120, views: 19830, accentColor: '#10b981', graduationYear: 2024,
        topSkills: ['Machine Learning', 'Data Science', 'Climate AI'],
        bio: 'Highest project count in the cohort. Climate AI researcher with satellite data expertise.',
    },
    {
        id: 4, rank: 4, name: 'Lina Karimi', initials: 'LK', university: 'KAUST',
        department: 'AI Security', totalPoints: 4980, projects: 4, awards: 2,
        stars: 934, views: 14560, accentColor: '#ec4899', graduationYear: 2027,
        topSkills: ['AI Security', 'Federated Learning', 'Privacy ML'],
        bio: 'Rising star in privacy-preserving AI. Youngest featured researcher in AiKFS history.',
    },
    {
        id: 5, rank: 5, name: 'Khalid Mohammed', initials: 'KM', university: 'KFUPM',
        department: 'Robotics', totalPoints: 6430, projects: 6, awards: 2,
        stars: 876, views: 12450, accentColor: '#6366f1', graduationYear: 2026,
        topSkills: ['Reinforcement Learning', 'Robotics', 'RL'],
        bio: 'Pioneering autonomous navigation in extreme environments. Three robotics patents filed.',
    },
];

const HOF_TEAMS: HofTeam[] = [
    {
        id: 1, rank: 1, name: 'AlphaMinds', university: 'KFUPM', members: 4,
        projects: 7, totalStars: 2840, totalAwards: 6, totalViews: 48_300,
        score: 9600, accentColor: '#f59e0b', initials: 'AM', specialization: 'Medical AI & Computer Vision',
    },
    {
        id: 2, rank: 2, name: 'LinguaForge', university: 'KAU', members: 3,
        projects: 5, totalStars: 3120, totalAwards: 4, totalViews: 62_500,
        score: 8800, accentColor: '#8b5cf6', initials: 'LF', specialization: 'Arabic NLP & Generative AI',
    },
    {
        id: 3, rank: 3, name: 'GeoAI Lab', university: 'KAUST', members: 5,
        projects: 9, totalStars: 1940, totalAwards: 3, totalViews: 31_200,
        score: 7800, accentColor: '#10b981', initials: 'GL', specialization: 'Climate AI & GNNs',
    },
    {
        id: 4, rank: 4, name: 'RoboKFUPM', university: 'KFUPM', members: 6,
        projects: 6, totalStars: 1320, totalAwards: 3, totalViews: 22_100,
        score: 6200, accentColor: '#ec4899', initials: 'RK', specialization: 'Robotics & Embedded AI',
    },
    {
        id: 5, rank: 5, name: 'AccessAI', university: 'KSU', members: 4,
        projects: 4, totalStars: 1090, totalAwards: 2, totalViews: 17_800,
        score: 5400, accentColor: '#3b82f6', initials: 'AA', specialization: 'Accessibility AI & CV',
    },
    {
        id: 6, rank: 6, name: 'NeuralCraft', university: 'KAU', members: 3,
        projects: 5, totalStars: 870, totalAwards: 2, totalViews: 14_300,
        score: 4800, accentColor: '#14b8a6', initials: 'NC', specialization: 'Deep Learning Research',
    },
];

const HOF_AWARDS: HofAward[] = [
    {
        id: 1, title: '1st Place — National AI Championship', recipient: 'Sara Al-Rashid',
        recipientType: 'student', university: 'KFUPM', year: 2025,
        description: 'Awarded for NeuroVision: the highest-scoring project in competition history with a 98/100 quality score.',
        icon: Crown, tier: 'gold', accentColor: '#f59e0b',
    },
    {
        id: 2, title: 'Most Impactful Project', recipient: 'LinguaForge',
        recipientType: 'team', university: 'KAU', year: 2025,
        description: 'ArabicNLU became the most-starred student project on the platform, cited in 14 research papers.',
        icon: Flame, tier: 'gold', accentColor: '#f97316',
    },
    {
        id: 3, title: 'Best Research Innovation', recipient: 'Omar Khalil',
        recipientType: 'student', university: 'KAU', year: 2025,
        description: 'Recognized for breakthrough fine-tuning methodology adopted by three regional universities.',
        icon: Sparkles, tier: 'silver', accentColor: '#94a3b8',
    },
    {
        id: 4, title: 'Industry Choice Award', recipient: 'AlphaMinds',
        recipientType: 'team', university: 'KFUPM', year: 2025,
        description: 'Selected by a panel of 20 industry leaders as the project with the highest commercialization potential.',
        icon: Trophy, tier: 'silver', accentColor: '#94a3b8',
    },
    {
        id: 5, title: 'Rising Star Award', recipient: 'Lina Karimi',
        recipientType: 'student', university: 'KAUST', year: 2025,
        description: 'Youngest featured researcher recognized for pioneering work in privacy-preserving federated learning.',
        icon: Star, tier: 'special', accentColor: '#ec4899',
    },
    {
        id: 6, title: '3rd Place — National AI Championship', recipient: 'GeoAI Lab',
        recipientType: 'team', university: 'KAUST', year: 2025,
        description: 'ClimateNet awarded for most novel application of AI to a global humanitarian challenge.',
        icon: Award, tier: 'bronze', accentColor: '#cd7c30',
    },
];

// ─── Score badge weight display ─────────────────────────────────────────────────

const SCORE_FACTORS = [
    { label: 'Views', icon: Eye, weight: '25%', color: 'text-blue-400' },
    { label: 'Stars', icon: Star, weight: '30%', color: 'text-amber-400' },
    { label: 'Awards', icon: Trophy, weight: '30%', color: 'text-violet-400' },
    { label: 'Quality', icon: Zap, weight: '15%', color: 'text-emerald-400' },
];

// ─── Rank Ornament ──────────────────────────────────────────────────────────────

function RankOrnament({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
            <Crown className="h-4 w-4 text-white" />
        </div>
    );
    if (rank === 2) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-400/20">
            <Medal className="h-4 w-4 text-white" />
        </div>
    );
    if (rank === 3) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg shadow-orange-500/20">
            <Award className="h-4 w-4 text-white" />
        </div>
    );
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <span className="font-mono text-[11px] font-black text-white/35">#{rank}</span>
        </div>
    );
}

// ─── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({
    icon: Icon, title, subtitle, color,
}: { icon: React.ElementType; title: string; subtitle: string; color: string }) {
    return (
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h2 className="hof-heading text-3xl font-black text-white/95 md:text-4xl">{title}</h2>
            <p className="max-w-xl text-[14px] leading-relaxed text-white/40">{subtitle}</p>
            <div className="mt-1 h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
    );
}

// ─── Score Bar ──────────────────────────────────────────────────────────────────

function ScoreBar({ score, max = 10000, color }: { score: number; max?: number; color: string }) {
    const pct = Math.round((score / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span className="w-12 text-right font-mono text-[11px] font-bold text-white/40">{score.toLocaleString()}</span>
        </div>
    );
}

// ─── TOP PROJECTS ───────────────────────────────────────────────────────────────

function ProjectPodium({ projects }: { projects: HofProject[] }) {
    const top3 = projects.slice(0, 3);

    return (
        <div className="mb-12">
            {/* Gold card — full-width hero */}
            <div className="mb-4 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-8 shadow-2xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    {/* Rank + avatar */}
                    <div className="flex shrink-0 flex-col items-center gap-3">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-2xl"
                                style={{ background: `linear-gradient(135deg, ${top3[0].accentColor}cc, ${top3[0].accentColor}44)`, border: `2px solid ${top3[0].accentColor}55` }}>
                                {top3[0].category.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40 ring-2 ring-[#0a0a0a]">
                                <Crown className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
                            <Crown className="h-3 w-3 text-amber-400" />
                            <span className="text-[11px] font-black text-amber-300">GOLD</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-amber-500/20 bg-amber-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-amber-400">{top3[0].category}</span>
                            <span className="text-[11px] text-white/25">{top3[0].year}</span>
                        </div>
                        <h3 className="hof-heading mb-2 text-2xl font-black text-white/95 md:text-3xl">{top3[0].title}</h3>
                        <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-white/50">{top3[0].description}</p>
                        <div className="mb-5 flex flex-wrap gap-1.5">
                            {top3[0].tags.map(t => (
                                <span key={t} className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/45">{t}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: Eye, label: 'Views', value: top3[0].views.toLocaleString() },
                                { icon: Star, label: 'Stars', value: top3[0].stars.toLocaleString() },
                                { icon: Trophy, label: 'Awards', value: top3[0].awards },
                                { icon: Zap, label: 'Quality', value: `${top3[0].quality}/100` },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-white/30" />
                                    <div className="text-base font-black text-white/85">{value}</div>
                                    <div className="text-[10px] text-white/30">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-center lg:text-right">
                        <div className="hof-heading text-5xl font-black" style={{ color: top3[0].accentColor }}>
                            {top3[0].score.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-white/30">HOF Score</div>
                        <div className="mt-2 text-[12px] text-white/40">{top3[0].university}</div>
                        <div className="text-[11px] text-white/25">{top3[0].team}</div>
                    </div>
                </div>
            </div>

            {/* Silver + Bronze row */}
            <div className="grid gap-4 md:grid-cols-2">
                {top3.slice(1).map(p => (
                    <div key={p.id}
                        className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                                    style={{ background: `linear-gradient(135deg, ${p.accentColor}bb, ${p.accentColor}44)`, border: `1.5px solid ${p.accentColor}44` }}>
                                    {p.category.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[11px] text-white/30">{p.category}</div>
                                    <h3 className="hof-heading text-[16px] font-black text-white/90 leading-tight">{p.title}</h3>
                                </div>
                            </div>
                            <RankOrnament rank={p.rank} />
                        </div>
                        <p className="mb-4 line-clamp-2 text-[12px] leading-relaxed text-white/40">{p.description}</p>
                        <div className="mb-3 flex gap-2 text-[12px] text-white/35">
                            <Eye className="h-3.5 w-3.5" /> {p.views.toLocaleString()}
                            <Star className="ml-2 h-3.5 w-3.5 text-amber-400/70" /> {p.stars.toLocaleString()}
                            <Trophy className="ml-2 h-3.5 w-3.5 text-violet-400/70" /> {p.awards}
                        </div>
                        <ScoreBar score={p.score} color={p.accentColor} />
                        <div className="mt-3 text-[11px] text-white/25">{p.university} · {p.team}</div>
                    </div>
                ))}
            </div>

            {/* Ranks 4–5 list */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                {projects.slice(3).map((p, i) => (
                    <div key={p.id}
                        className="flex items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]">
                        <RankOrnament rank={p.rank} />
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${p.accentColor}aa, ${p.accentColor}33)` }}>
                            {p.category.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-bold text-white/80">{p.title}</div>
                            <div className="text-[11px] text-white/30">{p.university} · {p.category}</div>
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

function StudentPodium({ students }: { students: HofStudent[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="mb-12">
            {/* Podium visual — top 3 */}
            <div className="mb-8 flex items-end justify-center gap-4">
                {[1, 0, 2].map((idx) => {
                    const s = students[idx];
                    const isGold = idx === 0;
                    const heights = ['h-36', 'h-48', 'h-28'];
                    const podiumH = heights[idx];
                    const glows = [
                        'shadow-slate-400/20',
                        'shadow-amber-500/30',
                        'shadow-orange-500/20',
                    ];
                    const podiumGrad = [
                        'from-slate-500/20 to-slate-700/10 border-slate-500/25',
                        'from-amber-500/25 to-amber-700/10 border-amber-500/30',
                        'from-orange-600/20 to-orange-800/10 border-orange-600/25',
                    ];

                    return (
                        <div key={s.id}
                            className="flex flex-col items-center gap-3"
                            onMouseEnter={() => setHovered(s.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Crown for gold */}
                            {isGold && <Crown className="h-5 w-5 text-amber-400 drop-shadow-lg" />}

                            {/* Avatar */}
                            <div className="relative cursor-default transition-transform duration-200"
                                style={{ transform: hovered === s.id ? 'translateY(-4px)' : 'none' }}>
                                <div
                                    className={`flex items-center justify-center rounded-2xl font-black text-white shadow-2xl ${glows[idx]} ${isGold ? 'h-16 w-16 text-lg' : 'h-13 w-13 text-base'}`}
                                    style={{
                                        width: isGold ? 64 : 52,
                                        height: isGold ? 64 : 52,
                                        background: `linear-gradient(135deg, ${s.accentColor}cc, ${s.accentColor}55)`,
                                        border: `2px solid ${s.accentColor}55`,
                                    }}
                                >
                                    {s.initials}
                                </div>
                            </div>

                            {/* Name + score */}
                            <div className="text-center">
                                <div className={`font-black text-white/90 ${isGold ? 'text-[14px]' : 'text-[12px]'}`}>{s.name.split(' ')[0]}</div>
                                <div className="font-mono text-[11px] font-bold" style={{ color: s.accentColor }}>{s.totalPoints.toLocaleString()}</div>
                                <div className="text-[10px] text-white/25">{s.university}</div>
                            </div>

                            {/* Podium block */}
                            <div className={`w-28 rounded-t-2xl border bg-gradient-to-b ${podiumGrad[idx]} ${podiumH} flex items-center justify-center`}>
                                <RankOrnament rank={s.rank} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cards for all 5 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {students.map(s => (
                    <div key={s.id}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5">
                        {/* Glow accent */}
                        <div className="pointer-events-none absolute -top-8 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full blur-2xl opacity-20"
                            style={{ background: s.accentColor }} />

                        <div className="relative mb-4 flex items-start justify-between gap-2">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black text-white shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${s.accentColor}cc, ${s.accentColor}44)`, border: `1.5px solid ${s.accentColor}44` }}>
                                {s.initials}
                            </div>
                            <RankOrnament rank={s.rank} />
                        </div>

                        <div className="relative mb-1 text-[14px] font-black text-white/90">{s.name}</div>
                        <div className="mb-3 text-[11px] text-white/30">{s.university} · {s.department}</div>
                        <p className="mb-4 line-clamp-2 text-[11px] leading-relaxed text-white/40">{s.bio}</p>

                        <div className="mb-3 flex flex-wrap gap-1">
                            {s.topSkills.slice(0, 2).map(sk => (
                                <span key={sk} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-white/45">{sk}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                            {[
                                { label: 'Pts', value: s.totalPoints.toLocaleString() },
                                { label: 'Awards', value: s.awards },
                                { label: 'Stars', value: s.stars.toLocaleString() },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center">
                                    <div className="text-[12px] font-black text-white/80">{value}</div>
                                    <div className="text-[9px] text-white/25">{label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3">
                            <ScoreBar score={s.totalPoints} color={s.accentColor} />
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/25">
                            <GraduationCap className="h-3 w-3 text-violet-400/50" />
                            Class of {s.graduationYear}
                            <span className="ml-auto flex items-center gap-0.5">
                                <Eye className="h-3 w-3" />{s.views.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── TOP TEAMS ──────────────────────────────────────────────────────────────────

function TeamsSection({ teams }: { teams: HofTeam[] }) {
    const top = teams[0];
    const rest = teams.slice(1);

    return (
        <div className="mb-12">
            {/* Champion team hero card */}
            <div className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] p-8"
                style={{ background: `linear-gradient(135deg, ${top.accentColor}10 0%, transparent 60%), rgba(255,255,255,0.015)` }}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    {/* Team avatar */}
                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-2xl"
                                style={{ background: `linear-gradient(135deg, ${top.accentColor}cc, ${top.accentColor}44)`, border: `2px solid ${top.accentColor}55` }}>
                                {top.initials}
                            </div>
                            <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 ring-2 ring-[#0a0a0a]">
                                <Crown className="h-3.5 w-3.5 text-white" />
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-white/30">#1 Team</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h3 className="hof-heading mb-1 text-3xl font-black text-white/95">{top.name}</h3>
                        <div className="mb-2 text-[13px] text-white/40">{top.university} · {top.specialization}</div>
                        <div className="mb-4 flex flex-wrap gap-3 text-[12px] text-white/35">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{top.members} members</span>
                            <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" />{top.projects} projects</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: Eye, label: 'Total Views', value: top.totalViews.toLocaleString() },
                                { icon: Star, label: 'Total Stars', value: top.totalStars.toLocaleString() },
                                { icon: Trophy, label: 'Awards Won', value: top.totalAwards },
                                { icon: TrendingUp, label: 'HOF Score', value: top.score.toLocaleString() },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-white/30" />
                                    <div className="text-[14px] font-black text-white/85">{value}</div>
                                    <div className="text-[10px] text-white/30">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of teams grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {rest.map(team => (
                    <div key={team.id}
                        className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white"
                                style={{ background: `linear-gradient(135deg, ${team.accentColor}bb, ${team.accentColor}44)`, border: `1.5px solid ${team.accentColor}44` }}>
                                {team.initials}
                            </div>
                            <RankOrnament rank={team.rank} />
                        </div>
                        <div className="mb-1 text-[14px] font-black text-white/90">{team.name}</div>
                        <div className="mb-3 text-[11px] text-white/30">{team.university}</div>
                        <div className="mb-3 text-[11px] leading-relaxed text-white/35">{team.specialization}</div>

                        <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                            {[
                                { label: 'Members', value: team.members },
                                { label: 'Projects', value: team.projects },
                                { label: 'Awards', value: team.totalAwards },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center">
                                    <div className="text-[13px] font-black text-white/80">{value}</div>
                                    <div className="text-[9px] text-white/25">{label}</div>
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

// ─── TOP AWARDS ─────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<HofAward['tier'], { border: string; bg: string; label: string; labelColor: string }> = {
    gold: {
        border: 'border-amber-500/25',
        bg: 'from-amber-500/[0.07] to-transparent',
        label: 'GOLD',
        labelColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    silver: {
        border: 'border-slate-400/20',
        bg: 'from-slate-400/[0.06] to-transparent',
        label: 'SILVER',
        labelColor: 'text-slate-300 border-slate-400/30 bg-slate-400/10',
    },
    bronze: {
        border: 'border-orange-600/20',
        bg: 'from-orange-700/[0.06] to-transparent',
        label: 'BRONZE',
        labelColor: 'text-orange-400 border-orange-600/30 bg-orange-700/10',
    },
    special: {
        border: 'border-pink-500/20',
        bg: 'from-pink-500/[0.06] to-transparent',
        label: 'SPECIAL',
        labelColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    },
};

function AwardsSection({ awards }: { awards: HofAward[] }) {
    return (
        <div className="mb-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards.map(aw => {
                    const t = TIER_STYLES[aw.tier];
                    const Icon = aw.icon;
                    return (
                        <div key={aw.id}
                            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-200 hover:-translate-y-0.5 ${t.border} ${t.bg}`}>
                            {/* Icon + tier */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                                    style={{ background: `${aw.accentColor}22`, border: `1.5px solid ${aw.accentColor}44` }}>
                                    <Icon className="h-6 w-6" style={{ color: aw.accentColor }} />
                                </div>
                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${t.labelColor}`}>
                                    {t.label}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="hof-heading mb-2 text-[16px] font-black leading-tight text-white/90">{aw.title}</h3>

                            {/* Recipient */}
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                                    style={{ background: aw.accentColor }}>
                                    {aw.recipient.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <span className="text-[12px] font-bold text-white/75">{aw.recipient}</span>
                                    <span className="ml-1.5 text-[10px] text-white/30">· {aw.university}</span>
                                </div>
                            </div>

                            <p className="mb-4 text-[12px] leading-relaxed text-white/40">{aw.description}</p>

                            <div className="flex items-center justify-between">
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                    aw.recipientType === 'student'
                                        ? 'border-violet-500/25 bg-violet-500/10 text-violet-300'
                                        : aw.recipientType === 'team'
                                        ? 'border-blue-500/25 bg-blue-500/10 text-blue-300'
                                        : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                                }`}>
                                    {aw.recipientType.charAt(0).toUpperCase() + aw.recipientType.slice(1)}
                                </span>
                                <span className="text-[11px] text-white/25">{aw.year}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Ranking Formula Banner ─────────────────────────────────────────────────────

function RankingFormula() {
    return (
        <div className="mb-16 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] px-6 py-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-bold text-white/70">HOF Ranking Formula</span>
                    <span className="ml-auto text-[11px] text-white/25">Weighted score out of 10,000</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-4">
                {SCORE_FACTORS.map(({ label, icon: Icon, weight, color }) => (
                    <div key={label} className="flex flex-col items-center gap-2 bg-[#0a0a0a] p-5">
                        <Icon className={`h-6 w-6 ${color}`} />
                        <div className="hof-heading text-2xl font-black text-white/90">{weight}</div>
                        <div className="text-[11px] text-white/35">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Hero Section ───────────────────────────────────────────────────────────────

function Hero() {
    return (
        <section className="relative overflow-hidden pb-16 pt-20 text-center">
            {/* Radial glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-500/8 blur-3xl" />
            <div className="pointer-events-none absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />

            <div className="relative mx-auto max-w-3xl px-6">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[12px] font-bold text-amber-300">AiKFS · Class of 2025</span>
                </div>

                {/* Title */}
                <h1 className="hof-heading mb-4 text-5xl font-black tracking-tight text-white md:text-7xl">
                    Hall of{' '}
                    <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl">
                        Fame
                    </span>
                </h1>

                <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-white/45">
                    The pinnacle of AI excellence. Celebrating the brightest minds, most impactful projects, and strongest teams from the Kingdom's top universities.
                </p>

                {/* Mini stats */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                    {[
                        { value: '2,400+', label: 'Projects Judged' },
                        { value: '1,800+', label: 'Students Competed' },
                        { value: '48', label: 'Universities' },
                        { value: '12', label: 'Award Categories' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <div className="hof-heading text-2xl font-black text-white/90">{value}</div>
                            <div className="text-[11px] text-white/30">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Tab Navigation ─────────────────────────────────────────────────────────────

type TabId = 'projects' | 'students' | 'teams' | 'awards';

const TABS: { id: TabId; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'projects', label: 'Top Projects', icon: Code2, count: 5 },
    { id: 'students', label: 'Top Students', icon: GraduationCap, count: 5 },
    { id: 'teams', label: 'Top Teams', icon: Users, count: 6 },
    { id: 'awards', label: 'Top Awards', icon: Trophy, count: 6 },
];

// ─── Main Page ──────────────────────────────────────────────────────────────────

interface HallOfFameProps {
    auth: { user: { name: string; email: string } | null };
}

export default function HallOfFame({ auth }: HallOfFameProps) {
    const [activeTab, setActiveTab] = useState<TabId>('projects');
    const tabsRef = useRef<HTMLDivElement>(null);

    // Scroll tabs into view on mobile when switching
    useEffect(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [activeTab]);

    return (
        <>
            <Head title="Hall of Fame — AiKFS" />

            {/* Google Fonts: Bodoni Moda for headings */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap');
                .hof-heading { font-family: 'Bodoni Moda', Georgia, serif; }
                html { scroll-behavior: smooth; }
            `}</style>

            <div className="min-h-dvh" style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

                {/* ── Top Bar ──────────────────────────────────────────── */}
                <header
                    className="sticky top-0 z-40 border-b border-white/[0.06]"
                    style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px) saturate(180%)' }}
                >
                    <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-6">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            <span className="hidden text-sm font-black sm:block">
                                Ai<span className="text-violet-400">KFS</span>
                            </span>
                        </Link>

                        {/* Mode badge */}
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-300">Hall of Fame</span>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            {auth.user ? (
                                <Link href="/dashboard"
                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90">
                                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <Link href="/login"
                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-violet-500">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Hero ──────────────────────────────────────────────── */}
                <Hero />

                {/* ── Ranking Formula ───────────────────────────────────── */}
                <div className="mx-auto max-w-[1200px] px-6">
                    <RankingFormula />
                </div>

                {/* ── Tab Navigation ────────────────────────────────────── */}
                <div
                    ref={tabsRef}
                    className="sticky top-14 z-30 border-b border-white/[0.06]"
                    style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)' }}
                >
                    <div className="mx-auto max-w-[1200px] px-6">
                        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        aria-pressed={isActive}
                                        className={[
                                            'flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-5 py-4 text-[13px] font-semibold transition-all duration-150',
                                            isActive
                                                ? 'border-amber-400 text-white/90'
                                                : 'border-transparent text-white/35 hover:text-white/60',
                                        ].join(' ')}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : ''}`} />
                                        {tab.label}
                                        <span className={[
                                            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black',
                                            isActive
                                                ? 'bg-amber-500/20 text-amber-300'
                                                : 'bg-white/[0.05] text-white/25',
                                        ].join(' ')}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Tab Content ───────────────────────────────────────── */}
                <main className="mx-auto max-w-[1200px] px-6 py-12">
                    {activeTab === 'projects' && (
                        <>
                            <SectionHeader
                                icon={Code2}
                                title="Top Projects"
                                subtitle="The highest-scoring AI projects ranked by views, community stars, awards earned, and assessed quality."
                                color="bg-gradient-to-br from-violet-500 to-purple-700"
                            />
                            <ProjectPodium projects={HOF_PROJECTS} />
                        </>
                    )}

                    {activeTab === 'students' && (
                        <>
                            <SectionHeader
                                icon={GraduationCap}
                                title="Top Students"
                                subtitle="Outstanding individuals who led transformative AI research and won national recognition."
                                color="bg-gradient-to-br from-amber-500 to-orange-600"
                            />
                            <StudentPodium students={HOF_STUDENTS} />
                        </>
                    )}

                    {activeTab === 'teams' && (
                        <>
                            <SectionHeader
                                icon={Users}
                                title="Top Teams"
                                subtitle="The strongest collaborative units, ranked by cumulative impact across all their submitted projects."
                                color="bg-gradient-to-br from-blue-500 to-cyan-600"
                            />
                            <TeamsSection teams={HOF_TEAMS} />
                        </>
                    )}

                    {activeTab === 'awards' && (
                        <>
                            <SectionHeader
                                icon={Trophy}
                                title="Top Awards"
                                subtitle="Prestigious recognitions spanning excellence in innovation, impact, research, and leadership."
                                color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            />
                            <AwardsSection awards={HOF_AWARDS} />
                        </>
                    )}

                    {/* ── CTA ──────────────────────────────────────────── */}
                    <div className="mt-12 overflow-hidden rounded-3xl border border-white/[0.07] p-10 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(245,158,11,0.05) 100%)' }}>
                        <div className="pointer-events-none absolute inset-0 rounded-3xl" />
                        <Trophy className="mx-auto mb-4 h-10 w-10 text-amber-400/70" />
                        <h2 className="hof-heading mb-3 text-3xl font-black text-white/90">Ready to Make History?</h2>
                        <p className="mx-auto mb-8 max-w-md text-[14px] leading-relaxed text-white/40">
                            Join the next cohort of AI innovators. Submit your project and compete for a place in the Hall of Fame.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={auth.user ? '/student/projects/create' : '/register'}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
                            >
                                <Sparkles className="h-4 w-4" />
                                {auth.user ? 'Submit a Project' : 'Join AiKFS'}
                            </Link>
                            <Link
                                href="/projects"
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-[14px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90"
                            >
                                Browse All Projects <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </main>

                {/* ── Footer ───────────────────────────────────────────── */}
                <footer className="mt-12 border-t border-white/[0.05] py-8 text-center">
                    <p className="text-[12px] text-white/20">
                        © {new Date().getFullYear()} AiKFS · Kingdom's AI Fair & Showcase
                    </p>
                </footer>
            </div>
        </>
    );
}
