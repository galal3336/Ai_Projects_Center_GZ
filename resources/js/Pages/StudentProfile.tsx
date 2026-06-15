import { Head } from '@inertiajs/react';
import { useState } from 'react';

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
    icon: string;
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
    stats: {
        repos: number;
        commits: number;
        pullRequests: number;
        stars: number;
        followers: number;
        following: number;
    };
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
    bio: 'Passionate about building scalable web applications and exploring AI/ML. Currently pursuing B.Sc. Computer Science. Open source contributor and hackathon enthusiast. Always learning, always shipping.',
    avatar: 'https://i.pravatar.cc/150?img=11',
    location: 'San Francisco, CA',
    company: 'Stanford University',
    website: 'alexchen.dev',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    portfolio: 'alexchen.dev/portfolio',
    joinedDate: 'August 2022',
    isOnline: true,
    stats: {
        repos: 47,
        commits: 1284,
        pullRequests: 93,
        stars: 342,
        followers: 218,
        following: 89,
    },
    skills: [
        { name: 'TypeScript', level: 'expert', category: 'Language' },
        { name: 'React', level: 'expert', category: 'Frontend' },
        { name: 'Laravel', level: 'advanced', category: 'Backend' },
        { name: 'Python', level: 'advanced', category: 'Language' },
        { name: 'Node.js', level: 'advanced', category: 'Backend' },
        { name: 'PostgreSQL', level: 'advanced', category: 'Database' },
        { name: 'Docker', level: 'intermediate', category: 'DevOps' },
        { name: 'GraphQL', level: 'intermediate', category: 'API' },
        { name: 'TensorFlow', level: 'intermediate', category: 'AI/ML' },
        { name: 'Redis', level: 'intermediate', category: 'Database' },
        { name: 'Next.js', level: 'advanced', category: 'Frontend' },
        { name: 'Tailwind CSS', level: 'expert', category: 'Frontend' },
    ],
    projects: [
        {
            id: 1,
            name: 'neural-notes',
            description: 'AI-powered note-taking app with semantic search, auto-tagging, and knowledge graph visualization.',
            language: 'TypeScript',
            languageColor: '#3178c6',
            stars: 128,
            forks: 23,
            updatedAt: '2 days ago',
            topics: ['ai', 'nextjs', 'openai', 'prisma'],
            url: '#',
        },
        {
            id: 2,
            name: 'devflow',
            description: 'GitHub-inspired project management tool built for student teams. Real-time collaboration.',
            language: 'PHP',
            languageColor: '#4f5d95',
            stars: 84,
            forks: 17,
            updatedAt: '1 week ago',
            topics: ['laravel', 'inertia', 'websockets', 'saas'],
            url: '#',
        },
        {
            id: 3,
            name: 'ml-portfolio-optimizer',
            description: 'Reinforcement learning agent for portfolio optimization using historical market data.',
            language: 'Python',
            languageColor: '#3572A5',
            stars: 67,
            forks: 11,
            updatedAt: '3 weeks ago',
            topics: ['ml', 'finance', 'rl', 'pytorch'],
            url: '#',
        },
        {
            id: 4,
            name: 'openui',
            description: 'Open source component library with 50+ accessible React components and dark mode support.',
            language: 'TypeScript',
            languageColor: '#3178c6',
            stars: 63,
            forks: 19,
            updatedAt: '4 days ago',
            topics: ['react', 'components', 'a11y', 'tailwind'],
            url: '#',
        },
    ],
    awards: [
        { id: 1, title: 'Hackathon Champion', issuer: 'HackMIT 2023', date: 'Oct 2023', icon: '🏆' },
        { id: 2, title: 'Dean\'s List', issuer: 'Stanford University', date: 'Spring 2024', icon: '🎓' },
        { id: 3, title: 'Google Developer Expert', issuer: 'Google', date: 'Jan 2024', icon: '⭐' },
        { id: 4, title: 'Open Source Award', issuer: 'GitHub', date: 'Mar 2024', icon: '🌟' },
    ],
    activity: [
        { id: 1, type: 'commit', message: 'feat: add semantic search to neural-notes', repo: 'alexchen/neural-notes', time: '2 hours ago' },
        { id: 2, type: 'pr', message: 'Merged PR #47: Real-time collaboration feature', repo: 'alexchen/devflow', time: '5 hours ago' },
        { id: 3, type: 'star', message: 'Starred vercel/next.js', repo: 'vercel/next.js', time: '1 day ago' },
        { id: 4, type: 'issue', message: 'Opened issue: Support for dark mode tokens', repo: 'alexchen/openui', time: '2 days ago' },
        { id: 5, type: 'commit', message: 'fix: portfolio optimizer convergence bug', repo: 'alexchen/ml-portfolio-optimizer', time: '3 days ago' },
        { id: 6, type: 'fork', message: 'Forked tailwindlabs/tailwindcss', repo: 'tailwindlabs/tailwindcss', time: '4 days ago' },
    ],
};

// ─── Contribution Graph ───────────────────────────────────────────────────────

function generateContributions(): number[][] {
    const weeks = 52;
    const days = 7;
    return Array.from({ length: weeks }, (_, w) =>
        Array.from({ length: days }, (_, d) => {
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
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ContributionGraph() {
    const [hovered, setHovered] = useState<{ week: number; day: number } | null>(null);

    const cellColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-[#161b22] border border-[#21262d]';
            case 1: return 'bg-[#0e4429]';
            case 2: return 'bg-[#006d32]';
            case 3: return 'bg-[#26a641]';
            case 4: return 'bg-[#39d353]';
            default: return 'bg-[#161b22]';
        }
    };

    const totalContribs = contributions.flat().reduce((a, b) => a + b, 0);

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white/90">
                    {totalContribs.toLocaleString()} contributions in the last year
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className={`w-3 h-3 rounded-sm ${cellColor(l)}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Month labels */}
            <div className="flex gap-[3px] mb-1 ml-8">
                {months.map((m, i) => (
                    <div key={m} className="text-[10px] text-white/30 w-[calc(52/12*15px)]" style={{ minWidth: 0 }}>
                        {i % 2 === 0 ? m : ''}
                    </div>
                ))}
            </div>

            <div className="flex gap-[3px]">
                {/* Day labels */}
                <div className="flex flex-col gap-[3px] mr-1">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <div key={i} className="text-[10px] text-white/30 h-[13px] leading-[13px] w-6 text-right pr-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {contributions.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className={`w-[13px] h-[13px] rounded-sm cursor-pointer transition-all duration-150 ${cellColor(day)} ${
                                    hovered?.week === wi && hovered?.day === di ? 'ring-2 ring-white/30 scale-110' : ''
                                }`}
                                onMouseEnter={() => setHovered({ week: wi, day: di })}
                                onMouseLeave={() => setHovered(null)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
    const configs = {
        commit: { bg: 'bg-purple-500/20', color: 'text-purple-400', icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z"/>
            </svg>
        )},
        pr: { bg: 'bg-pink-500/20', color: 'text-pink-400', icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354z"/>
            </svg>
        )},
        issue: { bg: 'bg-emerald-500/20', color: 'text-emerald-400', icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z"/>
            </svg>
        )},
        star: { bg: 'bg-yellow-500/20', color: 'text-yellow-400', icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
            </svg>
        )},
        fork: { bg: 'bg-blue-500/20', color: 'text-blue-400', icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z"/>
            </svg>
        )},
    };
    const { bg, color, icon } = configs[type];
    return (
        <div className={`w-7 h-7 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
            {icon}
        </div>
    );
}

// ─── Skill Level ──────────────────────────────────────────────────────────────

function skillBadgeStyle(level: Skill['level']) {
    switch (level) {
        case 'expert':      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
        case 'advanced':    return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
        case 'intermediate': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
        case 'beginner':    return 'bg-white/5 text-white/50 border-white/10';
    }
}

// ─── Mini Stat Bar ────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-center">
            <span className={`text-2xl font-bold tabular-nums ${accent}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
            <span className="mt-1 text-xs text-white/40 uppercase tracking-wider">{label}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentProfile() {
    const [activeTab, setActiveTab] = useState<'projects' | 'activity'>('projects');

    return (
        <>
            <Head title={`${student.name} — Student Profile`} />

            {/* Background */}
            <div className="min-h-screen bg-[#0d1117] text-white relative overflow-x-hidden">

                {/* Ambient gradient orbs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
                    <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-pink-600/8 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
                </div>

                <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                    {/* ── TOP BENTO GRID ──────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 mb-5">

                        {/* ── PROFILE SIDEBAR ─────────────────────────────── */}
                        <div className="flex flex-col gap-4">

                            {/* Avatar + Identity */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6">
                                {/* Avatar */}
                                <div className="relative w-fit mb-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-purple-500/40 ring-offset-2 ring-offset-[#0d1117]">
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                            width={80}
                                            height={80}
                                        />
                                    </div>
                                    {student.isOnline && (
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0d1117]" aria-label="Online" />
                                    )}
                                </div>

                                <h1 className="text-xl font-bold text-white">{student.name}</h1>
                                <p className="text-sm text-white/50 mt-0.5">@{student.username}</p>
                                <p className="text-sm text-white/70 mt-1 font-medium">{student.title}</p>

                                <p className="text-sm text-white/55 mt-3 leading-relaxed">{student.bio}</p>

                                {/* Meta */}
                                <div className="mt-4 flex flex-col gap-2 text-sm text-white/45">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M11.536 3.464a5 5 0 0 1 0 7.072L8 14.07l-3.536-3.534a5 5 0 1 1 7.072-7.072zM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                                        </svg>
                                        <span>{student.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16Zm1.45-2H14v-4H3.2Z"/>
                                        </svg>
                                        <span>{student.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z"/>
                                        </svg>
                                        <span className="truncate">{student.website}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/30 text-xs mt-1">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"/>
                                        </svg>
                                        <span>Joined {student.joinedDate}</span>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="mt-5 flex flex-col gap-2">
                                    <a
                                        href={`https://${student.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer group"
                                    >
                                        <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                                        </svg>
                                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors truncate">{student.github}</span>
                                    </a>
                                    <a
                                        href={`https://${student.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/30 transition-all duration-200 cursor-pointer group"
                                    >
                                        <svg className="w-4 h-4 text-white/60 group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        <span className="text-sm text-white/60 group-hover:text-blue-300 transition-colors truncate">{student.linkedin}</span>
                                    </a>
                                    <a
                                        href={`https://${student.portfolio}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-purple-500/10 border border-white/[0.06] hover:border-purple-500/30 transition-all duration-200 cursor-pointer group"
                                    >
                                        <svg className="w-4 h-4 text-white/60 group-hover:text-purple-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                        <span className="text-sm text-white/60 group-hover:text-purple-300 transition-colors truncate">{student.portfolio}</span>
                                    </a>
                                </div>

                                {/* Follower counts */}
                                <div className="mt-4 flex items-center gap-4 text-sm">
                                    <span className="text-white/70">
                                        <span className="font-semibold text-white">{student.stats.followers}</span>
                                        <span className="text-white/40 ml-1">followers</span>
                                    </span>
                                    <span className="text-white/70">
                                        <span className="font-semibold text-white">{student.stats.following}</span>
                                        <span className="text-white/40 ml-1">following</span>
                                    </span>
                                </div>
                            </div>

                            {/* Awards */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5">
                                <h2 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
                                    </svg>
                                    Awards & Achievements
                                </h2>
                                <div className="flex flex-col gap-2.5">
                                    {student.awards.map(award => (
                                        <div key={award.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-default">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center text-base flex-shrink-0">
                                                <span role="img" aria-hidden="true">{award.icon}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white/80 leading-tight truncate">{award.title}</p>
                                                <p className="text-xs text-white/40 truncate">{award.issuer} · {award.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── MAIN CONTENT ─────────────────────────────────── */}
                        <div className="flex flex-col gap-5">

                            {/* Statistics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard label="Repositories" value={student.stats.repos} accent="text-purple-300" />
                                <StatCard label="Commits" value={student.stats.commits} accent="text-pink-300" />
                                <StatCard label="Pull Requests" value={student.stats.pullRequests} accent="text-blue-300" />
                                <StatCard label="Stars Earned" value={student.stats.stars} accent="text-yellow-300" />
                            </div>

                            {/* Contribution Graph */}
                            <ContributionGraph />

                            {/* Skills */}
                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6">
                                <h2 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM1 5.5a4.5 4.5 0 1 1 8.54 1.41l4.78 4.78a.75.75 0 0 1-1.06 1.06L8.47 7.98A4.5 4.5 0 0 1 1 5.5z"/>
                                    </svg>
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map(skill => (
                                        <div
                                            key={skill.name}
                                            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-default hover:scale-105 ${skillBadgeStyle(skill.level)}`}
                                        >
                                            <span>{skill.name}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] capitalize ml-0.5">
                                                · {skill.level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center gap-5 text-xs text-white/30">
                                    {(['expert', 'advanced', 'intermediate', 'beginner'] as const).map(level => (
                                        <div key={level} className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${skillBadgeStyle(level).split(' ')[0].replace('bg-', 'bg-').replace('/15', '/60')}`} />
                                            <span className="capitalize">{level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── BOTTOM TABS ──────────────────────────────────────── */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">

                        {/* Tab Header */}
                        <div className="flex border-b border-white/[0.06]">
                            {(['projects', 'activity'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-sm font-medium capitalize transition-all duration-200 cursor-pointer relative ${
                                        activeTab === tab
                                            ? 'text-white'
                                            : 'text-white/40 hover:text-white/70'
                                    }`}
                                    aria-selected={activeTab === tab}
                                    role="tab"
                                >
                                    {tab === 'projects' ? 'Projects' : 'Activity Timeline'}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6" role="tabpanel">
                            {/* ── PROJECTS ─────────────────────────────────── */}
                            {activeTab === 'projects' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {student.projects.map(project => (
                                        <a
                                            key={project.id}
                                            href={project.url}
                                            className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] p-5 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/>
                                                    </svg>
                                                    <span className="text-sm font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">
                                                        {project.name}
                                                    </span>
                                                </div>
                                                <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                                                </svg>
                                            </div>

                                            <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                                            {/* Topics */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {project.topics.map(topic => (
                                                    <span key={topic} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center gap-4 text-xs text-white/35">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.languageColor }} />
                                                    <span>{project.language}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                                                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
                                                    </svg>
                                                    <span>{project.stars}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                                                        <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z"/>
                                                    </svg>
                                                    <span>{project.forks}</span>
                                                </div>
                                                <span className="ml-auto">Updated {project.updatedAt}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* ── ACTIVITY TIMELINE ─────────────────────────── */}
                            {activeTab === 'activity' && (
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-[13px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/40 via-pink-500/20 to-transparent" />

                                    <div className="flex flex-col gap-5">
                                        {student.activity.map((item, index) => (
                                            <div key={item.id} className="flex items-start gap-4 relative">
                                                <ActivityIcon type={item.type} />
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <p className="text-sm text-white/80 leading-snug">{item.message}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <svg className="w-3.5 h-3.5 text-white/25 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                                                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/>
                                                        </svg>
                                                        <a href="#" className="text-xs text-white/35 hover:text-purple-400 transition-colors cursor-pointer">
                                                            {item.repo}
                                                        </a>
                                                        <span className="text-white/20 text-xs">·</span>
                                                        <span className="text-xs text-white/25">{item.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-white/20 mt-6">
                        Built with Laravel · Inertia · React · Tailwind CSS
                    </p>
                </div>
            </div>
        </>
    );
}
