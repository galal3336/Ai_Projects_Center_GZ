import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import type {
    Paginated,
    Project,
    SearchFacets,
    SearchFilters,
} from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    projects: { data: Project[] } & Omit<Paginated<Project>, 'data'>;
    filters: SearchFilters;
    facets: SearchFacets;
}

type SortOption = { value: string; label: string; icon: React.ElementType };

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
    { value: 'published_at',    label: 'Most Recent',   icon: Zap },
    { value: 'views_count',     label: 'Most Viewed',   icon: Flame },
    { value: 'likes_count',     label: 'Most Starred',  icon: Star },
    { value: 'downloads_count', label: 'Most Downloaded', icon: BookOpen },
];

const AWARD_RANKS = [
    { value: 'first',   label: '1st Place' },
    { value: 'second',  label: '2nd Place' },
    { value: 'third',   label: '3rd Place' },
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
        if (v !== undefined && v !== null && v !== '' && v !== false) {
            params.set(k, String(v));
        }
    }
    return '/search?' + params.toString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-medium"
        >
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove filter: ${label}`}
                className="hover:text-white transition-colors cursor-pointer leading-none"
            >
                <X className="w-3 h-3" />
            </button>
        </motion.span>
    );
}

function TechBadge({ name, color }: { name: string; color?: string | null }) {
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border"
            style={color ? {
                borderColor: color + '40',
                backgroundColor: color + '15',
                color,
            } : {
                borderColor: '#334155',
                backgroundColor: '#1E293B',
                color: '#94a3b8',
            }}
        >
            {name}
        </span>
    );
}

function ProjectCard({ project }: { project: Project }) {
    const hasAward = project.awards && project.awards.length > 0;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="group relative flex flex-col rounded-2xl border border-[#1E293B] bg-[#0F172A] overflow-hidden hover:border-[#22C55E]/30 transition-colors duration-200"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] bg-[#020617] overflow-hidden">
                {project.thumbnail ? (
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-[#1E293B]" />
                    </div>
                )}

                {/* Featured ribbon */}
                {project.is_featured && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-bold text-black uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5" /> Featured
                    </span>
                )}

                {/* Award ribbon */}
                {hasAward && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/90 text-[10px] font-bold text-black uppercase tracking-wider">
                        <Trophy className="w-2.5 h-2.5" /> Award
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                {/* Category */}
                {project.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#22C55E]">
                        {project.category.name}
                    </span>
                )}

                <h3 className="text-sm font-semibold text-[#F8FAFC] line-clamp-2 leading-snug group-hover:text-[#22C55E] transition-colors duration-150">
                    {project.title}
                </h3>

                {project.abstract && (
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                        {project.abstract}
                    </p>
                )}

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                        {project.technologies.slice(0, 4).map(t => (
                            <TechBadge key={t.id} name={t.name} color={t.color} />
                        ))}
                        {project.technologies.length > 4 && (
                            <span className="text-[10px] text-[#475569]">
                                +{project.technologies.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] mt-auto">
                    <div className="flex items-center gap-2 text-[10px] text-[#475569]">
                        {project.owner && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {project.owner.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#475569]">
                        <span>{project.views_count.toLocaleString()} views</span>
                        <span>·</span>
                        <span>{project.likes_count.toLocaleString()} ★</span>
                    </div>
                </div>
            </div>

            {/* Full card link */}
            <Link href={`/projects/${project.slug}`} className="absolute inset-0" aria-label={project.title} />
        </motion.article>
    );
}

function Pagination({ meta, onPage }: {
    meta: Omit<Paginated<Project>, 'data'>;
    onPage: (page: number) => void;
}) {
    if (meta.last_page <= 1) return null;

    const pages: (number | null)[] = [];
    for (let i = 1; i <= meta.last_page; i++) {
        if (i === 1 || i === meta.last_page || Math.abs(i - meta.current_page) <= 2) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== null) {
            pages.push(null);
        }
    }

    return (
        <div className="flex items-center justify-center gap-1.5">
            <button
                disabled={meta.current_page <= 1}
                onClick={() => onPage(meta.current_page - 1)}
                className="p-2 rounded-lg border border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:border-[#22C55E]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p, i) =>
                p === null ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-[#475569] text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPage(p)}
                        className={cn(
                            'w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                            p === meta.current_page
                                ? 'bg-[#22C55E] text-black font-semibold'
                                : 'border border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:border-[#22C55E]/40',
                        )}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPage(meta.current_page + 1)}
                className="p-2 rounded-lg border border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:border-[#22C55E]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
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

function FilterPanel({ filters, facets, onChange, onClear }: FilterPanelProps) {
    const hasActive = Object.entries(filters).some(
        ([k, v]) => !['sort', 'direction'].includes(k) && v && v !== false && v !== ''
    );

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
                    <SlidersHorizontal className="w-4 h-4 text-[#22C55E]" />
                    Filters
                </span>
                {hasActive && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* ── Search by field ────────────────────────────────────── */}
            <FilterSection title="Search By">
                <SearchInput
                    icon={BookOpen}
                    placeholder="Project name…"
                    value={filters.search ?? ''}
                    onChange={v => onChange({ search: v || undefined })}
                />
                <SearchInput
                    icon={Users}
                    placeholder="Student name…"
                    value={filters.student_name ?? ''}
                    onChange={v => onChange({ student_name: v || undefined })}
                />
                <SearchInput
                    icon={Award}
                    placeholder="Supervisor name…"
                    value={filters.supervisor ?? ''}
                    onChange={v => onChange({ supervisor: v || undefined })}
                />
                <SearchInput
                    icon={Code2}
                    placeholder="Technology (e.g. React)…"
                    value={filters.technology_name ?? ''}
                    onChange={v => onChange({ technology_name: v || undefined, technology_id: undefined })}
                />
                <SearchInput
                    icon={Trophy}
                    placeholder="Competition name…"
                    value={filters.competition_name ?? ''}
                    onChange={v => onChange({ competition_name: v || undefined, competition_id: undefined })}
                />
                <SearchInput
                    icon={Award}
                    placeholder="Award title…"
                    value={filters.award_name ?? ''}
                    onChange={v => onChange({ award_name: v || undefined })}
                />
            </FilterSection>

            {/* ── Smart Filters ──────────────────────────────────────── */}
            <FilterSection title="Smart Filters">
                <ToggleFilter
                    icon={Trophy}
                    label="Winning Projects"
                    active={!!filters.winning_only}
                    onChange={v => onChange({ winning_only: v || undefined })}
                    color="#f59e0b"
                />
                <ToggleFilter
                    icon={Star}
                    label="Featured Only"
                    active={!!filters.featured_only}
                    onChange={v => onChange({ featured_only: v || undefined })}
                    color="#22C55E"
                />
            </FilterSection>

            {/* ── Category ──────────────────────────────────────────── */}
            {facets.categories.length > 0 && (
                <FilterSection title="Category">
                    <div className="space-y-1">
                        {facets.categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onChange({
                                    category_id: filters.category_id === cat.id ? undefined : cat.id,
                                    category_name: undefined,
                                })}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all duration-150 cursor-pointer',
                                    filters.category_id === cat.id
                                        ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                                        : 'text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B]',
                                )}
                            >
                                {cat.icon && <span>{cat.icon}</span>}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* ── Competition ───────────────────────────────────────── */}
            {facets.competitions.length > 0 && (
                <FilterSection title="Competition">
                    <select
                        value={filters.competition_id ?? ''}
                        onChange={e => onChange({
                            competition_id: e.target.value || undefined,
                            competition_name: undefined,
                        })}
                        className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]/50 cursor-pointer"
                    >
                        <option value="">All competitions</option>
                        {facets.competitions.map(c => (
                            <option key={c.id} value={c.id}>{c.name}{c.academic_year ? ` (${c.academic_year})` : ''}</option>
                        ))}
                    </select>
                </FilterSection>
            )}

            {/* ── Technology chips ──────────────────────────────────── */}
            {facets.technologies.length > 0 && (
                <FilterSection title="Technology">
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {facets.technologies.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => onChange({
                                    technology_id: filters.technology_id === t.id ? undefined : t.id,
                                    technology_name: undefined,
                                })}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-[10px] border transition-all duration-150 cursor-pointer',
                                    filters.technology_id === t.id
                                        ? 'border-[#22C55E]/50 bg-[#22C55E]/15 text-[#22C55E]'
                                        : 'border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#F8FAFC]',
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

            {/* ── Award Rank ────────────────────────────────────────── */}
            <FilterSection title="Award Rank">
                <div className="grid grid-cols-2 gap-1.5">
                    {AWARD_RANKS.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => onChange({
                                award_rank: filters.award_rank === r.value ? undefined : r.value,
                                winning_only: filters.award_rank === r.value ? undefined : true,
                            })}
                            className={cn(
                                'py-1.5 rounded-lg text-[10px] border transition-all duration-150 cursor-pointer text-center',
                                filters.award_rank === r.value
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                                    : 'border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#F8FAFC]',
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* ── Department ────────────────────────────────────────── */}
            {facets.departments.length > 0 && (
                <FilterSection title="Department">
                    <select
                        value={filters.department ?? ''}
                        onChange={e => onChange({ department: e.target.value || undefined })}
                        className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]/50 cursor-pointer"
                    >
                        <option value="">All departments</option>
                        {facets.departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </FilterSection>
            )}

            {/* ── Academic Year ─────────────────────────────────────── */}
            {facets.years.length > 0 && (
                <FilterSection title="Academic Year">
                    <div className="flex flex-wrap gap-1.5">
                        {facets.years.map(y => (
                            <button
                                key={y}
                                type="button"
                                onClick={() => onChange({
                                    academic_year: String(filters.academic_year) === String(y) ? undefined : String(y),
                                })}
                                className={cn(
                                    'px-2.5 py-1 rounded-lg text-[10px] border transition-all duration-150 cursor-pointer',
                                    String(filters.academic_year) === String(y)
                                        ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]'
                                        : 'border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#F8FAFC]',
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#475569]">{title}</p>
            {children}
        </div>
    );
}

function SearchInput({
    icon: Icon, placeholder, value, onChange,
}: {
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative">
            <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569] pointer-events-none" />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg pl-8 pr-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#22C55E]/50 transition-colors"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}

function ToggleFilter({
    icon: Icon, label, active, onChange, color,
}: {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onChange: (v: boolean) => void;
    color?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!active)}
            className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all duration-150 border cursor-pointer',
                active
                    ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B]',
            )}
        >
            <Icon className="w-3.5 h-3.5 shrink-0" style={active && color ? { color } : undefined} />
            {label}
            <span className={cn(
                'ml-auto w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0',
                active ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#334155]',
            )}>
                {active && <span className="w-2 h-2 rounded-sm bg-black" />}
            </span>
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchPage({ projects, filters: initialFilters, facets }: Props) {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounced navigation on filter change
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

    // Active filter chips
    const activeChips: { key: string; label: string; remove: () => void }[] = [];

    if (filters.search) activeChips.push({ key: 'search', label: `"${filters.search}"`, remove: () => onChange({ search: undefined }) });
    if (filters.student_name) activeChips.push({ key: 'student_name', label: `Student: ${filters.student_name}`, remove: () => onChange({ student_name: undefined }) });
    if (filters.supervisor) activeChips.push({ key: 'supervisor', label: `Supervisor: ${filters.supervisor}`, remove: () => onChange({ supervisor: undefined }) });
    if (filters.technology_id) {
        const t = facets.technologies.find(x => x.id === filters.technology_id);
        if (t) activeChips.push({ key: 'tech', label: t.name, remove: () => onChange({ technology_id: undefined }) });
    }
    if (filters.technology_name) activeChips.push({ key: 'tech_name', label: `Tech: ${filters.technology_name}`, remove: () => onChange({ technology_name: undefined }) });
    if (filters.competition_id) {
        const c = facets.competitions.find(x => x.id === filters.competition_id);
        if (c) activeChips.push({ key: 'comp', label: c.name, remove: () => onChange({ competition_id: undefined }) });
    }
    if (filters.competition_name) activeChips.push({ key: 'comp_name', label: `Competition: ${filters.competition_name}`, remove: () => onChange({ competition_name: undefined }) });
    if (filters.category_id) {
        const c = facets.categories.find(x => x.id === filters.category_id);
        if (c) activeChips.push({ key: 'cat', label: c.name, remove: () => onChange({ category_id: undefined }) });
    }
    if (filters.award_name) activeChips.push({ key: 'award', label: `Award: ${filters.award_name}`, remove: () => onChange({ award_name: undefined }) });
    if (filters.award_rank) activeChips.push({ key: 'award_rank', label: `Rank: ${filters.award_rank}`, remove: () => onChange({ award_rank: undefined }) });
    if (filters.department) activeChips.push({ key: 'dept', label: `Dept: ${filters.department}`, remove: () => onChange({ department: undefined }) });
    if (filters.academic_year) activeChips.push({ key: 'year', label: `Year: ${filters.academic_year}`, remove: () => onChange({ academic_year: undefined }) });
    if (filters.winning_only) activeChips.push({ key: 'winning', label: 'Winning Projects', remove: () => onChange({ winning_only: undefined, award_rank: undefined }) });
    if (filters.featured_only) activeChips.push({ key: 'featured', label: 'Featured', remove: () => onChange({ featured_only: undefined }) });

    const { data: results, ...meta } = projects;

    return (
        <AppLayout>
            <Head title="Search Projects" />

            {/* Background glows */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#22C55E]/[0.04] blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-600/[0.04] blur-[100px]" />
            </div>

            <div className="min-h-screen bg-[#020617] text-[#F8FAFC]">
                <div className="max-w-screen-xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                    {/* ── Page Header ──────────────────────────────────── */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#F8FAFC] tracking-tight mb-1">
                            Search Projects
                        </h1>
                        <p className="text-sm text-[#475569]">
                            {meta.total.toLocaleString()} project{meta.total !== 1 ? 's' : ''} across the Faculty of AI showcase
                        </p>
                    </div>

                    {/* ── Main search bar ───────────────────────────────── */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569] pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="search"
                            value={filters.search ?? ''}
                            onChange={e => onChange({ search: e.target.value || undefined })}
                            placeholder="Search projects, topics, technologies…"
                            autoFocus
                            className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl pl-12 pr-4 py-3.5 text-base text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#22C55E]/50 transition-colors"
                        />
                        {navigating && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#22C55E] animate-spin" />
                        )}
                    </div>

                    {/* ── Sort + mobile filter toggle ───────────────────── */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                        {/* Sort tabs */}
                        <div className="flex items-center gap-1 flex-wrap">
                            {SORT_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const active = (filters.sort ?? 'published_at') === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => onChange({ sort: opt.value, direction: 'desc' })}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer',
                                            active
                                                ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                                                : 'border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:border-[#334155]',
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mobile filter toggle */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(v => !v)}
                            className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] text-xs text-[#475569] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filters
                            {activeChips.length > 0 && (
                                <span className="w-4 h-4 rounded-full bg-[#22C55E] text-black text-[9px] font-bold flex items-center justify-center">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ── Active filter chips ───────────────────────────── */}
                    <AnimatePresence>
                        {activeChips.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex flex-wrap gap-2 mb-5 overflow-hidden"
                            >
                                {activeChips.map(chip => (
                                    <ActiveChip key={chip.key} label={chip.label} onRemove={chip.remove} />
                                ))}
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="text-xs text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer underline underline-offset-2"
                                >
                                    Clear all
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Layout ───────────────────────────────────────── */}
                    <div className="flex gap-6 items-start">

                        {/* Desktop sidebar */}
                        <div className="hidden lg:block sticky top-6">
                            <FilterPanel filters={filters} facets={facets} onChange={onChange} onClear={onClear} />
                        </div>

                        {/* Mobile sidebar drawer */}
                        <AnimatePresence>
                            {sidebarOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setSidebarOpen(false)}
                                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                                    />
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '-100%' }}
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                        className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] border-r border-[#1E293B] p-5 overflow-y-auto lg:hidden"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <span className="text-sm font-semibold text-[#F8FAFC]">Filters</span>
                                            <button
                                                type="button"
                                                onClick={() => setSidebarOpen(false)}
                                                className="text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <FilterPanel filters={filters} facets={facets} onChange={onChange} onClear={onClear} />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Results */}
                        <div className="flex-1 min-w-0">
                            {results.length === 0 ? (
                                <EmptyState hasFilters={activeChips.length > 0} onClear={onClear} />
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                                        {results.map(project => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>

                                    <Pagination meta={meta} onPage={onPage} />

                                    <p className="text-center text-xs text-[#475569] mt-4">
                                        Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total.toLocaleString()} results
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

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="w-16 h-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-[#1E293B]" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC] mb-1">No results found</h3>
            <p className="text-sm text-[#475569] max-w-xs">
                {hasFilters
                    ? 'Try adjusting your filters or search terms.'
                    : 'No projects are available right now.'}
            </p>
            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-4 px-4 py-2 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/25 transition-colors cursor-pointer"
                >
                    Clear all filters
                </button>
            )}
        </motion.div>
    );
}
