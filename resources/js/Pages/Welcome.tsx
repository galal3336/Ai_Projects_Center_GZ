import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Brain,
    ChevronRight,
    Code2,
    Crown,
    ExternalLink,
    GitFork,
    Globe,
    Medal,
    Sparkles,
    Star,
    Trophy,
    Users,
    Zap,
    BookOpen,
    Cpu,
    Eye,
    FlaskConical,
    Network,
    Shield,
    TrendingUp,
    Award,
    BarChart3,
    GraduationCap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WelcomeProps {
    auth: { user: { name: string; email: string } | null };
}

// ─── Static mock data (replace with Inertia props later) ─────────────────────

const STATS = [
    { value: '2,400+', label: 'AI Projects', icon: Brain },
    { value: '1,800+', label: 'Students', icon: GraduationCap },
    { value: '48', label: 'Universities', icon: Globe },
    { value: '12', label: 'Competitions', icon: Trophy },
];

const CATEGORIES = [
    { name: 'Computer Vision', icon: Eye, count: 342, color: 'from-violet-500/20 to-purple-500/10', accent: '#8b5cf6' },
    { name: 'Natural Language', icon: BookOpen, count: 287, color: 'from-blue-500/20 to-cyan-500/10', accent: '#3b82f6' },
    { name: 'Machine Learning', icon: Brain, count: 415, color: 'from-emerald-500/20 to-teal-500/10', accent: '#10b981' },
    { name: 'Robotics & AI', icon: Cpu, count: 198, color: 'from-orange-500/20 to-amber-500/10', accent: '#f59e0b' },
    { name: 'Neural Networks', icon: Network, count: 263, color: 'from-pink-500/20 to-rose-500/10', accent: '#ec4899' },
    { name: 'AI Security', icon: Shield, count: 124, color: 'from-red-500/20 to-rose-500/10', accent: '#ef4444' },
    { name: 'Data Science', icon: BarChart3, count: 391, color: 'from-indigo-500/20 to-blue-500/10', accent: '#6366f1' },
    { name: 'Generative AI', icon: Sparkles, count: 176, color: 'from-amber-500/20 to-yellow-500/10', accent: '#f59e0b' },
];

const FEATURED_PROJECTS = [
    {
        id: 1,
        title: 'NeuroVision: Real-time Medical Imaging AI',
        description: 'A transformer-based system achieving 97.3% accuracy in detecting early-stage tumors from MRI scans, outperforming radiologists in controlled trials.',
        category: 'Computer Vision',
        author: 'Sara Al-Rashid',
        university: 'KFUPM',
        stars: 847,
        views: 12400,
        tags: ['PyTorch', 'ViT', 'DICOM', 'FastAPI'],
        gradient: 'from-violet-600/30 via-purple-600/20 to-transparent',
        accentColor: '#8b5cf6',
        featured: true,
    },
    {
        id: 2,
        title: 'ArabiGPT: Arabic LLM Fine-tuning Framework',
        description: 'Fine-tuned LLaMA-3 on 40B Arabic tokens achieving state-of-the-art scores on ArabicNLU benchmark. Open-sourced with training recipes.',
        category: 'Natural Language',
        author: 'Omar Khalil',
        university: 'KAU',
        stars: 1203,
        views: 28600,
        tags: ['LLaMA', 'HuggingFace', 'CUDA', 'LoRA'],
        gradient: 'from-blue-600/30 via-cyan-600/20 to-transparent',
        accentColor: '#3b82f6',
        featured: true,
    },
    {
        id: 3,
        title: 'ClimateNet: Predicting Extreme Weather Events',
        description: 'Graph neural network trained on 30 years of satellite data predicting extreme weather events 72 hours in advance with 89% precision.',
        category: 'Machine Learning',
        author: 'Nour Hassan',
        university: 'KAUST',
        stars: 634,
        views: 9800,
        tags: ['GNN', 'PyG', 'ERA5', 'Docker'],
        gradient: 'from-emerald-600/30 via-teal-600/20 to-transparent',
        accentColor: '#10b981',
        featured: false,
    },
];

const LATEST_PROJECTS = [
    { id: 4, title: 'DeepDrive: Autonomous Navigation in Sand Dunes', category: 'Robotics', author: 'Khalid M.', stars: 124, daysAgo: 1 },
    { id: 5, title: 'SignLingua: ASL-to-Text Real-Time Translation', category: 'Computer Vision', author: 'Reem A.', stars: 89, daysAgo: 2 },
    { id: 6, title: 'CropAI: Precision Agriculture Disease Detection', category: 'Machine Learning', author: 'Youssef T.', stars: 201, daysAgo: 2 },
    { id: 7, title: 'SecureGPT: Privacy-Preserving LLM Inference', category: 'AI Security', author: 'Lina K.', stars: 156, daysAgo: 3 },
    { id: 8, title: 'BioSynth: Protein Structure Prediction Tool', category: 'Data Science', author: 'Ahmed R.', stars: 312, daysAgo: 4 },
    { id: 9, title: 'EduBot: Adaptive Learning with Reinforcement AI', category: 'NLP', author: 'Fatima Z.', stars: 98, daysAgo: 5 },
];

const WINNING_PROJECTS = [
    {
        rank: 1,
        title: 'NeuroVision: Real-time Medical Imaging AI',
        author: 'Sara Al-Rashid',
        university: 'KFUPM',
        competition: 'National AI Fair 2024',
        prize: '$15,000',
        category: 'Computer Vision',
    },
    {
        rank: 2,
        title: 'ArabiGPT: Arabic LLM Fine-tuning Framework',
        author: 'Omar Khalil',
        university: 'KAU',
        competition: 'National AI Fair 2024',
        prize: '$10,000',
        category: 'Natural Language',
    },
    {
        rank: 3,
        title: 'ClimateNet: Predicting Extreme Weather Events',
        author: 'Nour Hassan',
        university: 'KAUST',
        competition: 'National AI Fair 2024',
        prize: '$7,500',
        category: 'Machine Learning',
    },
];

const TOP_STUDENTS = [
    { rank: 1, name: 'Sara Al-Rashid', university: 'KFUPM', projects: 7, wins: 3, points: 9840, avatar: 'SA' },
    { rank: 2, name: 'Omar Khalil', university: 'KAU', projects: 5, wins: 2, points: 8720, avatar: 'OK' },
    { rank: 3, name: 'Nour Hassan', university: 'KAUST', projects: 9, wins: 2, points: 7950, avatar: 'NH' },
    { rank: 4, name: 'Khalid Mohammed', university: 'KFUPM', projects: 6, wins: 1, points: 6430, avatar: 'KM' },
    { rank: 5, name: 'Reem Abdullah', university: 'KSU', projects: 4, wins: 1, points: 5870, avatar: 'RA' },
];

const HALL_OF_FAME = [
    { year: '2024', winner: 'Sara Al-Rashid', project: 'NeuroVision', university: 'KFUPM', avatar: 'SA' },
    { year: '2023', winner: 'Ahmad Al-Zahrани', project: 'ArabicBERT+', university: 'KAUST', avatar: 'AZ' },
    { year: '2022', winner: 'Mona Al-Otaibi', project: 'DroneSwarm AI', university: 'KAU', avatar: 'MO' },
    { year: '2021', winner: 'Faisal Al-Ghamdi', project: 'HealthPredict', university: 'KFUPM', avatar: 'FG' },
];

const SPONSORS = [
    { name: 'Saudi Aramco', tier: 'platinum' },
    { name: 'SABIC', tier: 'platinum' },
    { name: 'STC', tier: 'gold' },
    { name: 'Neom', tier: 'gold' },
    { name: 'Salam', tier: 'gold' },
    { name: 'AWS', tier: 'silver' },
    { name: 'Google', tier: 'silver' },
    { name: 'Microsoft', tier: 'silver' },
    { name: 'NVIDIA', tier: 'silver' },
];

// ─── Utility Components ───────────────────────────────────────────────────────

function GrainTexture() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '128px 128px',
            }}
        />
    );
}

function MeshGradient() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute -top-[40%] left-[20%] h-[70%] w-[60%] rounded-full opacity-[0.07] blur-[120px]"
                style={{ background: 'radial-gradient(circle, #7c3aed 0%, #3b82f6 50%, transparent 100%)' }}
            />
            <div
                className="absolute top-[20%] -right-[10%] h-[50%] w-[40%] rounded-full opacity-[0.05] blur-[100px]"
                style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 100%)' }}
            />
            <div
                className="absolute -bottom-[20%] left-[10%] h-[50%] w-[50%] rounded-full opacity-[0.04] blur-[100px]"
                style={{ background: 'radial-gradient(circle, #3b82f6 0%, #7c3aed 50%, transparent 100%)' }}
            />
        </div>
    );
}

function Tag({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/50 transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300">
            {children}
        </span>
    );
}

function SectionLabel({ children }: { children: string }) {
    return (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="text-xs font-medium tracking-widest text-violet-400 uppercase">{children}</span>
        </div>
    );
}

function ProjectCard({ project }: { project: (typeof FEATURED_PROJECTS)[0] }) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
            {project.featured && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300">
                    <Sparkles className="h-3 w-3" />
                    Featured
                </div>
            )}
            <div className="relative">
                <span
                    className="mb-3 inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ background: `${project.accentColor}20`, color: project.accentColor }}
                >
                    {project.category}
                </span>
                <h3 className="mb-2 text-[15px] font-semibold leading-snug text-white/90 transition-colors group-hover:text-white">
                    {project.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-white/40">{project.description}</p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}88)` }}
                        >
                            {project.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="text-[13px] font-medium text-white/70">{project.author}</div>
                            <div className="text-[11px] text-white/30">{project.university}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/30">
                        <span className="flex items-center gap-1 text-[12px]">
                            <Star className="h-3 w-3" />
                            {project.stars.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[12px]">
                            <Eye className="h-3 w-3" />
                            {(project.views / 1000).toFixed(1)}k
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ user }: { user: WelcomeProps['auth']['user'] }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? 'rgba(10, 10, 10, 0.85)'
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
        >
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                        <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">
                        Ai<span className="text-violet-400">KFS</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-7 md:flex">
                    {['Projects', 'Students', 'Categories', 'Sponsors'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                            className="text-[13px] font-medium text-white/50 transition-colors hover:text-white/90"
                        >
                            {item}
                        </a>
                    ))}
                    <Link
                        href="/hall-of-fame"
                        className="flex items-center gap-1 text-[13px] font-semibold text-amber-400/80 transition-colors hover:text-amber-300"
                    >
                        <Trophy className="h-3.5 w-3.5" />
                        Hall of Fame
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20"
                        >
                            Dashboard <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-[13px] font-medium text-white/60 transition-colors hover:text-white"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-white px-4 py-1.5 text-[13px] font-semibold text-black transition-all hover:bg-white/90"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ user }: { user: WelcomeProps['auth']['user'] }) {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-14">
            <MeshGradient />

            {/* Grid lines overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl text-center">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-4 py-1.5 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                    </span>
                    <span className="text-xs font-medium text-violet-300">National AI Competition 2025 — Now Open</span>
                    <ChevronRight className="h-3.5 w-3.5 text-violet-400" />
                </div>

                {/* Headline */}
                <h1 className="mb-6 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-tight text-white">
                    Where Brilliant{' '}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #3b82f6 100%)' }}
                    >
                        AI Projects
                    </span>
                    <br />
                    Meet the World
                </h1>

                {/* Subheadline */}
                <p className="mx-auto mb-10 max-w-2xl text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-white/45">
                    AiKFS is the premier showcase for student AI research and innovation — connecting
                    brilliant minds, prestigious competitions, and industry-defining breakthroughs.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:-translate-y-0.5"
                        >
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/register"
                                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:-translate-y-0.5"
                            >
                                Submit Your Project
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="#projects"
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                            >
                                Explore Projects
                            </Link>
                        </>
                    )}
                </div>

                {/* Social proof */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/30">
                    {STATS.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5 text-violet-500" />
                                <span className="text-2xl font-bold text-white/80">{value}</span>
                            </div>
                            <span className="text-xs font-medium tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </section>
    );
}

// ─── Statistics Section ───────────────────────────────────────────────────────

function Statistics() {
    return (
        <section id="statistics" className="relative border-y border-white/[0.05] py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-2 gap-px rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden md:grid-cols-4">
                    {[
                        { value: '2,400+', label: 'Projects Submitted', sub: 'Across all competitions', icon: Code2, color: '#8b5cf6' },
                        { value: '1,800+', label: 'Active Students', sub: 'From 48 universities', icon: Users, color: '#3b82f6' },
                        { value: '$180K+', label: 'Total Prizes Awarded', sub: 'Since 2019', icon: Trophy, color: '#f59e0b' },
                        { value: '97.3%', label: 'Best Model Accuracy', sub: 'NeuroVision 2024', icon: TrendingUp, color: '#10b981' },
                    ].map(({ value, label, sub, icon: Icon, color }) => (
                        <div key={label} className="group flex flex-col items-center gap-2 p-8 text-center transition-colors hover:bg-white/[0.02]">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                                <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div className="text-3xl font-black tracking-tight text-white" style={{ WebkitTextFillColor: 'white' }}>
                                {value}
                            </div>
                            <div className="text-sm font-semibold text-white/70">{label}</div>
                            <div className="text-xs text-white/30">{sub}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Featured Projects ────────────────────────────────────────────────────────

function FeaturedProjects() {
    return (
        <section id="projects" className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <SectionLabel>Featured Projects</SectionLabel>
                        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Cutting-edge AI Research
                        </h2>
                        <p className="mt-3 text-sm text-white/40">
                            Handpicked by our panel of expert judges from industry and academia.
                        </p>
                    </div>
                    <a
                        href="#"
                        className="hidden items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300 sm:flex"
                    >
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURED_PROJECTS.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
            </div>
        </section>
    );
}

// ─── Latest Projects ──────────────────────────────────────────────────────────

function LatestProjects() {
    return (
        <section className="relative py-16 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <SectionLabel>Latest Submissions</SectionLabel>
                        <h2 className="text-2xl font-black tracking-tight text-white">Fresh From the Community</h2>
                    </div>
                    <a href="#" className="hidden items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 sm:flex">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    {LATEST_PROJECTS.map((project, i) => (
                        <a
                            key={project.id}
                            href="#"
                            className="group flex items-center justify-between gap-4 border-b border-white/[0.05] px-6 py-4 transition-colors hover:bg-white/[0.03] last:border-b-0"
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-5 text-right text-xs font-mono font-bold text-white/20">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <div className="text-[13px] font-semibold text-white/80 transition-colors group-hover:text-white">
                                        {project.title}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-white/30">
                                        <span>{project.author}</span>
                                        <span>·</span>
                                        <span className="rounded-sm bg-white/5 px-1.5 py-0.5 text-[10px] font-medium">
                                            {project.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/30">
                                <span className="hidden items-center gap-1 sm:flex">
                                    <Star className="h-3 w-3 text-amber-500/60" />
                                    {project.stars}
                                </span>
                                <span className="shrink-0">
                                    {project.daysAgo === 1 ? 'Yesterday' : `${project.daysAgo}d ago`}
                                </span>
                                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Winning Projects ─────────────────────────────────────────────────────────

function WinningProjects() {
    const rankConfig = [
        { icon: Crown, color: '#f59e0b', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', label: '1st Place' },
        { icon: Medal, color: '#94a3b8', bg: 'from-slate-400/15 to-slate-400/5', border: 'border-slate-400/15', label: '2nd Place' },
        { icon: Award, color: '#cd7c30', bg: 'from-orange-700/15 to-orange-700/5', border: 'border-orange-700/15', label: '3rd Place' },
    ];

    return (
        <section id="winning-projects" className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                    <SectionLabel>Competition Winners</SectionLabel>
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        National AI Fair 2024 — Podium
                    </h2>
                    <p className="mt-3 text-sm text-white/40">
                        The most impactful AI projects selected by our international jury.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {WINNING_PROJECTS.map((project, i) => {
                        const cfg = rankConfig[i];
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={project.rank}
                                className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-gradient-to-b ${cfg.bg} p-6 ${i === 0 ? 'md:-mt-4' : ''}`}
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${cfg.color}20` }}>
                                        <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                                    </div>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                                        style={{ background: `${cfg.color}20`, color: cfg.color }}
                                    >
                                        {cfg.label}
                                    </span>
                                </div>

                                <h3 className="mb-1 text-[15px] font-bold leading-snug text-white/90">{project.title}</h3>
                                <p className="mb-4 text-xs text-white/40">{project.competition}</p>

                                <div className="mb-4 flex items-center gap-2.5">
                                    <div
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}88)` }}
                                    >
                                        {project.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-medium text-white/70">{project.author}</div>
                                        <div className="text-[11px] text-white/30">{project.university}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/50">
                                        {project.category}
                                    </span>
                                    <span className="text-sm font-black" style={{ color: cfg.color }}>
                                        {project.prize}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function Categories() {
    return (
        <section id="categories" className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <SectionLabel>Browse by Category</SectionLabel>
                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Explore Every Field of AI
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {CATEGORIES.map(({ name, icon: Icon, count, color, accent }) => (
                        <a
                            key={name}
                            href="#"
                            className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br ${color} p-5 transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5`}
                        >
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}20` }}>
                                <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
                            </div>
                            <div className="text-[13px] font-semibold text-white/80 transition-colors group-hover:text-white">
                                {name}
                            </div>
                            <div className="mt-1 text-xs text-white/30">{count} projects</div>
                            <ChevronRight
                                className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/0 transition-all group-hover:text-white/30 group-hover:translate-x-0.5"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Top Students ─────────────────────────────────────────────────────────────

function TopStudents() {
    const rankColors = ['#f59e0b', '#94a3b8', '#cd7c30', '#6b7280', '#6b7280'];

    return (
        <section id="students" className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    <div>
                        <SectionLabel>Top Students</SectionLabel>
                        <h2 className="mb-3 text-3xl font-black tracking-tight text-white">
                            This Season's Leaderboard
                        </h2>
                        <p className="mb-8 text-sm text-white/40 max-w-lg">
                            Points are awarded based on project quality, peer reviews, and competition placements.
                        </p>

                        <div className="space-y-2">
                            {TOP_STUDENTS.map((student, i) => (
                                <div
                                    key={student.rank}
                                    className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:border-white/[0.09] hover:bg-white/[0.04]"
                                >
                                    <span
                                        className="w-6 text-center text-sm font-black"
                                        style={{ color: rankColors[i] }}
                                    >
                                        {student.rank}
                                    </span>
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, ${rankColors[i]}88, ${rankColors[i]}44)`, border: `1px solid ${rankColors[i]}33` }}
                                    >
                                        {student.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold text-white/80 group-hover:text-white truncate">
                                            {student.name}
                                        </div>
                                        <div className="text-[11px] text-white/30">{student.university}</div>
                                    </div>
                                    <div className="hidden gap-6 text-center sm:flex">
                                        <div>
                                            <div className="text-[13px] font-bold text-white/60">{student.projects}</div>
                                            <div className="text-[10px] text-white/25">Projects</div>
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-white/60">{student.wins}</div>
                                            <div className="text-[10px] text-white/25">Wins</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black" style={{ color: rankColors[i] }}>
                                            {student.points.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-white/25">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bento card: submission prompt */}
                    <div className="flex flex-col gap-4">
                        <div className="relative flex-1 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-600/15 to-violet-600/5 p-6">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-30"
                                style={{ background: 'radial-gradient(ellipse at 50% 0%, #7c3aed44, transparent 70%)' }}
                            />
                            <div className="relative">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20">
                                    <Zap className="h-6 w-6 text-violet-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-black text-white">Ready to compete?</h3>
                                <p className="mb-6 text-sm text-white/45 leading-relaxed">
                                    Submit your AI project and compete against the brightest student minds in the region.
                                </p>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500"
                                >
                                    Submit Project <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <FlaskConical className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-semibold text-white/70">Next Competition</span>
                            </div>
                            <div className="mb-1 text-lg font-black text-white">AI Innovation Fair 2025</div>
                            <div className="mb-4 text-xs text-white/30">Submissions close Nov 30, 2025</div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                                    style={{ width: '34%' }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] text-white/25">
                                <span>847 submitted</span>
                                <span>2,500 goal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Hall of Fame ─────────────────────────────────────────────────────────────

function HallOfFame() {
    return (
        <section id="hall-of-fame" className="relative py-24 px-6 overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{ background: 'radial-gradient(ellipse at 50% 50%, #f59e0b, transparent 70%)' }}
            />
            <div className="mx-auto max-w-7xl relative">
                <div className="mb-12 text-center">
                    <SectionLabel>Hall of Fame</SectionLabel>
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Legends of AiKFS
                    </h2>
                    <p className="mt-3 text-sm text-white/40">
                        Grand Champions who redefined what's possible in student AI.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {HALL_OF_FAME.map((entry) => (
                        <div
                            key={entry.year}
                            className="group relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-b from-amber-500/10 to-amber-500/3 p-6 transition-all hover:border-amber-500/25 hover:-translate-y-0.5"
                        >
                            <div className="absolute right-4 top-4 text-xs font-black text-amber-500/40">{entry.year}</div>
                            <Crown className="mb-4 h-6 w-6 text-amber-500" />
                            <div
                                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #f59e0b88, #f59e0b44)', border: '1px solid #f59e0b33' }}
                            >
                                {entry.avatar}
                            </div>
                            <div className="text-[15px] font-bold text-white/85">{entry.winner}</div>
                            <div className="mt-0.5 text-xs text-amber-400/70 font-medium">{entry.project}</div>
                            <div className="mt-1 text-[11px] text-white/30">{entry.university}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────

function Sponsors() {
    const platinum = SPONSORS.filter(s => s.tier === 'platinum');
    const gold = SPONSORS.filter(s => s.tier === 'gold');
    const silver = SPONSORS.filter(s => s.tier === 'silver');

    return (
        <section id="sponsors" className="relative py-24 px-6 border-t border-white/[0.05]">
            <div className="mx-auto max-w-5xl text-center">
                <SectionLabel>Partners & Sponsors</SectionLabel>
                <h2 className="mb-12 text-2xl font-black tracking-tight text-white">
                    Backed by Industry Leaders
                </h2>

                {/* Platinum */}
                <div className="mb-10">
                    <div className="mb-4 text-[11px] font-semibold tracking-widest text-white/20 uppercase">Platinum</div>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {platinum.map(s => (
                            <div
                                key={s.name}
                                className="flex h-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 text-base font-black text-white/60 transition-all hover:border-white/15 hover:text-white/90 hover:bg-white/[0.05]"
                            >
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gold */}
                <div className="mb-10">
                    <div className="mb-4 text-[11px] font-semibold tracking-widest text-white/20 uppercase">Gold</div>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {gold.map(s => (
                            <div
                                key={s.name}
                                className="flex h-12 items-center justify-center rounded-lg border border-amber-500/10 bg-amber-500/[0.04] px-6 text-sm font-semibold text-white/50 transition-all hover:border-amber-500/20 hover:text-white/80"
                            >
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Silver */}
                <div>
                    <div className="mb-4 text-[11px] font-semibold tracking-widest text-white/20 uppercase">Technology Partners</div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {silver.map(s => (
                            <div
                                key={s.name}
                                className="flex h-10 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] px-5 text-sm font-medium text-white/35 transition-all hover:border-white/10 hover:text-white/60"
                            >
                                {s.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer className="relative border-t border-white/[0.05] bg-[#080808] py-16 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Brain className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-black text-white">
                                Ai<span className="text-violet-400">KFS</span>
                            </span>
                        </div>
                        <p className="mb-5 text-sm leading-relaxed text-white/35 max-w-xs">
                            The national platform for AI student research, competitions, and knowledge sharing.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-colors hover:text-white/70 hover:bg-white/[0.06]">
                                <GitFork className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-colors hover:text-white/70 hover:bg-white/[0.06]">
                                <Globe className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition-colors hover:text-white/70 hover:bg-white/[0.06]">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-white/25 uppercase">Platform</h4>
                        <ul className="space-y-2.5">
                            {['Browse Projects', 'Submit Project', 'Competitions', 'Categories', 'Leaderboard'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/80">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-white/25 uppercase">Community</h4>
                        <ul className="space-y-2.5">
                            {['Hall of Fame', 'Top Students', 'Universities', 'Sponsors', 'Blog'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/80">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="mb-4 text-xs font-semibold tracking-widest text-white/25 uppercase">Organization</h4>
                        <ul className="space-y-2.5">
                            {['About AiKFS', 'Judging Criteria', 'Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/80">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row">
                    <p className="text-xs text-white/20">
                        © 2025 AiKFS — AI Knowledge Fair & Showcase. All rights reserved.
                    </p>
                    <p className="text-xs text-white/15">
                        Built with precision for the next generation of AI pioneers.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Welcome({ auth }: WelcomeProps) {
    return (
        <>
            <Head title="AiKFS — AI Knowledge Fair & Showcase" />
            <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#fff' }}>
                <GrainTexture />
                <Navbar user={auth.user} />
                <main>
                    <Hero user={auth.user} />
                    <Statistics />
                    <FeaturedProjects />
                    <LatestProjects />
                    <WinningProjects />
                    <Categories />
                    <TopStudents />
                    <HallOfFame />
                    <Sponsors />
                </main>
                <Footer />
            </div>
        </>
    );
}
