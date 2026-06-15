import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Plus, Pencil, Trash2, Globe, Calendar,
    CheckCircle, Clock, XCircle, Archive,
    Link2, X, Save, Search, Loader2, ExternalLink,
    Star, FolderOpen, Medal,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import StatCard from '@/components/admin/StatCard';
import { cn } from '@/lib/utils';
import type {
    Competition, CompetitionStats, CompetitionLevel, CompetitionStatus,
    CompetitionProjectEntry, AwardRank, SubmissionStatus, SharedProps,
} from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<CompetitionStatus, {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
    icon: React.ElementType;
}> = {
    active:    { label: 'Active',    variant: 'success', icon: CheckCircle },
    upcoming:  { label: 'Upcoming',  variant: 'info',    icon: Clock },
    completed: { label: 'Completed', variant: 'neutral', icon: Archive },
    cancelled: { label: 'Cancelled', variant: 'danger',  icon: XCircle },
};

const LEVEL_META: Record<CompetitionLevel, { label: string; color: string }> = {
    university:    { label: 'University',    color: '#22C55E' },
    national:      { label: 'National',      color: '#3B82F6' },
    regional:      { label: 'Regional',      color: '#A855F7' },
    international: { label: 'International', color: '#F59E0B' },
};

const RANK_META: Record<AwardRank, { label: string; color: string }> = {
    first:             { label: '1st Place',        color: '#F59E0B' },
    second:            { label: '2nd Place',         color: '#94A3B8' },
    third:             { label: '3rd Place',         color: '#CD7C30' },
    honorable_mention: { label: 'Honorable Mention', color: '#3B82F6' },
    finalist:          { label: 'Finalist',          color: '#A855F7' },
    special:           { label: 'Special Award',     color: '#EC4899' },
};

const SUBMISSION_STATUS_META: Record<SubmissionStatus, {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'purple';
}> = {
    submitted:    { label: 'Submitted',    variant: 'info' },
    shortlisted:  { label: 'Shortlisted',  variant: 'warning' },
    finalist:     { label: 'Finalist',     variant: 'purple' },
    winner:       { label: 'Winner',       variant: 'success' },
    disqualified: { label: 'Disqualified', variant: 'danger' },
    withdrawn:    { label: 'Withdrawn',    variant: 'neutral' },
};

const EMPTY_FORM = {
    name: '', name_ar: '', description: '', description_ar: '',
    organizer: '', website_url: '', level: 'national' as CompetitionLevel,
    status: 'upcoming' as CompetitionStatus,
    start_date: '', end_date: '',
    academic_year: new Date().getFullYear(),
    is_featured: false, sort_order: 0,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    competitions: Competition[];
    stats: CompetitionStats;
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

// ─── Competition Form Modal ────────────────────────────────────────────────────

interface FormModalProps {
    editing: Competition | null;
    onClose: () => void;
}

function FormModal({ editing, onClose }: FormModalProps) {
    const [form, setForm] = useState(editing ? {
        name:            editing.name,
        name_ar:         editing.name_ar ?? '',
        description:     editing.description ?? '',
        description_ar:  editing.description_ar ?? '',
        organizer:       editing.organizer ?? '',
        website_url:     editing.website_url ?? '',
        level:           editing.level,
        status:          editing.status,
        start_date:      editing.start_date ?? '',
        end_date:        editing.end_date ?? '',
        academic_year:   editing.academic_year ?? new Date().getFullYear(),
        is_featured:     editing.is_featured,
        sort_order:      editing.sort_order,
    } : { ...EMPTY_FORM });

    const [processing, setProcessing] = useState(false);

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const submit = () => {
        setProcessing(true);
        if (editing) {
            router.put(`/admin/competitions/${editing.id}`, form as never, {
                onFinish: () => setProcessing(false),
                onSuccess: onClose,
            });
        } else {
            router.post('/admin/competitions', form as never, {
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
                className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1E293B] bg-[#0F172A] shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4">
                    <h2 className="text-base font-semibold text-[#F8FAFC]">
                        {editing ? 'Edit Competition' : 'New Competition'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#475569] hover:bg-[#1E293B] hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    {/* Names */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Name (EN) *</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="Competition name" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Name (AR)</label>
                            <input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} dir="rtl"
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="اسم المسابقة" />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Description (EN)</label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                                className="w-full resize-none rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Description (AR)</label>
                            <textarea value={form.description_ar} onChange={e => set('description_ar', e.target.value)} rows={3} dir="rtl"
                                className="w-full resize-none rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                    </div>

                    {/* Organizer + URL */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Organizer</label>
                            <input value={form.organizer} onChange={e => set('organizer', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="KFUPM, STC, etc." />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Website URL</label>
                            <input value={form.website_url} onChange={e => set('website_url', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                                placeholder="https://…" />
                        </div>
                    </div>

                    {/* Level, Status, Year */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Level *</label>
                            <select value={form.level} onChange={e => set('level', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                                {Object.entries(LEVEL_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Status *</label>
                            <select value={form.status} onChange={e => set('status', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Academic Year</label>
                            <input type="number" value={form.academic_year} onChange={e => set('academic_year', +e.target.value)} min={2000} max={2100}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Start Date</label>
                            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">End Date</label>
                            <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="flex items-center gap-6">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}
                                className="h-4 w-4 rounded border-[#334155] bg-[#020617] accent-[#F59E0B]" />
                            <span className="text-sm text-[#94A3B8]">Featured</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-[#94A3B8]">Sort Order</label>
                            <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} min={0}
                                className="w-20 rounded-lg border border-[#1E293B] bg-[#020617] px-2 py-1.5 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#1E293B] px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-[#1E293B] px-4 py-2 text-sm text-[#94A3B8] hover:bg-[#1E293B]">
                        Cancel
                    </button>
                    <button onClick={submit} disabled={processing || !form.name}
                        className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:bg-[#16A34A] disabled:opacity-50">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editing ? 'Save Changes' : 'Create Competition'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Rank Edit Sub-modal ──────────────────────────────────────────────────────

function RankEditModal({
    entry, onClose, onSave,
}: {
    entry: CompetitionProjectEntry;
    onClose: () => void;
    onSave: (s: SubmissionStatus, r: AwardRank | null) => void;
}) {
    const [status, setStatus] = useState<SubmissionStatus>(entry.submission_status);
    const [rank, setRank]     = useState<AwardRank | ''>(entry.award_rank ?? '');

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-sm rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5 shadow-2xl"
            >
                <h3 className="mb-4 text-sm font-semibold text-[#F8FAFC]">Update Rank — {entry.title}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Submission Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as SubmissionStatus)}
                            className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                            {Object.entries(SUBMISSION_STATUS_META).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Award Rank</label>
                        <select value={rank} onChange={e => setRank(e.target.value as AwardRank | '')}
                            className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none">
                            <option value="">— No rank —</option>
                            {Object.entries(RANK_META).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border border-[#1E293B] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#1E293B]">
                        Cancel
                    </button>
                    <button onClick={() => onSave(status, rank || null)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#16A34A]">
                        <Save className="h-3.5 w-3.5" /> Save
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Projects Panel ───────────────────────────────────────────────────────────

interface ProjectsPanelProps {
    competition: Competition;
    onClose: () => void;
}

function ProjectsPanel({ competition, onClose }: ProjectsPanelProps) {
    const [projects, setProjects]         = useState<CompetitionProjectEntry[]>([]);
    const [loading, setLoading]           = useState(true);
    const [searchQ, setSearchQ]           = useState('');
    const [searchResults, setSearchResults] = useState<CompetitionProjectEntry[]>([]);
    const [searching, setSearching]       = useState(false);
    const [editingEntry, setEditingEntry] = useState<CompetitionProjectEntry | null>(null);

    const csrf = () =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    const load = useCallback(() => {
        setLoading(true);
        fetch(`/admin/competitions/${competition.id}/projects`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
        })
            .then(r => r.json())
            .then((data: CompetitionProjectEntry[]) => { setProjects(data); setLoading(false); });
    }, [competition.id]);

    React.useEffect(() => { load(); }, [load]);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setSearchResults([]); return; }
        setSearching(true);
        const r = await fetch(
            `/admin/competitions/${competition.id}/search-projects?q=${encodeURIComponent(q)}`,
            { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } },
        );
        const data = await r.json() as CompetitionProjectEntry[];
        setSearchResults(data);
        setSearching(false);
    }, [competition.id]);

    React.useEffect(() => {
        const t = setTimeout(() => doSearch(searchQ), 300);
        return () => clearTimeout(t);
    }, [searchQ, doSearch]);

    const attach = async (projectId: string) => {
        await fetch(`/admin/competitions/${competition.id}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
            body: JSON.stringify({ project_id: projectId }),
        });
        setSearchQ('');
        setSearchResults([]);
        load();
    };

    const detach = async (projectId: string) => {
        await fetch(`/admin/competitions/${competition.id}/projects`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
            body: JSON.stringify({ project_id: projectId }),
        });
        load();
    };

    const updateRank = async (projectId: string, submissionStatus: SubmissionStatus, awardRank: AwardRank | null) => {
        await fetch(`/admin/competitions/${competition.id}/projects/rank`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
            body: JSON.stringify({ project_id: projectId, submission_status: submissionStatus, award_rank: awardRank }),
        });
        setEditingEntry(null);
        load();
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                className="relative z-10 ml-auto flex h-full w-full max-w-xl flex-col border-l border-[#1E293B] bg-[#0F172A]"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1E293B] px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-[#F8FAFC]">{competition.name}</h2>
                        <p className="text-xs text-[#475569]">{projects.length} projects linked</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#475569] hover:bg-[#1E293B] hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search to link */}
                <div className="border-b border-[#1E293B] p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569]" />
                        <input
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                            placeholder="Search projects to link…"
                            className="w-full rounded-lg border border-[#1E293B] bg-[#020617] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none"
                        />
                        {searching && <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[#475569]" />}
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 divide-y divide-[#1E293B] rounded-lg border border-[#1E293B] bg-[#020617]">
                            {searchResults.map(p => (
                                <button key={p.id} onClick={() => attach(p.id)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#0F172A]">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                                        style={{
                                            background: p.category?.color ? `${p.category.color}33` : '#1E293B',
                                            border: `1px solid ${(p.category?.color ?? '#334155')}44`,
                                        }}>
                                        {p.category?.name?.slice(0, 2).toUpperCase() ?? 'P'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-[#F8FAFC]">{p.title}</p>
                                        <p className="text-[10px] text-[#475569]">
                                            {p.department ?? ''}{p.academic_year ? ` · ${p.academic_year}` : ''}
                                        </p>
                                    </div>
                                    <Plus className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Linked projects */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-5 w-5 animate-spin text-[#475569]" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="py-12 text-center text-sm text-[#475569]">No projects linked yet.</div>
                    ) : (
                        <div className="divide-y divide-[#0F172A]">
                            {projects.map(p => (
                                <div key={p.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-[#0F172A]/50">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-black text-white"
                                        style={{ background: p.category?.color ? `${p.category.color}33` : '#1E293B' }}>
                                        {p.submission_number ?? '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-[#F8FAFC]">{p.title}</p>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            <AdminBadge variant={SUBMISSION_STATUS_META[p.submission_status].variant}>
                                                {SUBMISSION_STATUS_META[p.submission_status].label}
                                            </AdminBadge>
                                            {p.award_rank && (
                                                <span
                                                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                                                    style={{
                                                        color:       RANK_META[p.award_rank].color,
                                                        borderColor: `${RANK_META[p.award_rank].color}33`,
                                                        background:  `${RANK_META[p.award_rank].color}11`,
                                                    }}
                                                >
                                                    <Medal className="h-2.5 w-2.5" />
                                                    {RANK_META[p.award_rank].label}
                                                </span>
                                            )}
                                        </div>
                                        {p.owner && (
                                            <p className="mt-1 text-[10px] text-[#334155]">{p.owner.name}</p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button onClick={() => setEditingEntry(p)}
                                            className="rounded-md p-1 text-[#475569] hover:bg-[#1E293B] hover:text-[#3B82F6]">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => detach(p.id)}
                                            className="rounded-md p-1 text-[#475569] hover:bg-[#1E293B] hover:text-[#EF4444]">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {editingEntry && (
                    <RankEditModal
                        entry={editingEntry}
                        onClose={() => setEditingEntry(null)}
                        onSave={(status, rank) => updateRank(editingEntry.id, status, rank)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Competition Card ─────────────────────────────────────────────────────────

function CompetitionCard({
    competition, onEdit, onDelete, onManageProjects,
}: {
    competition: Competition;
    onEdit: () => void;
    onDelete: () => void;
    onManageProjects: () => void;
}) {
    const sm = STATUS_META[competition.status];
    const lm = LEVEL_META[competition.level];
    const StatusIcon = sm.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col gap-3 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 transition-all hover:border-[#334155]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${lm.color}18`, border: `1.5px solid ${lm.color}33` }}>
                        <Trophy className="h-5 w-5" style={{ color: lm.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#F8FAFC]">{competition.name}</p>
                        {competition.name_ar && (
                            <p className="truncate text-xs text-[#475569]" dir="rtl">{competition.name_ar}</p>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={onManageProjects} title="Manage Projects"
                        className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6]">
                        <Link2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onEdit}
                        className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#22C55E]/30 hover:bg-[#22C55E]/10 hover:text-[#22C55E]">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="rounded-lg border border-[#1E293B] p-1.5 text-[#475569] hover:border-[#EF4444]/30 hover:bg-[#EF4444]/10 hover:text-[#EF4444]">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <AdminBadge variant={sm.variant} dot>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {sm.label}
                </AdminBadge>
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: lm.color, borderColor: `${lm.color}33`, background: `${lm.color}11` }}>
                    <Globe className="h-2.5 w-2.5" />{lm.label}
                </span>
                {competition.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-medium text-[#F59E0B]">
                        <Star className="h-2.5 w-2.5" /> Featured
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-[#1E293B] bg-[#020617] p-2 text-center">
                    <p className="text-sm font-bold text-[#F8FAFC]">{competition.projects_count}</p>
                    <p className="text-[10px] text-[#475569]">Projects</p>
                </div>
                <div className="rounded-lg border border-[#1E293B] bg-[#020617] p-2 text-center">
                    <p className="text-sm font-bold text-[#F8FAFC]">{competition.academic_year ?? '—'}</p>
                    <p className="text-[10px] text-[#475569]">Year</p>
                </div>
                <div className="rounded-lg border border-[#1E293B] bg-[#020617] p-2 text-center">
                    <p className="truncate text-sm font-bold text-[#F8FAFC]">{competition.organizer?.slice(0, 8) ?? '—'}</p>
                    <p className="text-[10px] text-[#475569]">Organizer</p>
                </div>
            </div>

            {(competition.start_date || competition.end_date) && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#475569]">
                    <Calendar className="h-3 w-3" />
                    {competition.start_date ?? '?'} → {competition.end_date ?? '?'}
                </div>
            )}

            {competition.website_url && (
                <a href={competition.website_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 truncate text-[11px] text-[#3B82F6] hover:underline">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {competition.website_url}
                </a>
            )}
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompetitionsIndex({ competitions, stats }: Props) {
    const [showForm, setShowForm]         = useState(false);
    const [editingComp, setEditingComp]   = useState<Competition | null>(null);
    const [panelComp, setPanelComp]       = useState<Competition | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Competition | null>(null);
    const [filterStatus, setFilterStatus] = useState<CompetitionStatus | 'all'>('all');
    const [search, setSearch]             = useState('');

    const filtered = competitions.filter(c => {
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!c.name.toLowerCase().includes(q) && !(c.name_ar ?? '').includes(search)) return false;
        }
        return true;
    });

    const handleDelete = (c: Competition) => {
        router.delete(`/admin/competitions/${c.id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    return (
        <AdminLayout
            title="Competitions"
            breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Competitions' }]}
        >
            <Head title="Competitions — Admin" />

            <FlashBanner />

            <PageHeader
                title="Competitions"
                description="Manage competitions, link projects, and assign ranks."
                actions={
                    <button
                        onClick={() => { setEditingComp(null); setShowForm(true); }}
                        className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-3 py-2 text-sm font-medium text-white hover:bg-[#16A34A]"
                    >
                        <Plus className="h-4 w-4" /> New Competition
                    </button>
                }
            />

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <StatCard title="Total"          value={stats.total}          icon={Trophy}     color="purple"  index={0} />
                <StatCard title="Active"         value={stats.active}         icon={CheckCircle} color="green"  index={1} />
                <StatCard title="Upcoming"       value={stats.upcoming}       icon={Clock}      color="blue"   index={2} />
                <StatCard title="Completed"      value={stats.completed}      icon={Archive}    color="default" index={3} />
                <StatCard title="Total Projects" value={stats.total_projects} icon={FolderOpen} color="yellow" index={4} />
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-50 flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#475569]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search competitions…"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none" />
                </div>
                <div className="flex gap-1">
                    {(['all', 'active', 'upcoming', 'completed', 'cancelled'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={cn(
                                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                                filterStatus === s
                                    ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]'
                                    : 'border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#94A3B8]'
                            )}>
                            {s === 'all' ? 'All' : STATUS_META[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E293B] py-16">
                    <Trophy className="mb-3 h-8 w-8 text-[#334155]" />
                    <p className="text-sm text-[#475569]">No competitions found.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(c => (
                        <CompetitionCard
                            key={c.id}
                            competition={c}
                            onEdit={() => { setEditingComp(c); setShowForm(true); }}
                            onDelete={() => setDeleteConfirm(c)}
                            onManageProjects={() => setPanelComp(c)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showForm && (
                    <FormModal
                        editing={editingComp}
                        onClose={() => { setShowForm(false); setEditingComp(null); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {panelComp && (
                    <ProjectsPanel
                        competition={panelComp}
                        onClose={() => setPanelComp(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10 w-full max-w-sm rounded-2xl border border-[#EF4444]/30 bg-[#0F172A] p-6 shadow-2xl"
                        >
                            <p className="mb-1 text-sm font-semibold text-[#F8FAFC]">Delete "{deleteConfirm.name}"?</p>
                            <p className="mb-5 text-xs text-[#475569]">This removes the competition and all project links. Awards are kept.</p>
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
