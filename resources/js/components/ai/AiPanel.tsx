import { useCallback, useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    Brain,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Layers,
    Lightbulb,
    Loader2,
    RefreshCw,
    Rocket,
    Search,
    Sparkles,
    Star,
    Tag,
    Target,
    TrendingUp,
    Zap,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AiFeature = 'summary' | 'similar' | 'judge' | 'tags';
type AiStatus  = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
type SummaryType = 'executive' | 'technical' | 'business';

interface AiResultMeta {
    id: string;
    feature: AiFeature;
    sub_type?: string;
    status: AiStatus;
    processing_ms?: number;
    error_message?: string;
    has_result: boolean;
    completed_at?: string;
}

interface SummaryResult {
    type: SummaryType;
    summary: string;
    key_points: string[];
    one_liner: string;
}

interface SimilarMatch {
    id: string;
    title: string;
    score: number;
    reason: string;
    shared_aspects: string[];
}

interface SimilarResult {
    matches: SimilarMatch[];
    analysis: string;
}

interface JudgeDimension {
    score: number;
    grade: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

interface JudgeResult {
    overall_score: number;
    verdict: string;
    dimensions: {
        documentation: JudgeDimension;
        architecture: JudgeDimension;
        innovation: JudgeDimension;
        scalability: JudgeDimension;
    };
    executive_feedback: string;
    highlights: string[];
    critical_improvements: string[];
}

interface TagsResult {
    tags: string[];
    categories: Record<string, string[]>;
    confidence: number;
    rationale: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 2500;
const BASE_URL = '/api/v1/ai';

// ─── Utility ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-rose-400';
}

function scoreBg(score: number): string {
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/25';
    if (score >= 70) return 'bg-blue-500/10 border-blue-500/25';
    if (score >= 55) return 'bg-amber-500/10 border-amber-500/25';
    return 'bg-rose-500/10 border-rose-500/25';
}

function gradeColor(grade: string): string {
    if (grade === 'A') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (grade === 'B') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (grade === 'C') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}

function verdictColor(verdict: string): string {
    if (verdict === 'Approved') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (verdict === 'Conditionally Approved') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (verdict === 'Needs Improvement') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}

function msToTime(ms?: number): string {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const col = score >= 85 ? '#34d399' : score >= 70 ? '#60a5fa' : score >= 55 ? '#fbbf24' : '#f87171';

    return (
        <svg width={size} height={size} className="shrink-0 -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} className="stroke-white/[0.06]" fill="none" />
            <circle
                cx={size / 2} cy={size / 2} r={r} strokeWidth={5}
                stroke={col} fill="none"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle"
                className="rotate-90" fill={col}
                style={{ fontSize: size * 0.24, fontWeight: 900, transform: `rotate(90deg)`, transformOrigin: '50% 50%' }}>
                {score}
            </text>
        </svg>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={copy} aria-label="Copy" className="cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.03] p-1.5 text-white/35 transition-all hover:border-white/15 hover:text-white/70">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function StatusPill({ status }: { status: AiStatus }) {
    const map: Record<AiStatus, { label: string; cls: string; icon: React.ElementType }> = {
        idle:       { label: 'Not generated', cls: 'text-white/30 bg-white/[0.04] border-white/[0.08]', icon: Sparkles },
        pending:    { label: 'Queued…',       cls: 'text-amber-300 bg-amber-500/10 border-amber-500/25', icon: Clock },
        processing: { label: 'Processing…',   cls: 'text-blue-300 bg-blue-500/10 border-blue-500/25',   icon: Loader2 },
        completed:  { label: 'Complete',      cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25', icon: Check },
        failed:     { label: 'Failed',        cls: 'text-rose-300 bg-rose-500/10 border-rose-500/25',   icon: AlertCircle },
    };
    const { label, cls, icon: Icon } = map[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
            <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
            {label}
        </span>
    );
}

function LoadingShimmer({ lines = 4 }: { lines?: number }) {
    return (
        <div className="space-y-3 py-4">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`h-3 animate-pulse rounded-full bg-white/[0.06] ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/20">{label}</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
        </div>
    );
}

// ─── Summary Result View ───────────────────────────────────────────────────────

function SummaryView({ data }: { data: SummaryResult }) {
    const typeLabels: Record<SummaryType, { label: string; color: string }> = {
        executive: { label: 'Executive Summary', color: 'text-violet-400' },
        technical: { label: 'Technical Summary', color: 'text-blue-400' },
        business:  { label: 'Business Summary',  color: 'text-amber-400' },
    };
    const { label, color } = typeLabels[data.type] ?? typeLabels.executive;

    return (
        <div className="space-y-4">
            {/* One-liner */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">Key Message</div>
                <p className={`text-[14px] font-semibold leading-relaxed ${color}`}>"{data.one_liner}"</p>
            </div>

            {/* Summary text */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25">{label}</span>
                    <CopyButton text={data.summary} />
                </div>
                <p className="text-[13px] leading-relaxed text-white/60">{data.summary}</p>
            </div>

            {/* Key points */}
            {data.key_points?.length > 0 && (
                <div>
                    <SectionDivider label="Key Points" />
                    <ul className="mt-3 space-y-2">
                        {data.key_points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/60" />
                                <span className="text-[12px] leading-relaxed text-white/55">{pt}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ─── Similar Projects View ─────────────────────────────────────────────────────

function SimilarView({ data }: { data: SimilarResult }) {
    if (!data.matches?.length) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Search className="h-8 w-8 text-white/20" />
                <p className="text-sm text-white/35">No similar projects found in the current pool.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Analysis */}
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.06] p-4">
                <div className="mb-1 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70">AI Analysis</span>
                </div>
                <p className="text-[12px] leading-relaxed text-white/55">{data.analysis}</p>
            </div>

            {/* Matches */}
            <div className="space-y-3">
                {data.matches.map((match, i) => (
                    <div key={match.id}
                        className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.035]">
                        <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-black text-white/40">
                                    {i + 1}
                                </span>
                                <h4 className="text-[13px] font-bold text-white/80">{match.title}</h4>
                            </div>
                            <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${scoreBg(match.score)}`}>
                                <TrendingUp className={`h-3 w-3 ${scoreColor(match.score)}`} />
                                <span className={scoreColor(match.score)}>{match.score}%</span>
                            </div>
                        </div>
                        <p className="mb-2 text-[12px] leading-relaxed text-white/45">{match.reason}</p>
                        {match.shared_aspects?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {match.shared_aspects.map(a => (
                                    <span key={a} className="rounded-md border border-violet-500/20 bg-violet-500/[0.08] px-2 py-0.5 text-[10px] font-medium text-violet-300">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Judge Result View ─────────────────────────────────────────────────────────

const DIMENSION_META: Record<string, { label: string; icon: React.ElementType; weight: string }> = {
    documentation: { label: 'Documentation',  icon: BookOpen,    weight: '25%' },
    architecture:  { label: 'Architecture',   icon: Layers,      weight: '30%' },
    innovation:    { label: 'Innovation',      icon: Lightbulb,   weight: '30%' },
    scalability:   { label: 'Scalability',     icon: Rocket,      weight: '15%' },
};

function DimensionCard({ dimKey, dim }: { dimKey: string; dim: JudgeDimension }) {
    const [open, setOpen] = useState(false);
    const meta = DIMENSION_META[dimKey];
    const Icon = meta?.icon ?? BarChart3;

    return (
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
            >
                <Icon className="h-4 w-4 shrink-0 text-white/35" />
                <span className="flex-1 text-left text-[13px] font-semibold text-white/75">{meta?.label ?? dimKey}</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[11px] font-black ${gradeColor(dim.grade)}`}>
                    {dim.grade}
                </span>
                <span className={`font-mono text-[14px] font-black ${scoreColor(dim.score)}`}>{dim.score}</span>
                <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="border-t border-white/[0.05] px-4 py-4 space-y-4">
                    <p className="text-[12px] leading-relaxed text-white/55">{dim.summary}</p>

                    {dim.strengths?.length > 0 && (
                        <div>
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60">Strengths</div>
                            <ul className="space-y-1.5">
                                {dim.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-white/50">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {dim.weaknesses?.length > 0 && (
                        <div>
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-rose-400/60">Weaknesses</div>
                            <ul className="space-y-1.5">
                                {dim.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-white/50">
                                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/70" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {dim.recommendations?.length > 0 && (
                        <div>
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400/60">Recommendations</div>
                            <ul className="space-y-1.5">
                                {dim.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[12px] text-white/50">
                                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400/70" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function JudgeView({ data }: { data: JudgeResult }) {
    return (
        <div className="space-y-5">
            {/* Overall score + verdict */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <ScoreRing score={data.overall_score} size={72} />
                <div className="flex-1">
                    <div className="mb-1 text-[11px] text-white/30">Overall Score</div>
                    <div className={`hof-heading mb-2 text-3xl font-black ${scoreColor(data.overall_score)}`}>
                        {data.overall_score}<span className="text-base font-medium text-white/20">/100</span>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${verdictColor(data.verdict)}`}>
                        {data.verdict}
                    </span>
                </div>
            </div>

            {/* Executive feedback */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
                <div className="mb-2 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-400/70">Judge's Assessment</span>
                </div>
                <p className="text-[13px] leading-relaxed text-white/60">{data.executive_feedback}</p>
            </div>

            {/* Dimension breakdown */}
            <div>
                <SectionDivider label="Dimension Breakdown" />
                <div className="mt-3 space-y-2">
                    {Object.entries(data.dimensions ?? {}).map(([key, dim]) => (
                        <DimensionCard key={key} dimKey={key} dim={dim as JudgeDimension} />
                    ))}
                </div>
            </div>

            {/* Highlights + critical improvements */}
            <div className="grid gap-3 sm:grid-cols-2">
                {data.highlights?.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                        <div className="mb-3 flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/70">Highlights</span>
                        </div>
                        <ul className="space-y-2">
                            {data.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2 text-[12px] text-white/55">
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />{h}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {data.critical_improvements?.length > 0 && (
                    <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-4">
                        <div className="mb-3 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-rose-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400/70">Must Fix</span>
                        </div>
                        <ul className="space-y-2">
                            {data.critical_improvements.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-[12px] text-white/55">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/80" />{c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Tags Result View ──────────────────────────────────────────────────────────

function TagsView({
    data, onApplyTags, resultId, applying,
}: {
    data: TagsResult;
    onApplyTags: (resultId: string) => void;
    resultId: string;
    applying: boolean;
}) {
    const categoryColors: Record<string, string> = {
        technology:  'border-blue-500/25 bg-blue-500/[0.08] text-blue-300',
        domain:      'border-violet-500/25 bg-violet-500/[0.08] text-violet-300',
        methodology: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300',
        feature:     'border-amber-500/25 bg-amber-500/[0.08] text-amber-300',
        audience:    'border-pink-500/25 bg-pink-500/[0.08] text-pink-300',
    };

    return (
        <div className="space-y-5">
            {/* Confidence + rationale */}
            <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="text-center">
                    <div className={`text-2xl font-black ${scoreColor(data.confidence)}`}>{data.confidence}%</div>
                    <div className="text-[10px] text-white/25">Confidence</div>
                </div>
                <div className="h-10 w-px bg-white/[0.06]" />
                <p className="text-[12px] leading-relaxed text-white/50">{data.rationale}</p>
            </div>

            {/* All tags */}
            <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/25">Generated Tags</div>
                <div className="flex flex-wrap gap-2">
                    {data.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/65">
                            <Tag className="h-3 w-3 text-white/30" />{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* By category */}
            {Object.keys(data.categories ?? {}).length > 0 && (
                <div>
                    <SectionDivider label="By Category" />
                    <div className="mt-3 space-y-3">
                        {Object.entries(data.categories).map(([cat, tags]) => (
                            <div key={cat}>
                                <div className="mb-2 text-[10px] font-semibold capitalize text-white/25">{cat}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map(tag => (
                                        <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[cat] ?? 'border-white/10 bg-white/[0.04] text-white/50'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Apply button */}
            <button
                onClick={() => onApplyTags(resultId)}
                disabled={applying}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-[13px] font-bold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {applying ? 'Applying…' : 'Apply Tags to Project'}
            </button>
        </div>
    );
}

// ─── Feature Tab ───────────────────────────────────────────────────────────────

interface FeatureConfig {
    id: AiFeature;
    label: string;
    icon: React.ElementType;
    description: string;
    color: string;
    estimatedTime: string;
}

const FEATURES: FeatureConfig[] = [
    {
        id: 'summary',
        label: 'AI Summary',
        icon: FileText,
        description: 'Generate executive, technical, and business summaries.',
        color: 'text-violet-400',
        estimatedTime: '~15s per type',
    },
    {
        id: 'similar',
        label: 'Similar Projects',
        icon: Search,
        description: 'Discover related projects using semantic similarity.',
        color: 'text-blue-400',
        estimatedTime: '~10s',
    },
    {
        id: 'judge',
        label: 'AI Judge',
        icon: Award,
        description: 'Evaluate documentation, architecture, innovation, and scalability.',
        color: 'text-amber-400',
        estimatedTime: '~30s',
    },
    {
        id: 'tags',
        label: 'AI Tags',
        icon: Tag,
        description: 'Auto-generate curated tags across 5 categories.',
        color: 'text-emerald-400',
        estimatedTime: '~8s',
    },
];

// ─── Core Hook ─────────────────────────────────────────────────────────────────

function useAiFeature(projectId: string, feature: AiFeature, subType?: string) {
    const [status, setStatus]     = useState<AiStatus>('idle');
    const [resultId, setResultId] = useState<string | null>(null);
    const [data, setData]         = useState<any>(null);
    const [error, setError]       = useState<string | null>(null);
    const [processingMs, setProcessingMs] = useState<number | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    const fetchResult = useCallback(async (id: string) => {
        const res = await fetch(`${BASE_URL}/results/${id}/data`);
        if (res.ok) {
            const json = await res.json();
            setData(json.result);
            setProcessingMs(json.processing_ms ?? null);
        }
    }, []);

    const pollStatus = useCallback(async (id: string) => {
        const res  = await fetch(`${BASE_URL}/results/${id}`);
        const json = await res.json();

        if (json.status === 'completed') {
            setStatus('completed');
            stopPolling();
            await fetchResult(id);
        } else if (json.status === 'failed') {
            setStatus('failed');
            setError(json.error_message ?? 'An error occurred.');
            stopPolling();
        } else {
            setStatus(json.status);
        }
    }, [stopPolling, fetchResult]);

    const dispatch = useCallback(async () => {
        setStatus('pending');
        setError(null);
        setData(null);

        try {
            const body: Record<string, string> = { feature };
            if (subType) body.sub_type = subType;

            const res  = await fetch(`${BASE_URL}/projects/${projectId}/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify(body),
            });
            const json = await res.json();

            const id = json.result_id;
            setResultId(id);
            setStatus(json.status ?? 'pending');

            // Start polling
            pollRef.current = setInterval(() => pollStatus(id), POLL_INTERVAL);
        } catch (e: any) {
            setStatus('failed');
            setError(e.message ?? 'Network error');
        }
    }, [projectId, feature, subType, pollStatus]);

    // Clean up on unmount
    useEffect(() => () => stopPolling(), [stopPolling]);

    return { status, data, error, processingMs, resultId, dispatch };
}

// ─── Main AiPanel Component ────────────────────────────────────────────────────

interface AiPanelProps {
    projectId: string;
    projectTitle?: string;
    className?: string;
}

export default function AiPanel({ projectId, projectTitle, className = '' }: AiPanelProps) {
    const [activeFeature, setActiveFeature] = useState<AiFeature>('summary');
    const [summaryType, setSummaryType] = useState<SummaryType>('executive');
    const [applyingTags, setApplyingTags] = useState(false);

    // One hook per sub-feature
    const summaryExec = useAiFeature(projectId, 'summary', 'executive');
    const summaryTech = useAiFeature(projectId, 'summary', 'technical');
    const summaryBiz  = useAiFeature(projectId, 'summary', 'business');
    const similar     = useAiFeature(projectId, 'similar');
    const judge       = useAiFeature(projectId, 'judge');
    const tags        = useAiFeature(projectId, 'tags');

    const summaryHooks: Record<SummaryType, ReturnType<typeof useAiFeature>> = {
        executive: summaryExec,
        technical: summaryTech,
        business:  summaryBiz,
    };

    const activeHook = {
        summary: summaryHooks[summaryType],
        similar,
        judge,
        tags,
    }[activeFeature];

    const handleApplyTags = async (resultId: string) => {
        setApplyingTags(true);
        try {
            await fetch(`${BASE_URL}/results/${resultId}/apply-tags`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
        } finally {
            setApplyingTags(false);
        }
    };

    const canGenerate = activeHook.status === 'idle' || activeHook.status === 'failed';
    const isLoading   = activeHook.status === 'pending' || activeHook.status === 'processing';

    return (
        <div className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] ${className}`}>
            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4"
                style={{ background: 'rgba(139,92,246,0.05)' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/20">
                    <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white/90">AI-Powered Features</h3>
                    {projectTitle && <p className="text-[11px] text-white/30">Analyzing: {projectTitle}</p>}
                </div>
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-300">Claude Sonnet</span>
                </div>
            </div>

            {/* Feature tabs */}
            <div className="flex overflow-x-auto border-b border-white/[0.05]" style={{ scrollbarWidth: 'none' }}>
                {FEATURES.map(f => {
                    const Icon    = f.icon;
                    const isActive = activeFeature === f.id;
                    // Determine status for this feature
                    let featureStatus: AiStatus = 'idle';
                    if (f.id === 'summary') {
                        const anyDone = [summaryExec, summaryTech, summaryBiz].some(h => h.status === 'completed');
                        const anyLoading = [summaryExec, summaryTech, summaryBiz].some(h => h.status === 'pending' || h.status === 'processing');
                        if (anyDone) featureStatus = 'completed';
                        else if (anyLoading) featureStatus = 'processing';
                    } else {
                        const h = { similar, judge, tags }[f.id as 'similar' | 'judge' | 'tags'];
                        featureStatus = h.status;
                    }

                    return (
                        <button
                            key={f.id}
                            onClick={() => setActiveFeature(f.id)}
                            aria-pressed={isActive}
                            className={[
                                'flex shrink-0 flex-col items-center gap-1 border-b-2 px-4 py-3 text-[11px] font-semibold transition-all duration-150',
                                isActive ? 'border-violet-500 bg-violet-500/[0.05]' : 'border-transparent hover:bg-white/[0.02]',
                            ].join(' ')}
                        >
                            <div className="relative">
                                <Icon className={`h-4 w-4 ${isActive ? f.color : 'text-white/30'}`} />
                                {featureStatus === 'completed' && (
                                    <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500">
                                        <Check className="h-1.5 w-1.5 text-white" />
                                    </span>
                                )}
                                {(featureStatus === 'pending' || featureStatus === 'processing') && (
                                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
                                )}
                            </div>
                            <span className={isActive ? 'text-white/80' : 'text-white/30'}>{f.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Feature body */}
            <div className="p-5">
                {/* Summary type picker */}
                {activeFeature === 'summary' && (
                    <div className="mb-4 flex gap-2">
                        {(['executive', 'technical', 'business'] as SummaryType[]).map(t => {
                            const h = summaryHooks[t];
                            const isActive = summaryType === t;
                            return (
                                <button
                                    key={t}
                                    onClick={() => setSummaryType(t)}
                                    aria-pressed={isActive}
                                    className={[
                                        'flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-semibold capitalize transition-all duration-150',
                                        isActive
                                            ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                            : 'border-white/[0.07] bg-white/[0.02] text-white/35 hover:border-white/12 hover:text-white/60',
                                    ].join(' ')}
                                >
                                    {t}
                                    {h.status === 'completed' && (
                                        <span className="text-[9px] font-bold text-emerald-400">✓ Ready</span>
                                    )}
                                    {(h.status === 'pending' || h.status === 'processing') && (
                                        <span className="text-[9px] text-amber-400">Processing…</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Feature description + estimated time */}
                {activeHook.status === 'idle' && (
                    <div className="mb-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                            <p className="text-[13px] text-white/50">
                                {FEATURES.find(f => f.id === activeFeature)?.description}
                            </p>
                            <span className="flex shrink-0 items-center gap-1 text-[10px] text-white/25">
                                <Clock className="h-3 w-3" />
                                {FEATURES.find(f => f.id === activeFeature)?.estimatedTime}
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="mb-4">
                        <div className="mb-3 flex items-center justify-between">
                            <StatusPill status={activeHook.status} />
                            <span className="text-[11px] text-white/25">
                                {FEATURES.find(f => f.id === activeFeature)?.estimatedTime}
                            </span>
                        </div>
                        <LoadingShimmer lines={5} />
                    </div>
                )}

                {/* Error state */}
                {activeHook.status === 'failed' && activeHook.error && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <div>
                            <div className="mb-1 text-[12px] font-bold text-rose-300">Generation failed</div>
                            <p className="text-[11px] leading-relaxed text-rose-300/60">{activeHook.error}</p>
                        </div>
                    </div>
                )}

                {/* Result */}
                {activeHook.status === 'completed' && activeHook.data && (
                    <div className="mb-4">
                        <div className="mb-4 flex items-center justify-between">
                            <StatusPill status="completed" />
                            {activeHook.processingMs && (
                                <span className="flex items-center gap-1 text-[11px] text-white/25">
                                    <Zap className="h-3 w-3" />
                                    {msToTime(activeHook.processingMs)}
                                </span>
                            )}
                        </div>

                        {activeFeature === 'summary' && <SummaryView data={activeHook.data} />}
                        {activeFeature === 'similar' && <SimilarView data={activeHook.data} />}
                        {activeFeature === 'judge'   && <JudgeView data={activeHook.data} />}
                        {activeFeature === 'tags'    && activeHook.resultId && (
                            <TagsView
                                data={activeHook.data}
                                resultId={activeHook.resultId}
                                onApplyTags={handleApplyTags}
                                applying={applyingTags}
                            />
                        )}
                    </div>
                )}

                {/* Action button */}
                <div className="flex gap-2">
                    <button
                        onClick={activeHook.dispatch}
                        disabled={isLoading}
                        className={[
                            'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white transition-all duration-150',
                            isLoading
                                ? 'cursor-not-allowed bg-violet-600/40'
                                : canGenerate
                                ? 'bg-gradient-to-r from-violet-600 to-purple-700 shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-600'
                                : 'bg-white/[0.05] text-white/50',
                        ].join(' ')}
                    >
                        {isLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
                        ) : activeHook.status === 'completed' ? (
                            <><RefreshCw className="h-4 w-4" />Regenerate</>
                        ) : (
                            <><Sparkles className="h-4 w-4" />Generate{activeFeature === 'summary' ? ` ${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}` : ''}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
