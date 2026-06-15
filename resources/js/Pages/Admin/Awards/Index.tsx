import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Plus, Pencil, Trash2, Trophy, Medal, Crown,
    CheckCircle, X, Save, Search, Loader2, ShieldCheck,
    Star, Sparkles,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import StatCard from '@/components/admin/StatCard';
import { cn } from '@/lib/utils';
import type { Award as AwardType, AwardStats, AwardRank, Competition, SharedProps } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const RANK_META: Record<AwardRank, { label: string; color: string; icon: React.ElementType }> = {
    first:             { label: '1st Place',        color: '#F59E0B', icon: Crown },
    second:            { label: '2nd Place',         color: '#94A3B8', icon: Medal },
    third:             { label: '3rd Place',         color: '#CD7C30', icon: Medal },
    honorable_mention: { label: 'Honorable Mention', color: '#3B82F6', icon: Award },
    finalist:          { label: 'Finalist',          color: '#A855F7', icon: Star },
    special:           { label: 'Special Award',     color: '#EC4899', icon: Sparkles },
};

const EMPTY_FORM = {
    project_id:     '',
    competition_id: '',
    title:          '',
    title_ar:       '',
    issuer:         '',
    rank:           '' as AwardRank | '',
    awarded_at:     '',
    academic_year:  new Date().getFullYear(),
    notes:          '',
    is_verified:    false,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectSummary {
    id: string;
    title: string;
    slug: string;
    department: string | null;
    academic_year: number | null;
}

interface Props {
    awards:       AwardType[];
    stats:        AwardStats;
    competitions: Competition[];
    projects:     ProjectSummary[];
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

function FlashBanner() {
    const { flash } = usePage<SharedProps>().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
                'mb-4 rounded-lg border px-4 py-2.5 text-sm font-medium',
                flash.success
                    ? 'border-[#22C55E]/25 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#EF4444]/25 bg-[#EF4444]/10 text-[#EF4444]'
            )}
        >
            {flash.success ?? flash.error}
        </motion.div>
    );
}

// ─── Award Form Modal ─────────────────────────────────────────────────────────

interface FormModalProps {
    editing:      AwardType | null;
    competitions: Competition[];
    projects:     ProjectSummary[];
    onClose:      () => void;
}

function FormModal({ editing, competitions, projects, onClose }: FormModalProps) {
    const [form, setForm] = useState(editing ? {
        project_id:     editing.project?.id ?? '',
        competition_id: editing.competition?.id ?? '',
        title:          editing.title,
        title_ar:       editing.title_ar ?? '',
        issuer:         editing.issuer ?? '',
        rank:           editing.rank ?? ('' as AwardRank | ''),
        awarded_at:     editing.awarded_at ?? '',
        academic_year:  editing.academic_year ?? new Date().getFullYear(),
        notes:          editing.notes ?? '',
        is_verified:    editing.is_verified,
    } : { ...EMPTY_FORM });

    const [processing, setProcessing] = useState(false);
    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const submit = () => {
        setProcessing(true);
        const payload = { ...form, rank: form.rank || null, competition_id: form.competition_id || null };
        if (editing) {
            router.put(`/admin/awards/${editing.id}`, payload as never, {
                onFinish: () => setProcessing(false),
                onSuccess: onClose,
            });
        } else {
            router.post('/admin/awards', payload as never, {
                onFinish: () => setProcessing(false),
                onSuccess: onClose,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1E293B] bg-[#0F172A] shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4">
                    <h2 className="text-base font-semibold text-[#F8FAFC]">
                        {editing ? 'Edit Award' : 'New Award'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#475569] hover:bg-[#1E293B] hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    {/* Project */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Project *</label>
                        <select value={form.project_id} onChange={e => set('project_id', e.target.value)}
                            className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                            <option value="">— Select a project —</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}{p.academic_year ? ` (${p.academic_year})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Competition */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Competition</label>
                        <select value={form.competition_id} onChange={e => set('competition_id', e.target.value)}
                            className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                            <option value="">— None —</option>
                            {competitions.map(c => (
                                <option key={c.id} value={c.id}>{c.name}{c.academic_year ? ` (${c.academic_year})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Titles */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Award Title (EN) *</label>
                            <input value={form.title} onChange={e => set('title', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="1st Place — National AI Championship" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Award Title (AR)</label>
                            <input value={form.title_ar} onChange={e => set('title_ar', e.target.value)} dir="rtl"
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="المركز الأول" />
                        </div>
                    </div>

                    {/* Rank + Issuer */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Rank</label>
                            <select value={form.rank} onChange={e => set('rank', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                                <option value="">— No rank —</option>
                                {Object.entries(RANK_META).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Issuer</label>
                            <input value={form.issuer} onChange={e => set('issuer', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="KFUPM, MCIT, etc." />
                        </div>
                    </div>

                    {/* Date + Year */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Awarded Date</label>
                            <input type="date" value={form.awarded_at} onChange={e => set('awarded_at', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Academic Year</label>
                            <input type="number" value={form.academic_year} onChange={e => set('academic_year', +e.target.value)} min={2000} max={2100}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Notes</label>
                        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                            className="w-full resize-none rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none" />
                    </div>

                    {/* Verified */}
                    <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)}
                            className="h-4 w-4 rounded border-[#334155] bg-[#020617] accent-[#22C55E]" />
                        <span className="text-sm text-[#94A3B8]">Mark as verified</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#1E293B] px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-[#1E293B] px-4 py-2 text-sm text-[#94A3B8] hover:bg-[#1E293B]">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={processing || !form.title || !form.project_id}
                        className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:bg-[#16A34A] disabled:opacity-50">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editing ? 'Save Changes' : 'Create Award'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Award Card ───────────────────────────────────────────────────────────────

function AwardCard({
    award, onEdit, onDelete, onVerify,
}: {
    award: AwardType;
    onEdit: () => void;
    onDelete: () => void;
    onVerify: () => void;
}) {
    const rm = award.rank ? RANK_META[award.rank] : null;
    const RankIcon = rm?.icon ?? Award;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col gap-3 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 transition-all hover:border-[#334155]"
            style={rm ? { borderColor: `${rm.color}22` } : undefined}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${(rm?.color ?? '#475569')}18`, border: `1.5px solid ${(rm?.color ?? '#475569')}33` }}>
                        <RankIcon className="h-5 w-5" style={{ color: rm?.color ?? '#475569' }} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#F8FAFC]">{award.title}</p>
                        {award.title_ar && (
                            <p className="truncate text-xs text-[#475569]" dir="rtl">{award.title_ar}</p>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!award.is_verified && (
                        <button onClick={onVerify} title="Verify"
                            className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#22C55E]/30 hover:bg-[#22C55E]/10 hover:text-[#22C55E]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button onClick={onEdit}
                        className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#EF4444]/30 hover:bg-[#EF4444]/10 hover:text-[#EF4444]">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
                {rm && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold"
                        style={{ color: rm.color, borderColor: `${rm.color}33`, background: `${rm.color}11` }}>
                        {rm.label}
                    </span>
                )}
                {award.is_verified ? (
                    <AdminBadge variant="success" dot><CheckCircle className="h-2.5 w-2.5" /> Verified</AdminBadge>
                ) : (
                    <AdminBadge variant="neutral">Unverified</AdminBadge>
                )}
            </div>

            {/* Project */}
            {award.project && (
                <div className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-black text-white"
                        style={{ background: award.project.category?.color ? `${award.project.category.color}33` : '#1E293B' }}>
                        {award.project.category?.name?.slice(0, 2).toUpperCase() ?? 'P'}
                    </div>
                    <p className="truncate text-xs font-medium text-[#94A3B8]">{award.project.title}</p>
                </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
                {award.competition && (
                    <div>
                        <span className="text-[#334155]">Competition: </span>
                        <span className="text-[#64748B]">{award.competition.name}</span>
                    </div>
                )}
                {award.issuer && (
                    <div>
                        <span className="text-[#334155]">Issuer: </span>
                        <span className="text-[#64748B]">{award.issuer}</span>
                    </div>
                )}
                {award.awarded_at && (
                    <div>
                        <span className="text-[#334155]">Date: </span>
                        <span className="text-[#64748B]">{award.awarded_at}</span>
                    </div>
                )}
                {award.academic_year && (
                    <div>
                        <span className="text-[#334155]">Year: </span>
                        <span className="text-[#64748B]">{award.academic_year}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AwardsIndex({ awards, stats, competitions, projects }: Props) {
    const [showForm, setShowForm]           = useState(false);
    const [editingAward, setEditingAward]   = useState<AwardType | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<AwardType | null>(null);
    const [search, setSearch]               = useState('');
    const [filterRank, setFilterRank]       = useState<AwardRank | 'all'>('all');
    const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

    const filtered = awards.filter(a => {
        if (filterRank !== 'all' && a.rank !== filterRank) return false;
        if (filterVerified === 'verified'   && !a.is_verified) return false;
        if (filterVerified === 'unverified' && a.is_verified)  return false;
        if (search) {
            const q = search.toLowerCase();
            if (!a.title.toLowerCase().includes(q) &&
                !(a.project?.title ?? '').toLowerCase().includes(q) &&
                !(a.issuer ?? '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const handleDelete = (a: AwardType) => {
        router.delete(`/admin/awards/${a.id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleVerify = (a: AwardType) => {
        router.post(`/admin/awards/${a.id}/verify`);
    };

    return (
        <AdminLayout
            title="Awards"
            breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Awards' }]}
        >
            <Head title="Awards — Admin" />

            <FlashBanner />

            <PageHeader
                title="Awards"
                description="Create and manage awards issued to projects across competitions."
                actions={
                    <button
                        onClick={() => { setEditingAward(null); setShowForm(true); }}
                        className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-3 py-2 text-sm font-medium text-white hover:bg-[#16A34A]"
                    >
                        <Plus className="h-4 w-4" /> Assign Award
                    </button>
                }
            />

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
                <StatCard title="Total"    value={stats.total}    icon={Trophy}      color="yellow"  index={0} />
                <StatCard title="Verified" value={stats.verified} icon={CheckCircle} color="green"   index={1} />
                <StatCard title="1st"      value={stats.first}    icon={Crown}       color="yellow"  index={2} />
                <StatCard title="2nd"      value={stats.second}   icon={Medal}       color="default" index={3} />
                <StatCard title="3rd"      value={stats.third}    icon={Medal}       color="default" index={4} />
                <StatCard title="Special"  value={stats.special}  icon={Sparkles}    color="purple"  index={5} />
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-50 flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search awards…"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none" />
                </div>
                <select value={filterRank} onChange={e => setFilterRank(e.target.value as AwardRank | 'all')}
                    className="rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-sm text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none">
                    <option value="all">All Ranks</option>
                    {Object.entries(RANK_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>
                <div className="flex gap-1">
                    {(['all', 'verified', 'unverified'] as const).map(v => (
                        <button key={v} onClick={() => setFilterVerified(v)}
                            className={cn(
                                'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                                filterVerified === v
                                    ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]'
                                    : 'border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#94A3B8]'
                            )}>
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E293B] py-16">
                    <Award className="mb-3 h-8 w-8 text-[#334155]" />
                    <p className="text-sm text-[#475569]">No awards found.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(a => (
                        <AwardCard
                            key={a.id}
                            award={a}
                            onEdit={() => { setEditingAward(a); setShowForm(true); }}
                            onDelete={() => setDeleteConfirm(a)}
                            onVerify={() => handleVerify(a)}
                        />
                    ))}
                </div>
            )}

            {/* Form modal */}
            <AnimatePresence>
                {showForm && (
                    <FormModal
                        editing={editingAward}
                        competitions={competitions}
                        projects={projects}
                        onClose={() => { setShowForm(false); setEditingAward(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10 w-full max-w-sm rounded-2xl border border-[#EF4444]/30 bg-[#0F172A] p-6 shadow-2xl"
                        >
                            <p className="mb-1 text-sm font-semibold text-[#F8FAFC]">Delete "{deleteConfirm.title}"?</p>
                            <p className="mb-5 text-xs text-[#475569]">This permanently removes the award record.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="rounded-lg border border-[#1E293B] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#1E293B]">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#EF4444] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#DC2626]">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
