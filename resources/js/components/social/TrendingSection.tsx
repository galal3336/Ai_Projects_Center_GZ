import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Eye, Flame } from 'lucide-react';
import type { TrendingProject, TrendingWindow } from '@/types';
import StarButton from './StarButton';

interface Props {
    projects: TrendingProject[];
    defaultWindow?: TrendingWindow;
}

const WINDOWS: { value: TrendingWindow; label: string }[] = [
    { value: '24h', label: 'Today' },
    { value: '7d',  label: 'This week' },
    { value: '30d', label: 'This month' },
];

export default function TrendingSection({ projects: initialProjects, defaultWindow = '7d' }: Props) {
    const [window, setWindow] = useState<TrendingWindow>(defaultWindow);
    const [projects, setProjects] = useState(initialProjects);
    const [loading, setLoading] = useState(false);

    const loadWindow = (w: TrendingWindow) => {
        if (w === window || loading) return;
        setWindow(w);
        setLoading(true);
        fetch(`/api/trending?window=${w}&limit=10`, { headers: { Accept: 'application/json' } })
            .then(r => r.json())
            .then(data => setProjects(data.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    return (
        <section>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                        <Flame size={16} />
                    </span>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Trending Projects</h2>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                    {WINDOWS.map(w => (
                        <button
                            key={w.value}
                            onClick={() => loadWindow(w.value)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
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

            {/* List */}
            <div className={`space-y-2 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {projects.map((project, i) => (
                    <TrendingRow key={project.id} project={project} rank={i + 1} />
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-sm">
                        No trending projects yet for this period.
                    </div>
                )}
            </div>

            <div className="mt-4 text-center">
                <Link
                    href="/trending"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                    View all trending →
                </Link>
            </div>
        </section>
    );
}

function TrendingRow({ project, rank }: { project: TrendingProject; rank: number }) {
    const rankColors = ['text-amber-500', 'text-neutral-400', 'text-amber-700'];
    const rankColor  = rank <= 3 ? rankColors[rank - 1] : 'text-neutral-400 dark:text-neutral-600';

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: rank * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
        >
            {/* Rank */}
            <span className={`w-6 text-center text-sm font-bold tabular-nums shrink-0 ${rankColor}`}>
                {rank}
            </span>

            {/* Thumbnail */}
            {project.thumbnail ? (
                <img
                    src={project.thumbnail}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                />
            ) : (
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                    <TrendingUp size={16} className="text-neutral-400" />
                </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/projects/${project.slug}`}
                    className="block font-medium text-sm text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                    {project.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                    {project.category && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            {project.category.name}
                        </span>
                    )}
                    {project.owner && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            · {project.owner.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <Eye size={12} />
                    {formatCount(project.views_count ?? 0)}
                </span>
                <StarButton
                    projectId={project.id}
                    initialCount={project.stars_count ?? 0}
                    initialStarred={project.is_starred}
                    size="sm"
                />
            </div>
        </motion.div>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}
