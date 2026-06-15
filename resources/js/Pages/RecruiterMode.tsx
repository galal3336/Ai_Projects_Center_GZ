import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowUpDown,
    Award,
    BarChart3,
    BookmarkPlus,
    Brain,
    Briefcase,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Code2,
    Crown,
    Download,
    Eye,
    FileDown,
    FileText,
    Filter,
    GraduationCap,
    LayoutGrid,
    List,
    Mail,
    Medal,
    Search,
    SlidersHorizontal,
    Sparkles,
    Star,
    TrendingUp,
    Trophy,
    Users,
    X,
    Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
    id: number;
    name: string;
    initials: string;
    university: string;
    department: string;
    graduationYear: number;
    gpa: number;
    skills: string[];
    technologies: string[];
    awards: string[];
    categories: string[];
    projects: number;
    wins: number;
    points: number;
    rank: number;
    rankChange: 'up' | 'down' | 'same';
    rankDelta: number;
    bio: string;
    availableFor: string[];
    profileViews: number;
    featured: boolean;
    saved: boolean;
    accentColor: string;
    email: string;
}

interface Filters {
    search: string;
    skills: string[];
    technologies: string[];
    awards: string[];
    categories: string[];
    graduationYears: number[];
    availability: string[];
    sortBy: 'rank' | 'points' | 'projects' | 'wins' | 'recent';
    viewMode: 'grid' | 'list';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SKILLS = [
    'Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Keras',
    'Computer Vision', 'NLP', 'Reinforcement Learning', 'Data Science',
    'MLOps', 'Research', 'Statistical Analysis', 'Deep Learning', 'LLMs',
];

const ALL_TECHNOLOGIES = [
    'PyTorch', 'TensorFlow', 'HuggingFace', 'FastAPI', 'Docker',
    'CUDA', 'OpenCV', 'LangChain', 'Jupyter', 'AWS', 'GCP', 'Azure',
    'Spark', 'Ray', 'Triton', 'ONNX',
];

const ALL_AWARDS = [
    '1st Place National AI Fair',
    '2nd Place National AI Fair',
    '3rd Place National AI Fair',
    'Best Innovation Award',
    'Best Research Paper',
    'Most Impactful Project',
    'Rising Star Award',
    'Industry Choice Award',
];

const ALL_CATEGORIES = [
    'Computer Vision', 'Natural Language Processing', 'Machine Learning',
    'Robotics & AI', 'Neural Networks', 'AI Security', 'Data Science', 'Generative AI',
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027, 2028];

const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Internship', 'Research', 'Contract'];

const STUDENTS: Student[] = [
    {
        id: 1, name: 'Sara Al-Rashid', initials: 'SA', university: 'KFUPM', department: 'Computer Science',
        graduationYear: 2025, gpa: 3.96, skills: ['Computer Vision', 'Deep Learning', 'Research', 'Python'],
        technologies: ['PyTorch', 'OpenCV', 'FastAPI', 'Docker'], awards: ['1st Place National AI Fair', 'Best Research Paper'],
        categories: ['Computer Vision', 'Neural Networks'], projects: 7, wins: 3, points: 9840, rank: 1,
        rankChange: 'same', rankDelta: 0, bio: 'Specializing in medical imaging AI with transformer architectures. Published in Nature Digital Medicine.',
        availableFor: ['Research', 'Full-time'], profileViews: 2847, featured: true, saved: false,
        accentColor: '#f59e0b', email: 'sara.alrashid@kfupm.edu.sa',
    },
    {
        id: 2, name: 'Omar Khalil', initials: 'OK', university: 'KAU', department: 'AI & Data Science',
        graduationYear: 2025, gpa: 3.91, skills: ['NLP', 'LLMs', 'Python', 'Research', 'Deep Learning'],
        technologies: ['HuggingFace', 'PyTorch', 'CUDA', 'LangChain'], awards: ['2nd Place National AI Fair', 'Most Impactful Project'],
        categories: ['Natural Language Processing', 'Generative AI'], projects: 5, wins: 2, points: 8720, rank: 2,
        rankChange: 'up', rankDelta: 1, bio: 'Arabic NLP specialist. Fine-tuned LLaMA-3 on 40B tokens, achieving SOTA on ArabicNLU. Open-source contributor.',
        availableFor: ['Full-time', 'Research', 'Contract'], profileViews: 4201, featured: true, saved: true,
        accentColor: '#94a3b8', email: 'omar.khalil@kau.edu.sa',
    },
    {
        id: 3, name: 'Nour Hassan', initials: 'NH', university: 'KAUST', department: 'Computer Science',
        graduationYear: 2024, gpa: 3.88, skills: ['Machine Learning', 'Data Science', 'Statistical Analysis', 'Python'],
        technologies: ['PyTorch', 'Spark', 'AWS', 'Jupyter'], awards: ['3rd Place National AI Fair'],
        categories: ['Machine Learning', 'Data Science'], projects: 9, wins: 2, points: 7950, rank: 3,
        rankChange: 'up', rankDelta: 2, bio: 'Graph neural networks for climate prediction. 30 years of satellite data processed.',
        availableFor: ['Full-time', 'Internship'], profileViews: 1930, featured: false, saved: false,
        accentColor: '#cd7c30', email: 'nour.hassan@kaust.edu.sa',
    },
    {
        id: 4, name: 'Khalid Mohammed', initials: 'KM', university: 'KFUPM', department: 'Robotics',
        graduationYear: 2026, gpa: 3.82, skills: ['Reinforcement Learning', 'Computer Vision', 'Python', 'Research'],
        technologies: ['PyTorch', 'OpenCV', 'Docker'], awards: ['Best Innovation Award'],
        categories: ['Robotics & AI', 'Computer Vision'], projects: 6, wins: 1, points: 6430, rank: 4,
        rankChange: 'down', rankDelta: 1, bio: 'Autonomous navigation in unstructured environments. RL-based agent for sand dune traversal.',
        availableFor: ['Internship', 'Part-time', 'Research'], profileViews: 1245, featured: false, saved: false,
        accentColor: '#8b5cf6', email: 'khalid.m@kfupm.edu.sa',
    },
    {
        id: 5, name: 'Reem Abdullah', initials: 'RA', university: 'KSU', department: 'Information Technology',
        graduationYear: 2025, gpa: 3.79, skills: ['Computer Vision', 'Deep Learning', 'Python'],
        technologies: ['TensorFlow', 'OpenCV', 'FastAPI', 'GCP'], awards: ['Rising Star Award'],
        categories: ['Computer Vision', 'Machine Learning'], projects: 4, wins: 1, points: 5870, rank: 5,
        rankChange: 'up', rankDelta: 3, bio: 'Real-time sign language recognition. ASL-to-text translation with 94% accuracy on live video streams.',
        availableFor: ['Full-time', 'Internship'], profileViews: 987, featured: false, saved: true,
        accentColor: '#3b82f6', email: 'reem.a@ksu.edu.sa',
    },
    {
        id: 6, name: 'Youssef Tarek', initials: 'YT', university: 'KFUPM', department: 'Agricultural AI',
        graduationYear: 2026, gpa: 3.74, skills: ['Machine Learning', 'Computer Vision', 'Data Science'],
        technologies: ['PyTorch', 'TensorFlow', 'Docker', 'AWS'], awards: ['Industry Choice Award'],
        categories: ['Machine Learning', 'Computer Vision'], projects: 6, wins: 1, points: 5340, rank: 6,
        rankChange: 'same', rankDelta: 0, bio: 'Precision agriculture AI. Disease detection from drone imagery with 96% accuracy.',
        availableFor: ['Full-time', 'Contract'], profileViews: 812, featured: false, saved: false,
        accentColor: '#10b981', email: 'youssef.t@kfupm.edu.sa',
    },
    {
        id: 7, name: 'Lina Karimi', initials: 'LK', university: 'KAUST', department: 'AI Security',
        graduationYear: 2027, gpa: 3.91, skills: ['AI Security', 'Python', 'Research', 'MLOps'],
        technologies: ['PyTorch', 'Docker', 'Azure', 'Triton'], awards: ['Best Research Paper'],
        categories: ['AI Security', 'Neural Networks'], projects: 4, wins: 1, points: 4980, rank: 7,
        rankChange: 'up', rankDelta: 2, bio: 'Privacy-preserving ML inference. Federated learning and differential privacy for LLM deployments.',
        availableFor: ['Research', 'Part-time'], profileViews: 1456, featured: true, saved: false,
        accentColor: '#ec4899', email: 'lina.k@kaust.edu.sa',
    },
    {
        id: 8, name: 'Ahmed Rashwan', initials: 'AR', university: 'KAU', department: 'Bioinformatics',
        graduationYear: 2025, gpa: 3.85, skills: ['Data Science', 'Deep Learning', 'Research', 'Python'],
        technologies: ['PyTorch', 'Jupyter', 'AWS', 'Spark'], awards: ['Most Impactful Project'],
        categories: ['Data Science', 'Machine Learning'], projects: 5, wins: 1, points: 4670, rank: 8,
        rankChange: 'down', rankDelta: 2, bio: 'Protein structure prediction beyond AlphaFold. Novel multi-modal approach combining NMR and cryo-EM data.',
        availableFor: ['Research', 'Full-time'], profileViews: 1103, featured: false, saved: true,
        accentColor: '#f59e0b', email: 'ahmed.r@kau.edu.sa',
    },
    {
        id: 9, name: 'Fatima Zahra', initials: 'FZ', university: 'KSU', department: 'Educational Technology',
        graduationYear: 2026, gpa: 3.67, skills: ['Reinforcement Learning', 'NLP', 'Python', 'Data Science'],
        technologies: ['TensorFlow', 'HuggingFace', 'FastAPI', 'GCP'], awards: [],
        categories: ['Generative AI', 'Machine Learning'], projects: 4, wins: 0, points: 4210, rank: 9,
        rankChange: 'same', rankDelta: 0, bio: 'Adaptive learning systems using RL. Personalised curricula that improve student outcomes by 40%.',
        availableFor: ['Internship', 'Part-time'], profileViews: 634, featured: false, saved: false,
        accentColor: '#6366f1', email: 'fatima.z@ksu.edu.sa',
    },
    {
        id: 10, name: 'Mansour Al-Ghamdi', initials: 'MG', university: 'KFUPM', department: 'Computer Engineering',
        graduationYear: 2024, gpa: 3.72, skills: ['MLOps', 'Deep Learning', 'Python', 'Data Science'],
        technologies: ['ONNX', 'Triton', 'Docker', 'Ray', 'AWS'], awards: ['Best Innovation Award'],
        categories: ['Neural Networks', 'AI Security'], projects: 8, wins: 1, points: 3990, rank: 10,
        rankChange: 'up', rankDelta: 1, bio: 'ML infrastructure specialist. Built distributed training pipeline reducing model iteration time by 60%.',
        availableFor: ['Full-time', 'Contract'], profileViews: 892, featured: false, saved: false,
        accentColor: '#14b8a6', email: 'mansour.ag@kfupm.edu.sa',
    },
];

const DEFAULT_FILTERS: Filters = {
    search: '', skills: [], technologies: [], awards: [], categories: [],
    graduationYears: [], availability: [],
    sortBy: 'rank', viewMode: 'grid',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 250): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

// ─── Small Components ─────────────────────────────────────────────────────────

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={[
                'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-all duration-150',
                active
                    ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                    : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:border-white/15 hover:text-white/70',
            ].join(' ')}
        >
            {active && <Check className="h-3 w-3 shrink-0" />}
            {children}
        </button>
    );
}

function FilterGroup({ label, items, selected, onToggle, max = 8 }: {
    label: string; items: string[]; selected: string[];
    onToggle: (item: string) => void; max?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? items : items.slice(0, max);
    return (
        <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/25">{label}</div>
            <div className="flex flex-wrap gap-1.5">
                {visible.map(item => (
                    <Pill key={item} active={selected.includes(item)} onClick={() => onToggle(item)}>{item}</Pill>
                ))}
                {items.length > max && (
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="cursor-pointer rounded-full border border-dashed border-white/10 px-3 py-1 text-[12px] text-white/30 transition-colors hover:text-white/60"
                    >
                        {expanded ? 'Less' : `+${items.length - max} more`}
                    </button>
                )}
            </div>
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" aria-label="1st place" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" aria-label="2nd place" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-500" aria-label="3rd place" />;
    return <span className="font-mono text-xs font-bold text-white/30">#{rank}</span>;
}

function RankDelta({ change, delta }: { change: Student['rankChange']; delta: number }) {
    if (change === 'same' || delta === 0) return null;
    return (
        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${change === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change === 'up' ? '▲' : '▼'}{delta}
        </span>
    );
}

function AwardBadge({ award }: { award: string }) {
    const short = award.replace('National AI Fair', 'NAF').replace('Place ', '').replace(' Award', '').trim();
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/[0.08] px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            <Trophy className="h-2.5 w-2.5 shrink-0" />{short}
        </span>
    );
}

function SkillTag({ skill }: { skill: string }) {
    return (
        <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/50">
            {skill}
        </span>
    );
}

function AvailabilityDot({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{label}
        </span>
    );
}

// ─── Stats Header ──────────────────────────────────────────────────────────────

function StatsHeader({ students, filtered }: { students: Student[]; filtered: Student[] }) {
    const saved = students.filter(s => s.saved).length;
    const featured = students.filter(s => s.featured).length;
    const topSkill = useMemo(() => {
        const counts: Record<string, number> = {};
        students.forEach(s => s.skills.forEach(sk => { counts[sk] = (counts[sk] ?? 0) + 1; }));
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    }, [students]);

    const stats = [
        { icon: Users, label: 'Total Talent', value: students.length, sub: `${filtered.length} matching`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        { icon: BookmarkPlus, label: 'Saved', value: saved, sub: 'in your list', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
        { icon: Sparkles, label: 'Featured', value: featured, sub: 'top performers', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { icon: TrendingUp, label: 'Top Skill', value: topSkill, sub: 'most common', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value, sub, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 rounded-2xl border p-4 ${bg}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ${color}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[11px] font-medium text-white/35">{label}</div>
                        <div className="truncate text-lg font-black text-white/90">{value}</div>
                        <div className="truncate text-[10px] text-white/25">{sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Leaderboard Podium ────────────────────────────────────────────────────────

function LeaderboardPodium({ students, onSelect }: { students: Student[]; onSelect: (s: Student) => void }) {
    const top3 = students.slice(0, 3);
    const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
    const heights = ['h-20', 'h-28', 'h-14'];
    const podiumColors = [
        'from-slate-500/30 to-slate-600/10 border-slate-500/30',
        'from-amber-500/30 to-amber-600/10 border-amber-500/30',
        'from-orange-700/30 to-orange-800/10 border-orange-700/30',
    ];

    if (top3.length < 3) return null;

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-white/80">Top Performers</span>
                <span className="ml-auto text-[11px] text-white/25">Overall Ranking</span>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-2">
                {order.map((idx, pos) => {
                    const s = top3[idx];
                    const isFirst = idx === 0;
                    return (
                        <button
                            key={s.id}
                            onClick={() => onSelect(s)}
                            className="group flex w-28 cursor-pointer flex-col items-center gap-2 focus:outline-none"
                            aria-label={`View ${s.name} profile`}
                        >
                            {/* Avatar + crown */}
                            <div className="relative">
                                {isFirst && (
                                    <Crown className="absolute -top-5 left-1/2 h-4 w-4 -translate-x-1/2 text-amber-400" />
                                )}
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full text-[13px] font-black text-white ring-2 transition-all duration-150 group-hover:ring-4"
                                    style={{
                                        background: `linear-gradient(135deg, ${s.accentColor}cc, ${s.accentColor}55)`,
                                        ringColor: s.accentColor + '44',
                                        border: `1.5px solid ${s.accentColor}44`,
                                    }}
                                >
                                    {s.initials}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="truncate text-[11px] font-bold text-white/80">{s.name.split(' ')[0]}</div>
                                <div className="text-[10px] font-black" style={{ color: s.accentColor }}>{s.points.toLocaleString()} pts</div>
                            </div>
                            {/* Podium block */}
                            <div className={`w-full rounded-t-xl border bg-gradient-to-b ${podiumColors[idx]} ${heights[pos]} flex items-center justify-center`}>
                                <RankBadge rank={s.rank} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Ranks 4–6 compact list */}
            <div className="mt-4 space-y-2 border-t border-white/[0.05] pt-4">
                {students.slice(3, 6).map(s => (
                    <button
                        key={s.id}
                        onClick={() => onSelect(s)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.03] focus:outline-none"
                    >
                        <span className="font-mono text-xs font-bold text-white/25">#{s.rank}</span>
                        <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${s.accentColor}bb, ${s.accentColor}44)` }}
                        >
                            {s.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] font-semibold text-white/70">{s.name}</div>
                        </div>
                        <span className="font-mono text-[11px] font-black text-white/40">{s.points.toLocaleString()}</span>
                        <RankDelta change={s.rankChange} delta={s.rankDelta} />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Profile Quick-View Drawer ─────────────────────────────────────────────────

function ProfileDrawer({ student, onClose, onSave, onExport }: {
    student: Student; onClose: () => void; onSave: (id: number) => void; onExport: (id: number) => void;
}) {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`${student.name} profile`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div
                className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/[0.07]"
                style={{ background: '#0d0d0f' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-4"
                    style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)' }}>
                    <span className="text-sm font-bold text-white/70">Profile Preview</span>
                    <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-6 p-6">
                    {/* Identity */}
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${student.accentColor}cc, ${student.accentColor}44)`, border: `2px solid ${student.accentColor}44` }}
                            >
                                {student.initials}
                            </div>
                            {student.featured && (
                                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 ring-2 ring-[#0d0d0f]">
                                    <Sparkles className="h-2.5 w-2.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-white/90">{student.name}</h2>
                                <RankBadge rank={student.rank} />
                                <RankDelta change={student.rankChange} delta={student.rankDelta} />
                            </div>
                            <div className="text-[12px] text-white/40">{student.university} · {student.department}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/30">
                                <GraduationCap className="h-3.5 w-3.5 text-violet-400/60" />
                                Class of {student.graduationYear}
                                <span className="mx-1 text-white/15">·</span>
                                GPA {student.gpa.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                        {[
                            { label: 'Points', value: student.points.toLocaleString() },
                            { label: 'Projects', value: student.projects },
                            { label: 'Wins', value: student.wins },
                            { label: 'Views', value: student.profileViews.toLocaleString() },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <div className="text-base font-black text-white/85">{value}</div>
                                <div className="text-[10px] text-white/25">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Bio */}
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">About</div>
                        <p className="text-[13px] leading-relaxed text-white/55">{student.bio}</p>
                    </div>

                    {/* Awards */}
                    {student.awards.length > 0 && (
                        <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">Awards</div>
                            <div className="flex flex-wrap gap-2">
                                {student.awards.map(a => <AwardBadge key={a} award={a} />)}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">Skills</div>
                        <div className="flex flex-wrap gap-1.5">
                            {student.skills.map(s => <SkillTag key={s} skill={s} />)}
                        </div>
                    </div>

                    {/* Technologies */}
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">Technologies</div>
                        <div className="flex flex-wrap gap-1.5">
                            {student.technologies.map(t => (
                                <span key={t} className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/[0.07] px-2 py-0.5 text-[11px] font-medium text-blue-300">
                                    <Code2 className="h-2.5 w-2.5" />{t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">Categories</div>
                        <div className="flex flex-wrap gap-1.5">
                            {student.categories.map(c => (
                                <span key={c} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/45">{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/25">Available For</div>
                        <div className="flex flex-wrap gap-3">
                            {student.availableFor.map(a => <AvailabilityDot key={a} label={a} />)}
                        </div>
                    </div>

                    {/* Profile views */}
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                        <Eye className="h-4 w-4 text-white/30" />
                        <span className="text-[12px] text-white/40">{student.profileViews.toLocaleString()} profile views</span>
                    </div>
                </div>

                {/* Actions footer */}
                <div className="sticky bottom-0 mt-auto border-t border-white/[0.06] p-5"
                    style={{ background: 'rgba(13,13,15,0.97)', backdropFilter: 'blur(12px)' }}>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSave(student.id)}
                            className={[
                                'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all duration-150',
                                student.saved
                                    ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                                    : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/15 hover:text-white/70',
                            ].join(' ')}
                            aria-label={student.saved ? 'Unsave' : 'Save profile'}
                        >
                            <BookmarkPlus className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onExport(student.id)}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all duration-150 hover:border-white/15 hover:text-white/70"
                            aria-label="Export PDF"
                        >
                            <FileDown className="h-4 w-4" />
                        </button>
                        <a
                            href={`/profile/${student.id}`}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-violet-600 text-[13px] font-bold text-white transition-all hover:bg-violet-500"
                        >
                            Full Profile <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                    <a
                        href={`mailto:${student.email}`}
                        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 text-[13px] font-semibold text-white/60 transition-all hover:border-white/12 hover:text-white/80"
                    >
                        <Mail className="h-3.5 w-3.5" />
                        Send Email
                    </a>
                </div>
            </div>
        </div>
    );
}

// ─── Student Card (Grid) ───────────────────────────────────────────────────────

function StudentCardGrid({ student, selected, onSelect, onToggleSelect, onSave, onExport }: {
    student: Student; selected: boolean;
    onSelect: (s: Student) => void;
    onToggleSelect: (id: number) => void;
    onSave: (id: number) => void;
    onExport: (id: number) => void;
}) {
    return (
        <article
            className={[
                'group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-200',
                selected
                    ? 'border-violet-500/40 bg-violet-500/[0.04] -translate-y-0.5'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035] hover:-translate-y-0.5',
            ].join(' ')}
        >
            {/* Select checkbox */}
            <button
                onClick={() => onToggleSelect(student.id)}
                aria-label={selected ? 'Deselect' : 'Select'}
                className={[
                    'absolute right-3 top-3 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-all duration-150',
                    selected
                        ? 'border-violet-500 bg-violet-600 text-white'
                        : 'border-white/[0.1] bg-white/[0.02] text-transparent hover:border-white/25',
                ].join(' ')}
            >
                <Check className="h-3 w-3" />
            </button>

            {/* Top row */}
            <div className="mb-4 flex items-start justify-between gap-2 pr-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${student.accentColor}cc, ${student.accentColor}55)`, border: `1.5px solid ${student.accentColor}44` }}
                        >
                            {student.initials}
                        </div>
                        {student.featured && (
                            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 ring-2 ring-[#0a0a0a]">
                                <Sparkles className="h-2 w-2 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-[14px] font-bold text-white/90">{student.name}</div>
                        <div className="text-[11px] text-white/35">{student.university} · {student.department}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 pt-1">
                    <RankBadge rank={student.rank} />
                    <RankDelta change={student.rankChange} delta={student.rankDelta} />
                </div>
            </div>

            {/* Bio */}
            <p className="mb-4 line-clamp-2 text-[12px] leading-relaxed text-white/40">{student.bio}</p>

            {/* Awards */}
            {student.awards.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                    {student.awards.slice(0, 2).map(a => <AwardBadge key={a} award={a} />)}
                    {student.awards.length > 2 && (
                        <span className="text-[10px] text-white/25">+{student.awards.length - 2}</span>
                    )}
                </div>
            )}

            {/* Skills */}
            <div className="mb-4 flex flex-wrap gap-1">
                {student.skills.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
                {student.skills.length > 4 && (
                    <span className="rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-0.5 text-[11px] text-white/25">
                        +{student.skills.length - 4}
                    </span>
                )}
            </div>

            {/* Availability */}
            <div className="mb-4 flex flex-wrap gap-3">
                {student.availableFor.map(a => <AvailabilityDot key={a} label={a} />)}
            </div>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                {[
                    { label: 'Points', value: student.points.toLocaleString() },
                    { label: 'Projects', value: student.projects },
                    { label: 'Wins', value: student.wins },
                    { label: 'GPA', value: student.gpa.toFixed(2) },
                ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                        <div className="text-sm font-black text-white/80">{value}</div>
                        <div className="text-[10px] text-white/25">{label}</div>
                    </div>
                ))}
            </div>

            {/* Grad year + views */}
            <div className="mb-4 flex items-center gap-1.5 text-[11px] text-white/30">
                <GraduationCap className="h-3.5 w-3.5 text-violet-400/60" />
                Class of {student.graduationYear}
                <span className="ml-auto flex items-center gap-1">
                    <Eye className="h-3 w-3" />{student.profileViews.toLocaleString()} views
                </span>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2 border-t border-white/[0.05] pt-4">
                <button
                    onClick={() => onSave(student.id)}
                    aria-label={student.saved ? 'Unsave profile' : 'Save profile'}
                    className={[
                        'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150',
                        student.saved
                            ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                            : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white/70',
                    ].join(' ')}
                >
                    <BookmarkPlus className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onExport(student.id)}
                    aria-label="Export profile"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-all duration-150 hover:border-white/15 hover:text-white/70"
                >
                    <FileDown className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onSelect(student)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-violet-600/90 text-[13px] font-semibold text-white transition-all hover:bg-violet-500"
                >
                    View Profile <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </article>
    );
}

// ─── Student Row (List) ────────────────────────────────────────────────────────

function StudentRowList({ student, selected, onSelect, onToggleSelect, onSave, onExport }: {
    student: Student; selected: boolean;
    onSelect: (s: Student) => void;
    onToggleSelect: (id: number) => void;
    onSave: (id: number) => void;
    onExport: (id: number) => void;
}) {
    return (
        <article className={[
            'group flex items-center gap-4 border-b border-white/[0.05] px-6 py-4 transition-colors last:border-b-0',
            selected ? 'bg-violet-500/[0.04]' : 'hover:bg-white/[0.025]',
        ].join(' ')}>
            {/* Checkbox */}
            <button
                onClick={() => onToggleSelect(student.id)}
                aria-label={selected ? 'Deselect' : 'Select'}
                className={[
                    'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-150',
                    selected
                        ? 'border-violet-500 bg-violet-600 text-white'
                        : 'border-white/[0.1] text-transparent hover:border-white/25',
                ].join(' ')}
            >
                <Check className="h-3 w-3" />
            </button>

            {/* Rank */}
            <div className="flex w-8 shrink-0 flex-col items-center gap-0.5">
                <RankBadge rank={student.rank} />
                <RankDelta change={student.rankChange} delta={student.rankDelta} />
            </div>

            {/* Avatar + name */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative shrink-0">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${student.accentColor}cc, ${student.accentColor}55)`, border: `1.5px solid ${student.accentColor}44` }}
                    >
                        {student.initials}
                    </div>
                    {student.featured && (
                        <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 ring-1 ring-[#0a0a0a]">
                            <Sparkles className="h-2 w-2 text-white" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-white/85">{student.name}</div>
                    <div className="truncate text-[11px] text-white/30">{student.university} · Class of {student.graduationYear}</div>
                </div>
            </div>

            {/* Award */}
            <div className="hidden w-44 shrink-0 flex-wrap gap-1 md:flex">
                {student.awards.slice(0, 1).map(a => <AwardBadge key={a} award={a} />)}
                {student.awards.length === 0 && <span className="text-[11px] text-white/20">—</span>}
            </div>

            {/* Skills */}
            <div className="hidden w-48 shrink-0 flex-wrap gap-1 lg:flex">
                {student.skills.slice(0, 2).map(s => <SkillTag key={s} skill={s} />)}
            </div>

            {/* Points */}
            <div className="w-20 shrink-0 text-right">
                <div className="text-[13px] font-black text-white/70">{student.points.toLocaleString()}</div>
                <div className="text-[10px] text-white/25">points</div>
            </div>

            {/* Availability */}
            <div className="hidden w-24 shrink-0 lg:block">
                {student.availableFor.slice(0, 1).map(a => <AvailabilityDot key={a} label={a} />)}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
                <button
                    onClick={() => onSave(student.id)}
                    aria-label={student.saved ? 'Unsave' : 'Save'}
                    className={[
                        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150',
                        student.saved
                            ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                            : 'border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white/60',
                    ].join(' ')}
                >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onExport(student.id)}
                    aria-label="Export"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.07] text-white/35 transition-all duration-150 hover:border-white/15 hover:text-white/60"
                >
                    <FileDown className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onSelect(student)}
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-violet-600/90 px-3 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-violet-500"
                >
                    View <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        </article>
    );
}

// ─── Filters Sidebar ───────────────────────────────────────────────────────────

function FiltersSidebar({ filters, onChange, onReset, resultCount }: {
    filters: Filters; onChange: (patch: Partial<Filters>) => void;
    onReset: () => void; resultCount: number;
}) {
    const activeCount = [
        filters.skills.length, filters.technologies.length, filters.awards.length,
        filters.categories.length, filters.graduationYears.length, filters.availability.length,
    ].reduce((a, b) => a + b, 0);

    return (
        <aside className="flex h-full flex-col">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-bold text-white/80">Filters</span>
                    {activeCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button onClick={onReset} className="cursor-pointer text-[11px] font-medium text-white/30 transition-colors hover:text-white/70">
                        Clear all
                    </button>
                )}
            </div>

            <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="text-lg font-black text-white/90">{resultCount}</div>
                <div className="text-[11px] text-white/30">students found</div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                <FilterGroup label="Skills" items={ALL_SKILLS} selected={filters.skills}
                    onToggle={item => onChange({ skills: toggle(filters.skills, item) })} />
                <div className="border-t border-white/[0.05]" />
                <FilterGroup label="Technologies" items={ALL_TECHNOLOGIES} selected={filters.technologies}
                    onToggle={item => onChange({ technologies: toggle(filters.technologies, item) })} />
                <div className="border-t border-white/[0.05]" />
                <FilterGroup label="Categories" items={ALL_CATEGORIES} selected={filters.categories}
                    onToggle={item => onChange({ categories: toggle(filters.categories, item) })} max={6} />
                <div className="border-t border-white/[0.05]" />
                <FilterGroup label="Awards" items={ALL_AWARDS} selected={filters.awards}
                    onToggle={item => onChange({ awards: toggle(filters.awards, item) })} max={4} />
                <div className="border-t border-white/[0.05]" />

                {/* Graduation Year */}
                <div>
                    <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/25">Graduation Year</div>
                    <div className="flex flex-wrap gap-1.5">
                        {GRADUATION_YEARS.map(y => (
                            <Pill key={y} active={filters.graduationYears.includes(y)}
                                onClick={() => onChange({ graduationYears: toggle(filters.graduationYears, y) })}>
                                {y}
                            </Pill>
                        ))}
                    </div>
                </div>
                <div className="border-t border-white/[0.05]" />
                <FilterGroup label="Available For" items={AVAILABILITY_OPTIONS} selected={filters.availability}
                    onToggle={item => onChange({ availability: toggle(filters.availability, item) })} />
            </div>
        </aside>
    );
}

// ─── Export Menu ───────────────────────────────────────────────────────────────

function ExportMenu({ count, onExport }: { count: number; onExport: (format: 'csv' | 'pdf') => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90"
            >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export{count > 0 ? ` (${count})` : ''}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-white/[0.1] bg-[#111] shadow-2xl">
                    {[
                        { format: 'csv' as const, icon: FileText, label: 'Export as CSV', sub: 'Spreadsheet format' },
                        { format: 'pdf' as const, icon: FileDown, label: 'Export as PDF', sub: 'Print-ready profiles' },
                    ].map(({ format, icon: Icon, label, sub }) => (
                        <button
                            key={format}
                            onClick={() => { onExport(format); setOpen(false); }}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
                        >
                            <Icon className="h-4 w-4 text-white/40" />
                            <div>
                                <div className="text-[12px] font-semibold text-white/75">{label}</div>
                                <div className="text-[10px] text-white/30">{sub}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-white/[0.1] bg-[#111] px-4 py-3 shadow-2xl"
        >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="text-[13px] font-medium text-white/80">{message}</span>
            <button onClick={onDismiss} className="cursor-pointer text-white/30 hover:text-white/70" aria-label="Dismiss">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <Search className="h-7 w-7 text-white/20" />
            </div>
            <h3 className="mb-2 text-base font-bold text-white/60">No students match your filters</h3>
            <p className="mb-6 max-w-xs text-sm text-white/30">
                Try adjusting your search or removing some filter criteria to broaden results.
            </p>
            <button
                onClick={onReset}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.08]"
            >
                Clear all filters
            </button>
        </div>
    );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
                    <div className="h-2.5 w-24 animate-pulse rounded-full bg-white/[0.04]" />
                </div>
            </div>
            <div className="mb-3 space-y-2">
                <div className="h-2.5 w-full animate-pulse rounded-full bg-white/[0.04]" />
                <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
            </div>
            <div className="flex gap-1.5">
                {[40, 60, 50].map(w => (
                    <div key={w} className="h-6 animate-pulse rounded-full bg-white/[0.04]" style={{ width: w }} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

interface RecruiterModeProps {
    auth: { user: { name: string; email: string } | null };
}

export default function RecruiterMode({ auth }: RecruiterModeProps) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [students, setStudents] = useState<Student[]>(STUDENTS);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [loading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);

    const debouncedSearch = useDebounce(filters.search, 200);

    const patchFilters = useCallback((patch: Partial<Filters>) => {
        setFilters(prev => ({ ...prev, ...patch }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    }, []);

    const handleSave = useCallback((id: number) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, saved: !s.saved } : s));
        const student = students.find(s => s.id === id);
        if (student) showToast(student.saved ? 'Removed from saved' : `${student.name} saved to your list`);
        // Sync drawer if open
        setActiveStudent(prev => prev?.id === id ? { ...prev, saved: !prev.saved } : prev);
    }, [students, showToast]);

    const handleExport = useCallback((id: number) => {
        const student = students.find(s => s.id === id);
        if (student) showToast(`Exporting ${student.name}'s profile as PDF…`);
    }, [students, showToast]);

    const handleBulkExport = useCallback((format: 'csv' | 'pdf') => {
        const count = selectedIds.size > 0 ? selectedIds.size : filteredSorted.length;
        showToast(`Exporting ${count} profile${count !== 1 ? 's' : ''} as ${format.toUpperCase()}…`);
        setSelectedIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIds, showToast]);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // ── Filter + Sort ──────────────────────────────────────────────────────────
    const filteredSorted = useMemo(() => {
        let result = students.filter(s => {
            if (debouncedSearch) {
                const q = debouncedSearch.toLowerCase();
                const hit = [s.name, s.university, s.department, ...s.skills, ...s.technologies].some(t => t.toLowerCase().includes(q));
                if (!hit) return false;
            }
            if (filters.skills.length && !filters.skills.some(sk => s.skills.includes(sk))) return false;
            if (filters.technologies.length && !filters.technologies.some(t => s.technologies.includes(t))) return false;
            if (filters.awards.length && !filters.awards.some(a => s.awards.includes(a))) return false;
            if (filters.categories.length && !filters.categories.some(c => s.categories.includes(c))) return false;
            if (filters.graduationYears.length && !filters.graduationYears.includes(s.graduationYear)) return false;
            if (filters.availability.length && !filters.availability.some(a => s.availableFor.includes(a))) return false;
            return true;
        });

        const sortMap: Record<Filters['sortBy'], (a: Student, b: Student) => number> = {
            rank: (a, b) => a.rank - b.rank,
            points: (a, b) => b.points - a.points,
            projects: (a, b) => b.projects - a.projects,
            wins: (a, b) => b.wins - a.wins,
            recent: (a, b) => a.id - b.id,
        };
        return [...result].sort(sortMap[filters.sortBy]);
    }, [students, debouncedSearch, filters]);

    const savedCount = students.filter(s => s.saved).length;
    const activeFilterCount = [
        filters.skills.length, filters.technologies.length, filters.awards.length,
        filters.categories.length, filters.graduationYears.length, filters.availability.length,
    ].reduce((a, b) => a + b, 0);

    const allSelected = filteredSorted.length > 0 && filteredSorted.every(s => selectedIds.has(s.id));

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSorted.map(s => s.id)));
        }
    }, [allSelected, filteredSorted]);

    return (
        <>
            <Head title="Recruiter Mode — AiKFS" />

            <div className="min-h-dvh" style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

                {/* ── Top Bar ──────────────────────────────────────────────── */}
                <header
                    className="sticky top-0 z-40 border-b border-white/[0.06]"
                    style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px) saturate(180%)' }}
                >
                    <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-6">
                        {/* Brand */}
                        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            <span className="hidden text-sm font-black sm:block">
                                Ai<span className="text-violet-400">KFS</span>
                            </span>
                        </Link>

                        {/* Mode badge */}
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1">
                            <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-300">Recruiter Mode</span>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                            <input
                                type="search"
                                placeholder="Search by name, skill, university, technology…"
                                value={filters.search}
                                onChange={e => patchFilters({ search: e.target.value })}
                                aria-label="Search students"
                                className="h-9 w-full rounded-xl border border-white/[0.07] bg-white/[0.04] pl-9 pr-4 text-[13px] text-white/80 placeholder:text-white/25 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20"
                            />
                        </div>

                        {/* Right actions */}
                        <div className="ml-auto flex shrink-0 items-center gap-2">
                            {savedCount > 0 && (
                                <button
                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-300 transition-all hover:bg-violet-500/20"
                                    aria-label={`${savedCount} saved profiles`}
                                >
                                    <BookmarkPlus className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Saved</span>
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-black text-white">
                                        {savedCount}
                                    </span>
                                </button>
                            )}
                            <ExportMenu count={selectedIds.size} onExport={handleBulkExport} />
                            <button
                                onClick={() => setMobileSidebarOpen(o => !o)}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/15 hover:text-white/90 lg:hidden"
                                aria-label="Toggle filters"
                                aria-expanded={mobileSidebarOpen}
                            >
                                <Filter className="h-3.5 w-3.5" />
                                {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-[1600px]">

                    {/* ── Desktop Sidebar ───────────────────────────────────── */}
                    <div className="hidden w-72 shrink-0 lg:block">
                        <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-hidden border-r border-white/[0.05] p-5">
                            <FiltersSidebar
                                filters={filters}
                                onChange={patchFilters}
                                onReset={resetFilters}
                                resultCount={filteredSorted.length}
                            />
                        </div>
                    </div>

                    {/* ── Mobile Sidebar Overlay ─────────────────────────────── */}
                    {mobileSidebarOpen && (
                        <div
                            className="fixed inset-0 z-50 lg:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Filters"
                        >
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setMobileSidebarOpen(false)}
                            />
                            <div
                                className="absolute inset-y-0 left-0 w-80 overflow-hidden border-r border-white/[0.06] p-5"
                                style={{ background: '#0d0d0d' }}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-bold text-white/80">Filters</span>
                                    <button
                                        onClick={() => setMobileSidebarOpen(false)}
                                        className="cursor-pointer text-white/40 hover:text-white/80"
                                        aria-label="Close filters"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <FiltersSidebar
                                    filters={filters}
                                    onChange={patchFilters}
                                    onReset={resetFilters}
                                    resultCount={filteredSorted.length}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Main Content ───────────────────────────────────────── */}
                    <main className="min-w-0 flex-1 px-6 py-6">

                        {/* Stats Header */}
                        <div className="mb-6">
                            <StatsHeader students={students} filtered={filteredSorted} />
                        </div>

                        {/* Two-column: leaderboard + results */}
                        <div className="flex gap-6">

                            {/* Results column */}
                            <div className="min-w-0 flex-1">

                                {/* Toolbar */}
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h1 className="text-lg font-black text-white/90">Talent Discovery</h1>
                                        <p className="text-[12px] text-white/35">
                                            {filteredSorted.length} AI student{filteredSorted.length !== 1 ? 's' : ''} found
                                            {filters.search && <> for "<span className="text-white/60">{filters.search}</span>"</>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Select all */}
                                        {filteredSorted.length > 0 && (
                                            <button
                                                onClick={toggleSelectAll}
                                                className={[
                                                    'flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all duration-150',
                                                    allSelected
                                                        ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                                                        : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:border-white/12 hover:text-white/70',
                                                ].join(' ')}
                                            >
                                                {allSelected ? <Check className="h-3 w-3" /> : <BarChart3 className="h-3 w-3" />}
                                                {allSelected ? 'Deselect all' : 'Select all'}
                                            </button>
                                        )}

                                        {/* Sort */}
                                        <div className="relative">
                                            <label htmlFor="sort-select" className="sr-only">Sort by</label>
                                            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                                                <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                                            </div>
                                            <select
                                                id="sort-select"
                                                value={filters.sortBy}
                                                onChange={e => patchFilters({ sortBy: e.target.value as Filters['sortBy'] })}
                                                className="h-8 cursor-pointer appearance-none rounded-lg border border-white/[0.07] bg-white/[0.04] pl-7 pr-8 text-[12px] font-medium text-white/60 outline-none transition-all focus:border-violet-500/40 hover:border-white/12"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff44' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 8px center',
                                                }}
                                            >
                                                <option value="rank">By Rank</option>
                                                <option value="points">By Points</option>
                                                <option value="projects">By Projects</option>
                                                <option value="wins">By Wins</option>
                                                <option value="recent">Most Recent</option>
                                            </select>
                                        </div>

                                        {/* View toggle */}
                                        <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
                                            {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => patchFilters({ viewMode: mode })}
                                                    aria-label={`${mode} view`}
                                                    aria-pressed={filters.viewMode === mode}
                                                    className={[
                                                        'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150',
                                                        filters.viewMode === mode
                                                            ? 'bg-white/[0.08] text-white/90'
                                                            : 'text-white/30 hover:text-white/60',
                                                    ].join(' ')}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Bulk action bar */}
                                {selectedIds.size > 0 && (
                                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-4 py-3">
                                        <Zap className="h-4 w-4 text-violet-400" />
                                        <span className="text-[13px] font-semibold text-violet-300">
                                            {selectedIds.size} profile{selectedIds.size !== 1 ? 's' : ''} selected
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                onClick={() => handleBulkExport('csv')}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-300 transition-all hover:bg-violet-500/20"
                                            >
                                                <FileText className="h-3.5 w-3.5" />Export CSV
                                            </button>
                                            <button
                                                onClick={() => handleBulkExport('pdf')}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-300 transition-all hover:bg-violet-500/20"
                                            >
                                                <FileDown className="h-3.5 w-3.5" />Export PDF
                                            </button>
                                            <button
                                                onClick={() => setSelectedIds(new Set())}
                                                className="cursor-pointer text-white/30 hover:text-white/60"
                                                aria-label="Clear selection"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Active filter chips */}
                                {activeFilterCount > 0 && (
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] text-white/25">Active:</span>
                                        {[...filters.skills, ...filters.technologies, ...filters.categories, ...filters.awards].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const patch: Partial<Filters> = {};
                                                    if (filters.skills.includes(tag)) patch.skills = filters.skills.filter(x => x !== tag);
                                                    if (filters.technologies.includes(tag)) patch.technologies = filters.technologies.filter(x => x !== tag);
                                                    if (filters.categories.includes(tag)) patch.categories = filters.categories.filter(x => x !== tag);
                                                    if (filters.awards.includes(tag)) patch.awards = filters.awards.filter(x => x !== tag);
                                                    patchFilters(patch);
                                                }}
                                                className="flex cursor-pointer items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 transition-all hover:bg-violet-500/20"
                                            >
                                                {tag} <X className="h-3 w-3" />
                                            </button>
                                        ))}
                                        {filters.graduationYears.map(y => (
                                            <button
                                                key={y}
                                                onClick={() => patchFilters({ graduationYears: filters.graduationYears.filter(x => x !== y) })}
                                                className="flex cursor-pointer items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 transition-all hover:bg-violet-500/20"
                                            >
                                                Class of {y} <X className="h-3 w-3" />
                                            </button>
                                        ))}
                                        {filters.availability.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => patchFilters({ availability: filters.availability.filter(x => x !== a) })}
                                                className="flex cursor-pointer items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 transition-all hover:bg-violet-500/20"
                                            >
                                                {a} <X className="h-3 w-3" />
                                            </button>
                                        ))}
                                        <button onClick={resetFilters} className="cursor-pointer text-[11px] text-white/25 underline transition-colors hover:text-white/60">
                                            Clear all
                                        </button>
                                    </div>
                                )}

                                {/* Results */}
                                {loading ? (
                                    <div className={filters.viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' : 'space-y-2'}>
                                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                                    </div>
                                ) : filteredSorted.length === 0 ? (
                                    <EmptyState onReset={resetFilters} />
                                ) : filters.viewMode === 'grid' ? (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                        {filteredSorted.map(s => (
                                            <StudentCardGrid
                                                key={s.id}
                                                student={s}
                                                selected={selectedIds.has(s.id)}
                                                onSelect={setActiveStudent}
                                                onToggleSelect={toggleSelect}
                                                onSave={handleSave}
                                                onExport={handleExport}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                                        {/* List header */}
                                        <div className="flex items-center gap-4 border-b border-white/[0.05] px-6 py-3">
                                            <button
                                                onClick={toggleSelectAll}
                                                aria-label={allSelected ? 'Deselect all' : 'Select all'}
                                                className={[
                                                    'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all',
                                                    allSelected ? 'border-violet-500 bg-violet-600 text-white' : 'border-white/[0.1] text-transparent hover:border-white/25',
                                                ].join(' ')}
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                            <div className="w-8 shrink-0" />
                                            <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-white/25">Student</div>
                                            <div className="hidden w-44 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/25 md:block">Award</div>
                                            <div className="hidden w-48 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/25 lg:block">Top Skills</div>
                                            <div className="w-20 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wider text-white/25">Points</div>
                                            <div className="hidden w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/25 lg:block">Available</div>
                                            <div className="w-32 shrink-0" />
                                        </div>
                                        {filteredSorted.map(s => (
                                            <StudentRowList
                                                key={s.id}
                                                student={s}
                                                selected={selectedIds.has(s.id)}
                                                onSelect={setActiveStudent}
                                                onToggleSelect={toggleSelect}
                                                onSave={handleSave}
                                                onExport={handleExport}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                {filteredSorted.length > 0 && (
                                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.05] pt-5">
                                        <p className="text-[11px] text-white/20">
                                            Showing {filteredSorted.length} of {students.length} students
                                            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
                                        </p>
                                        <ExportMenu count={selectedIds.size} onExport={handleBulkExport} />
                                    </div>
                                )}
                            </div>

                            {/* ── Leaderboard Panel (right, xl+) ──────────── */}
                            <div className="hidden w-64 shrink-0 xl:block">
                                <div className="sticky top-20">
                                    <LeaderboardPodium students={filteredSorted} onSelect={setActiveStudent} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* ── Profile Quick-View Drawer ──────────────────────────────── */}
            {activeStudent && (
                <ProfileDrawer
                    student={activeStudent}
                    onClose={() => setActiveStudent(null)}
                    onSave={handleSave}
                    onExport={handleExport}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────── */}
            {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
        </>
    );
}
