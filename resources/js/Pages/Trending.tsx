import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Flame, Star, Eye, Users, Bookmark, TrendingUp, ArrowLeft } from 'lucide-react';
import type { TrendingProject, TrendingWindow } from '@/types';
import StarButton from '@/components/social/StarButton';
import BookmarkButton from '@/components/social/BookmarkButton';
import FollowButton from '@/components/social/FollowButton';

interface Props {
    projects: TrendingProject[];
    window: TrendingWindow;
}

const WINDOWS: { value: TrendingWindow; label: string; desc: string }[] = [
    { value: '24h', label: 'Today',      desc: 'Last 24 hours' },
    { value: '7d',  label: 'This week',  desc: 'Last 7 days'   },
    { value: '30d', label: 'This month', desc: 'Last 30 days'  },
];

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

export default function Trending({ projects: initialProjects, window: initialWindow }: Props) {
    const [window, setWindow] = useState<TrendingWindow>(initialWindow);
    const [projects, setProjects] = useState(initialProjects);
    const [loading, setLoading] = useState(false);

    const loadWindow = (w: TrendingWindow) => {
        if (w === window || loading) return;
        setWindow(w);
        setLoading(true);
        fetch(`/api/trending?window=${w}&limit=20`, { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(data => setProjects(data.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const top3     = projects.slice(0, 3);
    const rest     = projects.slice(3);

    return (
        <>
            <Head title="Trending Projects" />

            <div className="min-h-dvh bg-neutral-50 dark:bg-[#0d1117]">
                {/* Header */}
                <div className="border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#0d1117]">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft size={14} />
                            Back to projects
                        </Link>

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                                        <Flame size={20} />
                                    </span>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Trending Projects</h1>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-13">
                                    Projects gaining the most traction right now
                                </p>
                            </div>

                            {/* Window tabs */}
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                                {WINDOWS.map(w => (
                                    <button
                                        key={w.value}
                                        onClick={() => loadWindow(w.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            window === w.value
                                                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                        }`}
                                    >
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

                    {projects.length === 0 ? (
                        <div className="text-center py-24 text-neutral-400 dark:text-neutral-500">
                            <TrendingUp size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No trending projects yet</p>
                            <p className="text-sm mt-1">Check back soon as projects gain activity.</p>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 podium */}
                            {top3.length > 0 && (
                                <div className="mb-10">
                                    <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                                        Top trending
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {top3.map((project, i) => (
                                            <PodiumCard key={project.id} project={project} rank={i + 1} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rest of list */}
                            {rest.length > 0 && (
                                <div>
                                    <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                                        Also trending
                                    </h2>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden divide-y divide-neutral-100 dark:divide-white/[0.04]">
                                        {rest.map((project, i) => (
                                            <ListRow key={project.id} project={project} rank={i + 4} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Podium Card (top 3) ──────────────────────────────────────────────────────

function PodiumCard({ project, rank }: { project: TrendingProject; rank: number }) {
    const medals = ['🥇', '🥈', '🥉'];
    const borders = [
        'border-amber-300/50 dark:border-amber-500/30',
        'border-neutral-300/50 dark:border-neutral-600/40',
        'border-amber-700/40 dark:border-amber-800/30',
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: rank * 0.08 }}
            className={`rounded-2xl border-2 bg-white dark:bg-white/[0.03] p-5 flex flex-col gap-4 ${borders[rank - 1]}`}
        >
            <div className="flex items-start justify-between">
                <span className="text-2xl">{medals[rank - 1]}</span>
                {project.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        {project.category.name}
                    </span>
                )}
            </div>

            {project.thumbnail && (
                <img
                    src={project.thumbnail}
                    alt=""
                    className="w-full h-28 object-cover rounded-xl border border-neutral-200 dark:border-white/[0.06]"
                />
            )}

            <div>
                <Link
                    href={`/projects/${project.slug}`}
                    className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                >
                    {project.title}
                </Link>
                {project.abstract && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {project.abstract}
                    </p>
                )}
                {project.owner && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">by {project.owner.name}</p>
                )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                <StarButton projectId={project.id} initialCount={project.stars_count ?? 0} initialStarred={project.is_starred} size="sm" />
                <BookmarkButton projectId={project.id} initialCount={project.bookmarks_count ?? 0} initialBookmarked={project.is_bookmarked} size="sm" />
                <FollowButton projectId={project.id} initialCount={project.followers_count ?? 0} initialFollowing={project.is_following} size="sm" showCount={false} />
            </div>
        </motion.div>
    );
}

// ─── List Row (rank 4+) ───────────────────────────────────────────────────────

function ListRow({ project, rank }: { project: TrendingProject; rank: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (rank - 3) * 0.04 }}
            className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors group"
        >
            <span className="w-6 text-center text-sm font-bold tabular-nums text-neutral-400 dark:text-neutral-600 shrink-0">
                {rank}
            </span>

            {project.thumbnail ? (
                <img
                    src={project.thumbnail}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-white/[0.06]"
                />
            ) : (
                <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-white/[0.04] shrink-0 border border-neutral-200 dark:border-white/[0.06] flex items-center justify-center">
                    <TrendingUp size={16} className="text-neutral-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <Link
                    href={`/projects/${project.slug}`}
                    className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block"
                >
                    {project.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {project.category && <span>{project.category.name}</span>}
                    {project.owner && <span>· {project.owner.name}</span>}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                    <Eye size={12} />
                    {formatCount(project.views_count ?? 0)}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                    <Users size={12} />
                    {formatCount(project.followers_count ?? 0)}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                    <Bookmark size={12} />
                    {formatCount(project.bookmarks_count ?? 0)}
                </span>
                <StarButton projectId={project.id} initialCount={project.stars_count ?? 0} initialStarred={project.is_starred} size="sm" />
            </div>
        </motion.div>
    );
}
