import DetectionBadges from '@/Components/Repository/Analytics/DetectionBadges';
import LanguageDonut from '@/Components/Repository/Analytics/LanguageDonut';
import LinesBar from '@/Components/Repository/Analytics/LinesBar';
import LocBreakdown from '@/Components/Repository/Analytics/LocBreakdown';
import StatCard from '@/Components/Repository/Analytics/StatCard';
import TopFilesTable from '@/Components/Repository/Analytics/TopFilesTable';
import { cn } from '@/lib/utils';
import type { FileTreeNode, RepositoryAnalytics } from '@/types';
import {
    AlertCircle,
    BarChart2,
    BookOpen,
    Code2,
    FileCode,
    Files,
    Layers,
    Loader2,
    MessageSquare,
    RefreshCw,
    ScanLine,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Glass card wrapper ───────────────────────────────────────────────────────

function GlassCard({ children, className, title, icon: Icon }: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
    return (
        <div className={cn('rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md', className)}>
            {(title || Icon) && (
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
                    {Icon && <Icon size={14} className="text-gray-500" />}
                    {title && <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">{title}</h3>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── AnalyticsPanel ───────────────────────────────────────────────────────────

interface AnalyticsPanelProps {
    repositoryId: string;
    initialAnalytics: RepositoryAnalytics | null;
    hasAnalytics: boolean;
    onFileSelect?: (node: FileTreeNode) => void;
}

export default function AnalyticsPanel({
    repositoryId,
    initialAnalytics,
    hasAnalytics,
    onFileSelect,
}: AnalyticsPanelProps) {
    const [analytics, setAnalytics] = useState<RepositoryAnalytics | null>(initialAnalytics);
    const [loading, setLoading] = useState(!initialAnalytics && hasAnalytics);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/repositories/${repositoryId}/analytics`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Analytics not available.');
            const data: RepositoryAnalytics = await res.json();
            setAnalytics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!analytics && !fetchedRef.current) {
            fetchedRef.current = true;
            fetchAnalytics();
        }
    }, []);

    // ─── States ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
                    <div className="relative rounded-full border border-purple-500/30 bg-purple-500/10 p-4">
                        <ScanLine size={28} className="text-purple-400" />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-300">Analysing repository…</p>
                    <p className="mt-1 text-xs text-gray-600">Detecting languages, frameworks & libraries</p>
                </div>
                <Loader2 size={16} className="animate-spin text-gray-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-12 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-sm text-gray-400">{error}</p>
                <button
                    type="button"
                    onClick={fetchAnalytics}
                    className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-gray-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                    <RefreshCw size={12} />
                    Retry
                </button>
            </div>
        );
    }

    if (!analytics) return null;

    const codeRatio = analytics.total_lines > 0
        ? Math.round((analytics.code_lines / analytics.total_lines) * 100)
        : 0;

    const commentRatio = analytics.total_lines > 0
        ? Math.round((analytics.comment_lines / analytics.total_lines) * 100)
        : 0;

    const handleTopFileSelect = (path: string) => {
        if (!onFileSelect) return;
        onFileSelect({ type: 'file', name: path.split('/').pop() ?? path, path });
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl space-y-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-bold text-white">
                            <BarChart2 size={18} className="text-purple-400" />
                            Code Analytics
                        </h2>
                        {analytics.primary_language && (
                            <p className="mt-0.5 text-xs text-gray-600">
                                Primary: <span className="text-gray-400">{analytics.primary_language}</span>
                                {' · '}Analysed {new Date(analytics.analysed_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={fetchAnalytics}
                        className="flex items-center gap-1.5 rounded-md border border-white/[0.07] px-2.5 py-1.5 text-[11px] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 transition-colors cursor-pointer"
                    >
                        <RefreshCw size={11} />
                        Re-analyse
                    </button>
                </div>

                {/* Stat cards row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <StatCard
                        label="Total Files"
                        value={analytics.total_files}
                        icon={Files}
                        accent="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        label="Total Lines"
                        value={analytics.total_lines}
                        icon={ScanLine}
                        accent="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        label="Code Lines"
                        value={analytics.code_lines}
                        sub={`${codeRatio}% of total`}
                        icon={Code2}
                        accent="from-green-500 to-emerald-500"
                    />
                    <StatCard
                        label="Comments"
                        value={analytics.comment_lines}
                        sub={`${commentRatio}% ratio`}
                        icon={MessageSquare}
                        accent="from-yellow-500 to-orange-500"
                    />
                    <StatCard
                        label="Codebase Size"
                        value={analytics.total_size}
                        sub={`~${analytics.avg_file_size_kb} KB avg`}
                        icon={TrendingUp}
                        accent="from-rose-500 to-red-500"
                    />
                </div>

                {/* Languages + LOC breakdown */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <GlassCard title="Language Distribution" icon={FileCode} className="lg:col-span-3">
                        <LanguageDonut languages={analytics.languages} />
                    </GlassCard>
                    <GlassCard title="Lines of Code" icon={Code2} className="lg:col-span-2">
                        <LocBreakdown analytics={analytics} />
                    </GlassCard>
                </div>

                {/* Lines per language bar chart */}
                {analytics.languages.some(l => l.lines > 0) && (
                    <GlassCard title="Lines per Language" icon={BarChart2}>
                        <LinesBar languages={analytics.languages} />
                    </GlassCard>
                )}

                {/* Frameworks & Libraries */}
                <GlassCard title="Detected Stack" icon={Layers}>
                    <DetectionBadges frameworks={analytics.frameworks} libraries={analytics.libraries} />
                </GlassCard>

                {/* Top files */}
                <GlassCard title="Largest Files by LOC" icon={TrendingUp}>
                    <TopFilesTable files={analytics.top_files} onSelect={handleTopFileSelect} />
                </GlassCard>

            </div>
        </div>
    );
}
