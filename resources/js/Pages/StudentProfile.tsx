import React from 'react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Building2,
    Calendar,
    Code2,
    ExternalLink,
    GitFork,
    GitPullRequest,
    Globe,
    MapPin,
    Star,
    Terminal,
    Trophy,
    Users,
    Activity,
    GitCommit,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';
import {
    AmbientBackground,
    GlassCard,
    Reveal,
    ScoreBar,
    fadeUp,
    scaleIn,
    slideLeft,
} from '@/components/ui/design-system';

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
    name: string;
    level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
    category: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
    forks: number;
    updatedAt: string;
    topics: string[];
    url: string;
}

interface Award {
    id: number;
    title: string;
    issuer: string;
    date: string;
    color?: string;
}

interface ActivityItem {
    id: number;
    type: 'commit' | 'pr' | 'issue' | 'star' | 'fork';
    message: string;
    repo: string;
    time: string;
}

interface StudentData {
    name: string;
    username: string;
    title: string;
    bio: string;
    avatar: string;
    location: string;
    company: string;
    website: string;
    linkedin: string;
    github: string;
    portfolio: string;
    joinedDate: string;
    isOnline: boolean;
    stats: { repos: number; commits: number; pullRequests: number; stars: number; followers: number; following: number };
    skills: Skill[];
    projects: Project[];
    awards: Award[];
    activity: ActivityItem[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const student: StudentData = {
    name: 'Alex Chen',
    username: 'alexchen',
    title: 'Full Stack Developer & CS Student',
    bio: 'Passionate about building scalable web applications and exploring AI/ML. Currently pursuing B.Sc. Computer Science. Open source contributor and hackathon enthusiast.',
    avatar: 'https://i.pravatar.cc/150?img=11',
    location: 'San Francisco, CA',
    company: 'Stanford University',
    website: 'alexchen.dev',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    portfolio: 'alexchen.dev/portfolio',
    joinedDate: 'August 2022',
    isOnline: true,
    stats: { repos: 47, commits: 1284, pullRequests: 93, stars: 342, followers: 218, following: 89 },
    skills: [
        { name: 'TypeScript',    level: 'expert',       category: 'Language' },
        { name: 'React',         level: 'expert',       category: 'Frontend' },
        { name: 'Laravel',       level: 'advanced',     category: 'Backend' },
        { name: 'Python',        level: 'advanced',     category: 'Language' },
        { name: 'Node.js',       level: 'advanced',     category: 'Backend' },
        { name: 'PostgreSQL',    level: 'advanced',     category: 'Database' },
        { name: 'Docker',        level: 'intermediate', category: 'DevOps' },
        { name: 'GraphQL',       level: 'intermediate', category: 'API' },
        { name: 'TensorFlow',    level: 'intermediate', category: 'AI/ML' },
        { name: 'Redis',         level: 'intermediate', category: 'Database' },
        { name: 'Next.js',       level: 'advanced',     category: 'Frontend' },
        { name: 'Tailwind CSS',  level: 'expert',       category: 'Frontend' },
    ],
    projects: [
        { id: 1, name: 'neural-notes',            description: 'AI-powered note-taking app with semantic search, auto-tagging, and knowledge graph visualization.',    language: 'TypeScript', languageColor: '#3178c6', stars: 128, forks: 23, updatedAt: '2 days ago',   topics: ['ai', 'nextjs', 'openai', 'prisma'],        url: '#' },
        { id: 2, name: 'devflow',                 description: 'GitHub-inspired project management tool built for student teams. Real-time collaboration.',             language: 'PHP',        languageColor: '#4f5d95', stars: 84,  forks: 17, updatedAt: '1 week ago',   topics: ['laravel', 'inertia', 'websockets', 'saas'], url: '#' },
        { id: 3, name: 'ml-portfolio-optimizer',  description: 'Reinforcement learning agent for portfolio optimization using historical market data.',                language: 'Python',     languageColor: '#3572A5', stars: 67,  forks: 11, updatedAt: '3 weeks ago', topics: ['ml', 'finance', 'rl', 'pytorch'],           url: '#' },
        { id: 4, name: 'openui',                  description: 'Open source component library with 50+ accessible React components and dark mode support.',           language: 'TypeScript', languageColor: '#3178c6', stars: 63,  forks: 19, updatedAt: '4 days ago',   topics: ['react', 'components', 'a11y', 'tailwind'],  url: '#' },
    ],
    awards: [
        { id: 1, title: 'Hackathon Champion',     issuer: 'HackMIT 2023',     date: 'Oct 2023', color: '#f59e0b' },
        { id: 2, title: "Dean's List",            issuer: 'Stanford University', date: 'Spring 2024', color: '#8b5cf6' },
        { id: 3, title: 'Google Developer Expert', issuer: 'Google',          date: 'Jan 2024', color: '#3b82f6' },
        { id: 4, title: 'Open Source Award',      issuer: 'GitHub',           date: 'Mar 2024', color: '#10b981' },
    ],
    activity: [
        { id: 1, type: 'commit', message: 'feat: add semantic search to neural-notes',           repo: 'alexchen/neural-notes',             time: '2 hours ago'  },
        { id: 2, type: 'pr',     message: 'Merged PR #47: Real-time collaboration feature',      repo: 'alexchen/devflow',                  time: '5 hours ago'  },
        { id: 3, type: 'star',   message: 'Starred vercel/next.js',                             repo: 'vercel/next.js',                    time: '1 day ago'    },
        { id: 4, type: 'issue',  message: 'Opened issue: Support for dark mode tokens',          repo: 'alexchen/openui',                   time: '2 days ago'   },
        { id: 5, type: 'commit', message: 'fix: portfolio optimizer convergence bug',             repo: 'alexchen/ml-portfolio-optimizer',   time: '3 days ago'   },
        { id: 6, type: 'fork',   message: 'Forked tailwindlabs/tailwindcss',                    repo: 'tailwindlabs/tailwindcss',          time: '4 days ago'   },
    ],
};

// ─── Contribution Graph ───────────────────────────────────────────────────────

function generateContributions(): number[][] {
    return Array.from({ length: 52 }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
            if (w === 51 && d > 4) return 0;
            const rand = Math.random();
            if (rand > 0.55) return 0;
            if (rand > 0.35) return 1;
            if (rand > 0.2) return 2;
            if (rand > 0.08) return 3;
            return 4;
        })
    );
}

const contributions = generateContributions();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CONTRIB_COLORS = [
    'bg-white/[0.04] border border-white/[0.06]',
    'bg-violet-900/60',
    'bg-violet-700/70',
    'bg-violet-500/80',
    'bg-violet-400',
];

function ContributionGraph() {
    const [hovered, setHovered] = useState<{ week: number; day: number } | null>(null);
    const total = contributions.flat().reduce((a, b) => a + b, 0);

    return (
        <GlassCard className="p-6" lift={false}>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/85">
                    <span className="tabular text-white">{total.toLocaleString()}</span> contributions this year
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/30">
                    <span>Less</span>
                    {CONTRIB_COLORS.map((c, i) => (
                        <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-0.75 mb-1 ml-8 overflow-x-auto">
                {MONTHS.map((m, i) => (
                    <div key={m} className="text-[10px] text-white/25 w-[calc(52/12*16px)] shrink-0" style={{ minWidth: 0 }}>
                        {i % 2 === 0 ? m : ''}
                    </div>
                ))}
            </div>

            <div className="flex gap-0.75 overflow-x-auto">
                <div className="mr-1 flex flex-col gap-0.75">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <div key={i} className="h-3.25 w-6 pr-1 text-right text-[10px] leading-3.25 text-white/25">
                            {d}
                        </div>
                    ))}
                </div>
                {contributions.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.75">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                role="gridcell"
                                aria-label={`${day} contributions`}
                                className={`h-3.25 w-3.25 cursor-pointer rounded-sm transition-all duration-100 ${CONTRIB_COLORS[day]} ${
                                    hovered?.week === wi && hovered?.day === di ? 'scale-125 ring-2 ring-violet-400/50' : ''
                                }`}
                                onMouseEnter={() => setHovered({ week: wi, day: di })}
                                onMouseLeave={() => setHovered(null)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

// ─── Activity icon ────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
    commit: { bg: 'bg-violet-500/15', color: 'text-violet-400', Icon: GitCommit },
    pr:     { bg: 'bg-pink-500/15',   color: 'text-pink-400',   Icon: GitPullRequest },
    issue:  { bg: 'bg-emerald-500/15',color: 'text-emerald-400',Icon: AlertCircle },
    star:   { bg: 'bg-amber-500/15',  color: 'text-amber-400',  Icon: Star },
    fork:   { bg: 'bg-blue-500/15',   color: 'text-blue-400',   Icon: GitFork },
};

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
    const { bg, color, Icon } = ACTIVITY_CONFIG[type];
    return (
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
            <Icon className="h-3.5 w-3.5" />
        </div>
    );
}

// ─── Skill level config ───────────────────────────────────────────────────────

const LEVEL_CONFIG = {
    expert:       { cls: 'border-violet-500/30 bg-violet-500/12 text-violet-300',   dot: 'bg-violet-400',  label: 'Expert' },
    advanced:     { cls: 'border-pink-500/30 bg-pink-500/12 text-pink-300',         dot: 'bg-pink-400',    label: 'Advanced' },
    intermediate: { cls: 'border-blue-500/30 bg-blue-500/12 text-blue-300',         dot: 'bg-blue-400',    label: 'Intermediate' },
    beginner:     { cls: 'border-white/10 bg-white/[0.04] text-white/45',           dot: 'bg-white/30',    label: 'Beginner' },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <GlassCard className="flex flex-col items-center justify-center px-4 py-5 text-center" lift={false}>
            <span className={`tabular text-2xl font-black ${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wider text-white/35">{label}</span>
        </GlassCard>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentProfile() {
    const [activeTab, setActiveTab] = useState<'projects' | 'activity'>('projects');

    return (
        <>
            <Head title={`${student.name} — AiKFS`} />

            <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#080810', color: '#fff' }}>
                <AmbientBackground />

                <div className="relative mx-auto max-w-300 px-4 py-8 sm:px-6 lg:px-10">

                    {/* ── Layout ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[272px_1fr]">

                        {/* ── Sidebar ─────────────────────────────────────── */}
                        <Reveal variants={slideLeft} className="flex flex-col gap-4">

                            {/* Identity card */}
                            <GlassCard className="p-6" lift={false}>
                                <div className="relative mb-5 w-fit">
                                    <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-violet-500/35 ring-offset-2 ring-offset-background">
                                        <img src={student.avatar} alt={student.name} width={80} height={80} className="h-full w-full object-cover" />
                                    </div>
                                    {student.isOnline && (
                                        <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-background" aria-label="Online" />
                                    )}
                                </div>

                                <h1 className="text-xl font-bold text-white">{student.name}</h1>
                                <p className="text-sm text-white/40 mt-0.5">@{student.username}</p>
                                <p className="mt-1 text-sm font-medium text-white/65">{student.title}</p>
                                <p className="mt-3 text-sm leading-relaxed text-white/50">{student.bio}</p>

                                {/* Meta */}
                                <div className="mt-5 flex flex-col gap-2.5 text-sm text-white/40">
                                    {[
                                        { Icon: MapPin,    text: student.location },
                                        { Icon: Building2, text: student.company },
                                        { Icon: Globe,     text: student.website },
                                    ].map(({ Icon, text }) => (
                                        <div key={text} className="flex items-center gap-2">
                                            <Icon className="h-3.5 w-3.5 shrink-0 text-white/25" />
                                            <span className="truncate">{text}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 text-white/25 text-xs">
                                        <Calendar className="h-3 w-3 shrink-0" />
                                        <span>Joined {student.joinedDate}</span>
                                    </div>
                                </div>

                                {/* Social links */}
                                <div className="mt-5 flex flex-col gap-2">
                                    {[
                                        { href: `https://${student.github}`,    Icon: Terminal,  label: student.github,    hover: 'hover:bg-white/[0.06]' },
                                        { href: `https://${student.linkedin}`,  Icon: Linkedin,  label: student.linkedin,  hover: 'hover:border-blue-500/30 hover:bg-blue-500/8' },
                                        { href: `https://${student.portfolio}`, Icon: ExternalLink, label: student.portfolio, hover: 'hover:border-violet-500/30 hover:bg-violet-500/8' },
                                    ].map(({ href, Icon, label, hover }) => (
                                        <a
                                            key={href}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group flex cursor-pointer items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-3 py-2.5 transition-all duration-200 ${hover}`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white/70" />
                                            <span className="truncate text-sm text-white/50 transition-colors group-hover:text-white/75">{label}</span>
                                        </a>
                                    ))}
                                </div>

                                {/* Followers */}
                                <div className="mt-5 flex items-center gap-5 text-sm">
                                    <span>
                                        <span className="tabular font-semibold text-white">{student.stats.followers}</span>
                                        <span className="ml-1 text-white/35">followers</span>
                                    </span>
                                    <span>
                                        <span className="tabular font-semibold text-white">{student.stats.following}</span>
                                        <span className="ml-1 text-white/35">following</span>
                                    </span>
                                </div>
                            </GlassCard>

                            {/* Awards */}
                            <GlassCard className="p-5" lift={false}>
                                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
                                    <Trophy className="h-4 w-4 text-amber-400" />
                                    Awards & Achievements
                                </h2>
                                <div className="flex flex-col gap-2">
                                    {student.awards.map((award, i) => (
                                        <motion.div
                                            key={award.id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex cursor-default items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/4"
                                        >
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                                style={{ background: `${award.color ?? '#8b5cf6'}20`, border: `1px solid ${award.color ?? '#8b5cf6'}30` }}
                                            >
                                                <Trophy className="h-4 w-4" style={{ color: award.color ?? '#8b5cf6' }} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium leading-tight text-white/80">{award.title}</p>
                                                <p className="truncate text-xs text-white/35">{award.issuer} · {award.date}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        </Reveal>

                        {/* ── Main content ─────────────────────────────────── */}
                        <div className="flex flex-col gap-5">

                            {/* Stats */}
                            <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <StatCard label="Repositories"  value={student.stats.repos}         color="text-violet-300" />
                                <StatCard label="Commits"       value={student.stats.commits}       color="text-pink-300" />
                                <StatCard label="Pull Requests" value={student.stats.pullRequests}  color="text-blue-300" />
                                <StatCard label="Stars Earned"  value={student.stats.stars}         color="text-amber-300" />
                            </Reveal>

                            {/* Contribution graph */}
                            <Reveal custom={1}>
                                <ContributionGraph />
                            </Reveal>

                            {/* Skills */}
                            <Reveal custom={2}>
                                <GlassCard className="p-6" lift={false}>
                                    <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/80">
                                        <Code2 className="h-4 w-4 text-violet-400" />
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {student.skills.map((skill, i) => {
                                            const cfg = LEVEL_CONFIG[skill.level];
                                            return (
                                                <motion.div
                                                    key={skill.name}
                                                    initial={{ opacity: 0, scale: 0.88 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.05 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                                    className={`group relative flex cursor-default items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${cfg.cls}`}
                                                    title={`${skill.name} — ${cfg.label}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                                                    {skill.name}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-white/30">
                                        {(Object.entries(LEVEL_CONFIG) as [Skill['level'], typeof LEVEL_CONFIG[Skill['level']]][]).map(([key, cfg]) => (
                                            <div key={key} className="flex items-center gap-1.5">
                                                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} aria-hidden="true" />
                                                {cfg.label}
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </Reveal>
                        </div>
                    </div>

                    {/* ── Bottom tab section ──────────────────────────────── */}
                    <Reveal custom={3} className="mt-5">
                        <GlassCard lift={false} className="overflow-hidden">
                            {/* Tab bar */}
                            <div className="flex border-b border-white/6" role="tablist">
                                {(['projects', 'activity'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        role="tab"
                                        aria-selected={activeTab === tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative cursor-pointer px-6 py-4 text-sm font-medium capitalize transition-all duration-200 ${
                                            activeTab === tab ? 'text-white' : 'text-white/35 hover:text-white/65'
                                        }`}
                                    >
                                        {tab === 'projects' ? (
                                            <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Projects</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> Activity</span>
                                        )}
                                        {activeTab === tab && (
                                            <motion.span
                                                layoutId="profile-tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-violet-500 to-purple-600"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6" role="tabpanel">
                                <AnimatePresence mode="wait">
                                    {/* ── Projects tab ─────────────────────── */}
                                    {activeTab === 'projects' && (
                                        <motion.div
                                            key="projects"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                        >
                                            {student.projects.map((project, i) => (
                                                <motion.a
                                                    key={project.id}
                                                    href={project.url}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                                    className="group block cursor-pointer rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-200 hover:border-white/12 hover:bg-white/4 hover:-translate-y-0.5"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 shrink-0 text-white/35" />
                                                            <span className="text-sm font-semibold text-violet-300 transition-colors group-hover:text-violet-200">
                                                                {project.name}
                                                            </span>
                                                        </div>
                                                        <ExternalLink className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-white/50" />
                                                    </div>

                                                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-white/45">{project.description}</p>

                                                    <div className="mb-4 flex flex-wrap gap-1.5">
                                                        {project.topics.map(topic => (
                                                            <span key={topic} className="rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-[10px] text-blue-300">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-white/30">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.languageColor }} />
                                                            <span>{project.language}</span>
                                                        </div>
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3" /> <span className="tabular">{project.stars}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <GitFork className="h-3 w-3" /> <span className="tabular">{project.forks}</span>
                                                        </span>
                                                        <span className="ml-auto">Updated {project.updatedAt}</span>
                                                    </div>
                                                </motion.a>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* ── Activity tab ─────────────────────── */}
                                    {activeTab === 'activity' && (
                                        <motion.div
                                            key="activity"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            className="relative"
                                        >
                                            <div className="absolute bottom-4 left-3.25 top-4 w-px bg-linear-to-b from-violet-500/40 via-purple-500/20 to-transparent" />
                                            <div className="flex flex-col gap-5">
                                                {student.activity.map((item, i) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                                                        className="relative flex items-start gap-4"
                                                    >
                                                        <ActivityIcon type={item.type} />
                                                        <div className="min-w-0 flex-1 pt-0.5">
                                                            <p className="text-sm leading-snug text-white/80">{item.message}</p>
                                                            <div className="mt-1.5 flex items-center gap-2">
                                                                <BookOpen className="h-3.5 w-3.5 shrink-0 text-white/20" />
                                                                <a href="#" className="truncate text-xs text-white/30 transition-colors hover:text-violet-400">
                                                                    {item.repo}
                                                                </a>
                                                                <span className="text-white/15 text-xs">·</span>
                                                                <span className="shrink-0 text-xs text-white/25">{item.time}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </Reveal>
                </div>
            </div>
        </>
    );
}
