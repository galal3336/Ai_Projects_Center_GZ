import React, { useCallback, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Code2,
    Filter,
    Flame,
    Loader2,
    Search,
    SlidersHorizontal,
    Star,
    Trophy,
    Users,
    X,
    Zap,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { Paginated, Project, SearchFacets, SearchFilters } from '@/types';
import { AmbientBackground, Reveal, fadeUp, scaleIn } from '@/components/ui/design-system';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    projects: { data: Project[] } & Omit<Paginated<Project>, 'data'>;
    filters: SearchFilters;
    facets: SearchFacets;
}

type SortOption = { value: string; label: string; icon: React.ElementType };

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
    { value: 'published_at',    label: 'Most Recent',    icon: Zap },
    { value: 'views_count',     label: 'Most Viewed',    icon: Flame },
    { value: 'likes_count',     label: 'Most Starred',   icon: Star },
    { value: 'downloads_count', label: 'Most Downloaded', icon: BookOpen },
];

const AWARD_RANKS = [
    { value: 'first',     label: '1st Place' },
    { value: 'second',    label: '2nd Place' },
    { value: 'third',     label: '3rd Place' },
    { value: 'honorable', label: 'Honorable' },
];

const DEBOUNCE_MS = 350;

// ─── Utility ─────────────────────────────────────────────────────────────────

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function buildUrl(filters: SearchFilters): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null && v !== '' && v !== false)
            params.set(k, String(v));
    }
    return '/search?' + params.toString();
}

// ─── Active chip ──────────────────────────────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/12 px-3 py-1 text-xs font-medium text-violet-300"
        >
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove filter: ${label}`}
                className="transition-colors hover:text-white cursor-pointer"
            >
                <X className="h-3 w-3" />
            </button>
        </motion.span>
    );
}

// ─── Tech badge ───────────────────────────────────────────────────────────────

function TechBadge({ name, color }: { name: string; color?: string | null }) {
    return (
        <span
            className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium border"
            style={color ? {
                borderColor: color + '40',
                backgroundColor: color + '15',
                color,
            } : {
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.5)',
            }}
        >
            {name}
        </span>
    );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
    const hasAward = project.awards && project.awards.length > 0;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-white/[0.13] hover:bg-white/[0.04] hover:-translate-y-0.5"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white/[0.07]" />
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {project.is_featured && (
                    <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                        <Star className="h-2.5 w-2.5" /> Featured
                    </span>
                )}

                {hasAward && (
                    <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                        <Trophy className="h-2.5 w-2.5" /> Award
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {project.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                        {project.category.name}
                    </span>
                )}

                <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white/85 transition-colors group-hover:text-white">
                    {project.title}
                </h3>

                {project.abstract && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-white/40">
                        {project.abstract}
                    </p>
                )}

                {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                        {project.technologies.slice(0, 4).map(t => (
                            <TechBadge key={t.id} name={t.name} color={t.color} />
                        ))}
                        {project.technologies.length > 4 && (
                            <span className="text-[10px] text-white/30">
                                +{project.technologies.length - 4}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-white/35">
                        {project.owner && (
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.owner.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <span className="tabular">{project.views_count.toLocaleString()} views</span>
                        <span>·</span>
                        <span className="tabular">{project.likes_count.toLocaleString()} ★</span>
                    </div>
                </div>
            </div>

            <Link href={`/projects/${project.slug}`} className="absolute inset-0" aria-label={project.title} />
        </motion.article>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, onPage }: {
    meta: Omit<Paginated<Project>, 'data'>;
    onPage: (page: number) => void;
}) {
    if (meta.last_page <= 1) return null;

    const pages: (number | null)[] = [];
    for (let i = 1; i <= meta.last_page; i++) {
        if (i === 1 || i === meta.last_page || Math.abs(i - meta.current_page) <= 2)
            pages.push(i);
        else if (pages[pages.length - 1] !== null)
            pages.push(null);
    }

    const btnBase = 'flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';

    return (
        <div className="flex items-center justify-center gap-1.5">
            <button
                disabled={meta.current_page <= 1}
                onClick={() => onPage(meta.current_page - 1)}
                className={cn(btnBase, 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/80')}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((p, i) =>
                p === null ? (
                    <span key={`e-${i}`} className="px-1 text-sm text-white/25">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPage(p)}
                        className={cn(
                            btnBase,
                            p === meta.current_page
                                ? 'border-violet-500/50 bg-violet-500/20 text-violet-300 font-semibold'
                                : 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/80',
                        )}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPage(meta.current_page + 1)}
                className={cn(btnBase, 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/80')}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
    filters: SearchFilters;
    facets: SearchFacets;
    onChange: (patch: Partial<SearchFilters>) => void;
    onClear: () => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">{title}</p>
            {children}
        </div>
    );
}

function SearchInput({ icon: Icon, placeholder, value, onChange }: {
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] py-2 pl-8 pr-7 text-xs text-white placeholder:text-white/25 outline-none transition-colors focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70 cursor-pointer"
                    aria-label="Clear"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

function ToggleFilter({ icon: Icon, label, active, onChange }: {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!active)}
            className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all duration-150',
                active
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
                    : 'border-white/[0.07] text-white/40 hover:bg-white/[0.04] hover:text-white/70',
            )}
        >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
            <span className={cn(
                'ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                active ? 'border-violet-500 bg-violet-500' : 'border-white/20',
            )}>
                {active && <span className="h-2 w-2 rounded-sm bg-white" />}
            </span>
        </button>
    );
}

function FilterPanel({ filters, facets, onChange, onClear }: FilterPanelProps) {
    const hasActive = Object.entries(filters).some(
        ([k, v]) => !['sort', 'direction'].includes(k) && v && v !== false && v !== ''
    );

    return (
        <aside className="w-full shrink-0 space-y-5 lg:w-60">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
                    <SlidersHorizontal className="h-4 w-4 text-violet-400" />
                    Filters
                </span>
                {hasActive && (
                    <button type="button" onClick={onClear}
                        className="cursor-pointer text-xs text-white/35 transition-colors hover:text-white/70">
                        Clear all
                    </button>
                )}
            </div>

            <FilterSection title="Search By">
                <SearchInput icon={BookOpen}  placeholder="Project name…"     value={filters.search ?? ''}           onChange={v => onChange({ search: v || undefined })} />
                <SearchInput icon={Users}     placeholder="Student name…"     value={filters.student_name ?? ''}     onChange={v => onChange({ student_name: v || undefined })} />
                <SearchInput icon={Award}     placeholder="Supervisor name…"  value={filters.supervisor ?? ''}       onChange={v => onChange({ supervisor: v || undefined })} />
                <SearchInput icon={Code2}     placeholder="Technology…"       value={filters.technology_name ?? ''}  onChange={v => onChange({ technology_name: v || undefined, technology_id: undefined })} />
                <SearchInput icon={Trophy}    placeholder="Competition name…" value={filters.competition_name ?? ''} onChange={v => onChange({ competition_name: v || undefined, competition_id: undefined })} />
                <SearchInput icon={Award}     placeholder="Award title…"      value={filters.award_name ?? ''}       onChange={v => onChange({ award_name: v || undefined })} />
            </FilterSection>

            <FilterSection title="Smart Filters">
                <ToggleFilter icon={Trophy} label="Winning Projects" active={!!filters.winning_only} onChange={v => onChange({ winning_only: v || undefined })} />
                <ToggleFilter icon={Star}   label="Featured Only"    active={!!filters.featured_only} onChange={v => onChange({ featured_only: v || undefined })} />
            </FilterSection>

            {facets.categories.length > 0 && (
                <FilterSection title="Category">
                    <div className="space-y-0.5">
                        {facets.categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onChange({ category_id: filters.category_id === cat.id ? undefined : cat.id, category_name: undefined })}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all duration-150',
                                    filters.category_id === cat.id
                                        ? 'border border-violet-500/30 bg-violet-500/10 text-violet-300'
                                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70',
                                )}
                            >
                                {cat.icon && <span>{cat.icon}</span>}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {facets.competitions.length > 0 && (
                <FilterSection title="Competition">
                    <select
                        value={filters.competition_id ?? ''}
                        onChange={e => onChange({ competition_id: e.target.value || undefined, competition_name: undefined })}
                        className="w-full cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none transition-colors focus:border-violet-500/40"
                    >
                        <option value="">All competitions</option>
                        {facets.competitions.map(c => (
                            <option key={c.id} value={c.id}>{c.name}{c.academic_year ? ` (${c.academic_year})` : ''}</option>
                        ))}
                    </select>
                </FilterSection>
            )}

            {facets.technologies.length > 0 && (
                <FilterSection title="Technology">
                    <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
                        {facets.technologies.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => onChange({ technology_id: filters.technology_id === t.id ? undefined : t.id, technology_name: undefined })}
                                className={cn(
                                    'cursor-pointer rounded-full border px-2.5 py-1 text-[10px] transition-all duration-150',
                                    filters.technology_id === t.id
                                        ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                                        : 'border-white/[0.07] text-white/40 hover:border-white/[0.14] hover:text-white/70',
                                )}
                                style={filters.technology_id === t.id && t.color ? {
                                    borderColor: t.color + '50',
                                    backgroundColor: t.color + '15',
                                    color: t.color,
                                } : undefined}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Award Rank">
                <div className="grid grid-cols-2 gap-1.5">
                    {AWARD_RANKS.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => onChange({ award_rank: filters.award_rank === r.value ? undefined : r.value, winning_only: filters.award_rank === r.value ? undefined : true })}
                            className={cn(
                                'cursor-pointer rounded-lg border py-1.5 text-center text-[10px] transition-all duration-150',
                                filters.award_rank === r.value
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                                    : 'border-white/[0.07] text-white/40 hover:border-white/[0.14] hover:text-white/70',
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {facets.departments.length > 0 && (
                <FilterSection title="Department">
                    <select
                        value={filters.department ?? ''}
                        onChange={e => onChange({ department: e.target.value || undefined })}
                        className="w-full cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white outline-none transition-colors focus:border-violet-500/40"
                    >
                        <option value="">All departments</option>
                        {facets.departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </FilterSection>
            )}

            {facets.years.length > 0 && (
                <FilterSection title="Academic Year">
                    <div className="flex flex-wrap gap-1.5">
                        {facets.years.map(y => (
                            <button
                                key={y}
                                type="button"
                                onClick={() => onChange({ academic_year: String(filters.academic_year) === String(y) ? undefined : String(y) })}
                                className={cn(
                                    'cursor-pointer rounded-lg border px-2.5 py-1 text-[10px] transition-all duration-150',
                                    String(filters.academic_year) === String(y)
                                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                        : 'border-white/[0.07] text-white/40 hover:border-white/[0.14] hover:text-white/70',
                                )}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}
        </aside>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="glass mb-5 flex h-16 w-16 items-center justify-center">
                <Search className="h-7 w-7 text-white/20" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-white/80">No results found</h3>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/40">
                {hasFilters
                    ? 'Try adjusting your filters or search terms.'
                    : 'No projects are available right now.'}
            </p>
            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="btn-primary cursor-pointer"
                >
                    Clear all filters
                </button>
            )}
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SearchPage({ projects, filters: initialFilters, facets }: Props) {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const navigate = useCallback(
        debounce((f: SearchFilters) => {
            setNavigating(true);
            router.get(buildUrl(f), {}, {
                preserveScroll: false,
                onFinish: () => setNavigating(false),
            });
        }, DEBOUNCE_MS),
        []
    );

    const onChange = useCallback((patch: Partial<SearchFilters>) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        navigate(next);
    }, [filters, navigate]);

    const onClear = useCallback(() => {
        const cleared: SearchFilters = { sort: filters.sort, direction: filters.direction };
        setFilters(cleared);
        navigate(cleared);
    }, [filters.sort, filters.direction, navigate]);

    const onPage = useCallback((page: number) => {
        const url = buildUrl(filters) + (Object.keys(filters).length ? '&' : '?') + `page=${page}`;
        setNavigating(true);
        router.get(url, {}, { onFinish: () => setNavigating(false) });
    }, [filters]);

    // Active chips
    const activeChips: { key: string; label: string; remove: () => void }[] = [];
    if (filters.search)           activeChips.push({ key: 'search',    label: `"${filters.search}"`,                remove: () => onChange({ search: undefined }) });
    if (filters.student_name)     activeChips.push({ key: 'student',   label: `Student: ${filters.student_name}`,   remove: () => onChange({ student_name: undefined }) });
    if (filters.supervisor)       activeChips.push({ key: 'super',     label: `Supervisor: ${filters.supervisor}`,  remove: () => onChange({ supervisor: undefined }) });
    if (filters.technology_id)  { const t = facets.technologies.find(x => x.id === filters.technology_id); if (t) activeChips.push({ key: 'tech', label: t.name, remove: () => onChange({ technology_id: undefined }) }); }
    if (filters.technology_name)  activeChips.push({ key: 'tech_n',   label: `Tech: ${filters.technology_name}`,   remove: () => onChange({ technology_name: undefined }) });
    if (filters.competition_id) { const c = facets.competitions.find(x => x.id === filters.competition_id); if (c) activeChips.push({ key: 'comp', label: c.name, remove: () => onChange({ competition_id: undefined }) }); }
    if (filters.competition_name) activeChips.push({ key: 'comp_n',   label: `Comp: ${filters.competition_name}`,  remove: () => onChange({ competition_name: undefined }) });
    if (filters.category_id)    { const c = facets.categories.find(x => x.id === filters.category_id); if (c) activeChips.push({ key: 'cat', label: c.name, remove: () => onChange({ category_id: undefined }) }); }
    if (filters.award_name)       activeChips.push({ key: 'award',    label: `Award: ${filters.award_name}`,        remove: () => onChange({ award_name: undefined }) });
    if (filters.award_rank)       activeChips.push({ key: 'rank',     label: `Rank: ${filters.award_rank}`,         remove: () => onChange({ award_rank: undefined }) });
    if (filters.department)       activeChips.push({ key: 'dept',     label: `Dept: ${filters.department}`,         remove: () => onChange({ department: undefined }) });
    if (filters.academic_year)    activeChips.push({ key: 'year',     label: `Year: ${filters.academic_year}`,      remove: () => onChange({ academic_year: undefined }) });
    if (filters.winning_only)     activeChips.push({ key: 'winning',  label: 'Winning Projects',                    remove: () => onChange({ winning_only: undefined, award_rank: undefined }) });
    if (filters.featured_only)    activeChips.push({ key: 'featured', label: 'Featured',                            remove: () => onChange({ featured_only: undefined }) });

    const { data: results, ...meta } = projects;

    return (
        <AppLayout>
            <Head title="Search Projects — AiKFS" />

            {/* Ambient background */}
            <AmbientBackground className="z-0" />

            <div className="relative min-h-screen" style={{ background: '#080810' }}>
                <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">

                    {/* ── Page header ─────────────────────────────────────── */}
                    <Reveal className="mb-8">
                        <div className="label-chip mb-4">
                            <Search className="h-3 w-3" />
                            Project Search
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Discover AI Projects
                        </h1>
                        <p className="mt-2 text-sm text-white/40">
                            <span className="tabular font-semibold text-white/70">{meta.total.toLocaleString()}</span>
                            {' '}project{meta.total !== 1 ? 's' : ''} across the Faculty of AI showcase
                        </p>
                    </Reveal>

                    {/* ── Main search bar ──────────────────────────────────── */}
                    <Reveal className="mb-5">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                value={filters.search ?? ''}
                                onChange={e => onChange({ search: e.target.value || undefined })}
                                placeholder="Search projects, topics, technologies…"
                                autoFocus
                                aria-label="Search projects"
                                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3.5 pl-12 pr-12 text-[15px] text-white placeholder:text-white/25 outline-none backdrop-blur-sm transition-all focus:border-violet-500/45 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/15"
                            />
                            {navigating && (
                                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-400" />
                            )}
                        </div>
                    </Reveal>

                    {/* ── Sort tabs ────────────────────────────────────────── */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {SORT_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const active = (filters.sort ?? 'published_at') === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => onChange({ sort: opt.value, direction: 'desc' })}
                                        className={cn(
                                            'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                            active
                                                ? 'border-violet-500/30 bg-violet-500/12 text-violet-300'
                                                : 'border-white/[0.07] text-white/40 hover:border-white/[0.13] hover:text-white/70',
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(v => !v)}
                            className="lg:hidden inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/40 transition-colors hover:border-white/[0.14] hover:text-white/70"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {activeChips.length > 0 && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ── Active chips ─────────────────────────────────────── */}
                    <AnimatePresence>
                        {activeChips.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-5 flex flex-wrap gap-2 overflow-hidden"
                            >
                                {activeChips.map(chip => (
                                    <ActiveChip key={chip.key} label={chip.label} onRemove={chip.remove} />
                                ))}
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="cursor-pointer text-xs text-white/30 underline underline-offset-2 transition-colors hover:text-white/60"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Layout ───────────────────────────────────────────── */}
                    <div className="flex items-start gap-6">

                        {/* Desktop sidebar */}
                        <div className="hidden lg:block sticky top-6">
                            <FilterPanel filters={filters} facets={facets} onChange={onChange} onClear={onClear} />
                        </div>

                        {/* Mobile drawer */}
                        <AnimatePresence>
                            {sidebarOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setSidebarOpen(false)}
                                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                                    />
                                    <motion.div
                                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                        className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/[0.07] bg-[#0c0c14] p-5 lg:hidden"
                                    >
                                        <div className="mb-5 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white/85">Filters</span>
                                            <button type="button" onClick={() => setSidebarOpen(false)}
                                                className="cursor-pointer text-white/35 transition-colors hover:text-white/70">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <FilterPanel filters={filters} facets={facets} onChange={onChange} onClear={onClear} />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Results */}
                        <div className="min-w-0 flex-1">
                            {results.length === 0 ? (
                                <EmptyState hasFilters={activeChips.length > 0} onClear={onClear} />
                            ) : (
                                <>
                                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {results.map((project, i) => (
                                            <ProjectCard key={project.id} project={project} index={i} />
                                        ))}
                                    </div>

                                    <Pagination meta={meta} onPage={onPage} />

                                    <p className="mt-4 text-center text-xs text-white/25">
                                        Showing <span className="tabular">{meta.from ?? 0}–{meta.to ?? 0}</span> of{' '}
                                        <span className="tabular">{meta.total.toLocaleString()}</span> results
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
