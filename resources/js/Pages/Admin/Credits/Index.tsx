import React, { useCallback, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext, DragEndEvent, DragOverlay, DragStartEvent,
    KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, arrayMove, sortableKeyboardCoordinates,
    useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Code2, GraduationCap, HeartHandshake, Building2,
    Plus, Pencil, Trash2, GripVertical, Star, StarOff,
    Eye, EyeOff, Link, Globe, Mail,
    X, Save, Upload, Users, Loader2, ChevronDown, GitBranch,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import StatCard from '@/components/admin/StatCard';
import { cn } from '@/lib/utils';
import type {
    CreditsMember, CreditsCategory, CreditsStats, CreditsType, SharedProps,
} from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { key: CreditsCategory; label: string; label_ar: string; icon: React.ElementType; color: string }[] = [
    { key: 'development_team',    label: 'Development Team',    label_ar: 'فريق التطوير',        icon: Code2,         color: '#22C55E' },
    { key: 'faculty_supervisors', label: 'Faculty Supervisors', label_ar: 'المشرفون الأكاديميون', icon: GraduationCap, color: '#3B82F6' },
    { key: 'contributors',        label: 'Contributors',        label_ar: 'المساهمون',            icon: HeartHandshake,color: '#A855F7' },
    { key: 'sponsors',            label: 'Sponsors',            label_ar: 'الرعاة',              icon: Building2,     color: '#F59E0B' },
];

const TYPES: { value: CreditsType; label: string }[] = [
    { value: 'developer',   label: 'Developer' },
    { value: 'designer',    label: 'Designer' },
    { value: 'supervisor',  label: 'Supervisor' },
    { value: 'advisor',     label: 'Advisor' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'alumni',      label: 'Alumni' },
];

const TYPE_VARIANT: Record<CreditsType, 'success' | 'info' | 'purple' | 'warning' | 'neutral'> = {
    developer:   'success',
    designer:    'info',
    supervisor:  'purple',
    advisor:     'purple',
    contributor: 'neutral',
    alumni:      'warning',
};

const EMPTY_FORM = {
    name: '', name_ar: '', title: '', title_ar: '',
    bio: '', bio_ar: '', email: '',
    linkedin_url: '', github_url: '', website_url: '',
    type: 'contributor' as CreditsType,
    category: 'contributors' as CreditsCategory,
    contribution_year: new Date().getFullYear(),
    is_active: true, is_featured: false, sort_order: 0,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    members: CreditsMember[];
    stats:   CreditsStats;
}

// ─── Sortable card ────────────────────────────────────────────────────────────

function SortableCard({
    member, locale, canEdit,
    onEdit, onDelete, onToggleActive, onToggleFeatured,
}: {
    member: CreditsMember;
    locale: 'en' | 'ar';
    canEdit: boolean;
    onEdit: (m: CreditsMember) => void;
    onDelete: (m: CreditsMember) => void;
    onToggleActive: (m: CreditsMember) => void;
    onToggleFeatured: (m: CreditsMember) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: member.id, disabled: !canEdit });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const name  = locale === 'ar' ? (member.name_ar  ?? member.name_en)  : member.name_en;
    const title = locale === 'ar' ? (member.title_ar ?? member.title_en) : member.title_en;

    return (
        <div ref={setNodeRef} style={style}>
            <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                    member.is_active
                        ? 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155]'
                        : 'bg-[#0A0F1A] border-[#1A2235] opacity-60'
                )}
            >
                {/* Drag handle */}
                {canEdit && (
                    <button
                        {...attributes}
                        {...listeners}
                        className="shrink-0 touch-none text-[#334155] hover:text-[#475569] transition-colors cursor-grab active:cursor-grabbing"
                        aria-label="Drag to reorder"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                    {member.avatar ? (
                        <img
                            src={member.avatar}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover border border-[#1E293B]"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-sm font-semibold text-[#475569]">
                            {name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    {member.is_featured && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] rounded-full flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white fill-white" />
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#F8FAFC] truncate">{name}</span>
                        <AdminBadge variant={TYPE_VARIANT[member.type]}>{member.type}</AdminBadge>
                    </div>
                    <p className="text-xs text-[#475569] truncate mt-0.5">{title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        {member.email && (
                            <a href={`mailto:${member.email}`} onClick={e => e.stopPropagation()}
                               className="text-[#334155] hover:text-[#94A3B8] transition-colors">
                                <Mail className="w-3 h-3" />
                            </a>
                        )}
                        {member.linkedin_url && (
                            <a href={member.linkedin_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                               className="text-[#334155] hover:text-[#3B82F6] transition-colors">
                                <Link className="w-3 h-3" />
                            </a>
                        )}
                        {member.github_url && (
                            <a href={member.github_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                               className="text-[#334155] hover:text-[#94A3B8] transition-colors">
                                <GitBranch className="w-3 h-3" />
                            </a>
                        )}
                        {member.website_url && (
                            <a href={member.website_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                               className="text-[#334155] hover:text-[#22C55E] transition-colors">
                                <Globe className="w-3 h-3" />
                            </a>
                        )}
                        {member.contribution_year && (
                            <span className="text-[9px] text-[#334155]">{member.contribution_year}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {canEdit && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onToggleFeatured(member)}
                            title={member.is_featured ? 'Unfeature' : 'Feature'}
                            className={cn(
                                'flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer',
                                member.is_featured
                                    ? 'text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20'
                                    : 'text-[#334155] hover:text-[#F59E0B] hover:bg-[#1E293B]'
                            )}
                        >
                            {member.is_featured ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => onToggleActive(member)}
                            title={member.is_active ? 'Deactivate' : 'Activate'}
                            className={cn(
                                'flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer',
                                member.is_active
                                    ? 'text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20'
                                    : 'text-[#334155] hover:text-[#22C55E] hover:bg-[#1E293B]'
                            )}
                        >
                            {member.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => onEdit(member)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-[#334155] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(member)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-[#334155] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Member form modal ────────────────────────────────────────────────────────

function MemberModal({
    member, locale, defaultCategory, onClose,
}: {
    member: CreditsMember | null;
    locale: 'en' | 'ar';
    defaultCategory: CreditsCategory;
    onClose: () => void;
}) {
    const isEdit = !!member;
    const [form, setForm] = useState(
        member
            ? {
                name: member.name_en, name_ar: member.name_ar ?? '',
                title: member.title_en, title_ar: member.title_ar ?? '',
                bio: member.bio_en ?? '', bio_ar: member.bio_ar ?? '',
                email: member.email ?? '',
                linkedin_url: member.linkedin_url ?? '',
                github_url:   member.github_url   ?? '',
                website_url:  member.website_url  ?? '',
                type:              member.type,
                category:          member.category,
                contribution_year: member.contribution_year ?? new Date().getFullYear(),
                is_active:   member.is_active,
                is_featured: member.is_featured,
                sort_order:  member.sort_order,
            }
            : { ...EMPTY_FORM, category: defaultCategory }
    );

    const [errors, setErrors]       = useState<Record<string, string>>({});
    const [saving, setSaving]       = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(member?.avatar ?? null);
    const [tab, setTab]             = useState<'en' | 'ar'>('en');
    const fileRef                   = useRef<HTMLInputElement>(null);

    const set = (key: string, value: unknown) => {
        setForm(f => ({ ...f, [key]: value }));
        setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const action = isEdit
            ? router.put(`credits/${member!.id}`, form, {
                onError: errs => { setErrors(errs); setSaving(false); },
                onSuccess: async () => {
                    if (avatarFile) await uploadAvatar(member!.id);
                    onClose();
                },
            })
            : router.post('credits', form, {
                onError: errs => { setErrors(errs); setSaving(false); },
                onSuccess: onClose,
            });

        void action;
    };

    const uploadAvatar = async (id: string) => {
        if (!avatarFile) return;
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        await window.axios.post(`credits/${id}/avatar`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    const field = (key: string, label: string, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">{label}</label>
            <input
                type={type}
                value={(form as Record<string, unknown>)[key] as string ?? ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className={cn(
                    'w-full h-8 px-3 rounded-lg bg-[#020617] border text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none transition-colors',
                    errors[key] ? 'border-[#EF4444]' : 'border-[#1E293B] focus:border-[#334155]'
                )}
            />
            {errors[key] && <p className="mt-1 text-[10px] text-[#EF4444]">{errors[key]}</p>}
        </div>
    );

    const textarea = (key: string, label: string, placeholder = '') => (
        <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">{label}</label>
            <textarea
                value={(form as Record<string, unknown>)[key] as string ?? ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={cn(
                    'w-full px-3 py-2 rounded-lg bg-[#020617] border text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none transition-colors resize-none',
                    errors[key] ? 'border-[#EF4444]' : 'border-[#1E293B] focus:border-[#334155]'
                )}
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] shrink-0">
                    <h2 className="text-base font-semibold text-[#F8FAFC]">
                        {isEdit ? 'Edit Member' : 'Add Member'}
                    </h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {/* Avatar upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#1E293B]" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center text-[#475569]">
                                        <Users className="w-6 h-6" />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center shadow-lg hover:bg-[#16A34A] transition-colors cursor-pointer"
                                >
                                    <Upload className="w-3 h-3 text-white" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div className="text-xs text-[#475569]">
                                <p className="font-medium text-[#94A3B8]">Profile photo</p>
                                <p>JPEG, PNG, or WebP · Max 2 MB</p>
                                {!isEdit && avatarFile && (
                                    <p className="text-[#F59E0B] mt-1">Photo will be uploaded after saving.</p>
                                )}
                            </div>
                        </div>

                        {/* Category & Type row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={form.category}
                                        onChange={e => set('category', e.target.value)}
                                        className="w-full h-8 px-3 pr-8 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] outline-none focus:border-[#334155] appearance-none cursor-pointer"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c.key} value={c.key}>{c.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569] pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Role / Type</label>
                                <div className="relative">
                                    <select
                                        value={form.type}
                                        onChange={e => set('type', e.target.value)}
                                        className="w-full h-8 px-3 pr-8 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] outline-none focus:border-[#334155] appearance-none cursor-pointer"
                                    >
                                        {TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Language tabs */}
                        <div>
                            <div className="flex gap-1 p-1 bg-[#020617] border border-[#1E293B] rounded-lg mb-3 w-fit">
                                {(['en', 'ar'] as const).map(l => (
                                    <button key={l} type="button" onClick={() => setTab(l)}
                                        className={cn(
                                            'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                                            tab === l ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#475569] hover:text-[#94A3B8]'
                                        )}
                                    >
                                        {l === 'en' ? 'English' : 'العربية'}
                                    </button>
                                ))}
                            </div>
                            {tab === 'en' ? (
                                <div className="space-y-3">
                                    {field('name', 'Full Name (EN) *', 'text', 'e.g. Ahmed Al-Rashidi')}
                                    {field('title', 'Title / Role (EN) *', 'text', 'e.g. Lead Developer')}
                                    {textarea('bio', 'Short Bio (EN)', 'Brief description…')}
                                </div>
                            ) : (
                                <div className="space-y-3" dir="rtl">
                                    {field('name_ar', 'الاسم الكامل (AR)', 'text', 'مثال: أحمد الراشدي')}
                                    {field('title_ar', 'المسمى الوظيفي (AR)', 'text', 'مثال: كبير المطورين')}
                                    {textarea('bio_ar', 'نبذة مختصرة (AR)', 'وصف مختصر…')}
                                </div>
                            )}
                        </div>

                        {/* Contact links */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Contact & Links</p>
                            <div className="grid grid-cols-2 gap-3">
                                {field('email', 'Email', 'email', 'name@example.com')}
                                {field('contribution_year', 'Year', 'number', String(new Date().getFullYear()))}
                            </div>
                            {field('linkedin_url', 'LinkedIn URL', 'url', 'https://linkedin.com/in/…')}
                            {field('github_url', 'GitHub URL', 'url', 'https://github.com/…')}
                            {field('website_url', 'Website URL', 'url', 'https://…')}
                        </div>

                        {/* Flags */}
                        <div className="flex items-center gap-6 pt-2 border-t border-[#1E293B]">
                            {[
                                { key: 'is_active',   label: 'Active',   desc: 'Visible on site' },
                                { key: 'is_featured', label: 'Featured', desc: 'Highlighted in listing' },
                            ].map(flag => (
                                <label key={flag.key} className="flex items-center gap-3 cursor-pointer group">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={(form as Record<string, unknown>)[flag.key] as boolean}
                                        onClick={() => set(flag.key, !(form as Record<string, unknown>)[flag.key])}
                                        className={cn(
                                            'relative w-9 h-5 rounded-full transition-colors shrink-0',
                                            (form as Record<string, unknown>)[flag.key]
                                                ? 'bg-[#22C55E]'
                                                : 'bg-[#1E293B]'
                                        )}
                                    >
                                        <span className={cn(
                                            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                            (form as Record<string, unknown>)[flag.key] ? 'translate-x-4' : 'translate-x-0'
                                        )} />
                                    </button>
                                    <div>
                                        <p className="text-xs font-medium text-[#94A3B8]">{flag.label}</p>
                                        <p className="text-[10px] text-[#334155]">{flag.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#1E293B] shrink-0 bg-[#0F172A]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 px-4 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="credits-form"
                        disabled={saving}
                        onClick={handleSubmit}
                        className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#22C55E] text-xs font-medium text-white hover:bg-[#16A34A] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isEdit ? 'Save Changes' : 'Add Member'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ member, onClose }: { member: CreditsMember; onClose: () => void }) {
    const [deleting, setDeleting] = useState(false);

    const confirm = () => {
        setDeleting(true);
        router.delete(`credits/${member.id}`, {
            onFinish: onClose,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="w-full max-w-sm bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6"
            >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EF4444]/10 mx-auto mb-4">
                    <Trash2 className="w-5 h-5 text-[#EF4444]" />
                </div>
                <h3 className="text-center text-base font-semibold text-[#F8FAFC] mb-1">Remove Member</h3>
                <p className="text-center text-sm text-[#475569] mb-6">
                    Remove <span className="text-[#F8FAFC] font-medium">{member.name_en}</span> from credits?
                    <br />This action cannot be undone.
                </p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 h-9 rounded-xl text-sm text-[#64748B] hover:bg-[#1E293B] transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={confirm}
                        disabled={deleting}
                        className="flex-1 h-9 rounded-xl bg-[#EF4444] text-sm font-medium text-white hover:bg-[#DC2626] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Remove'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreditsIndex({ members: initial, stats }: Props) {
    const { auth, locale } = usePage<SharedProps>().props;
    const canEdit = auth.user?.role === 'super_admin';

    const [members, setMembers] = useState<CreditsMember[]>(initial);
    const [activeTab, setActiveTab] = useState<CreditsCategory>('development_team');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [editing, setEditing] = useState<CreditsMember | null>(null);
    const [deleting, setDeleting] = useState<CreditsMember | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const tabMembers = members.filter(m => m.category === activeTab);
    const draggingMember = draggingId ? members.find(m => m.id === draggingId) : null;

    const activeCat = CATEGORIES.find(c => c.key === activeTab)!;

    // ── Persist reorder after debounce ───────────────────────────────────────
    const persistOrder = useCallback((updated: CreditsMember[]) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        setSaving(true);
        saveTimeout.current = setTimeout(() => {
            const items = updated
                .filter(m => m.category === activeTab)
                .map((m, i) => ({ id: m.id, sort_order: i }));

            router.post('credits/reorder', { items }, {
                preserveScroll: true,
                preserveState:  true,
                onFinish: () => setSaving(false),
            });
        }, 600);
    }, [activeTab]);

    // ── DnD handlers ─────────────────────────────────────────────────────────
    const handleDragStart = ({ active }: DragStartEvent) => {
        setDraggingId(String(active.id));
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setDraggingId(null);
        if (!over || active.id === over.id) return;

        const catItems = [...tabMembers];
        const oldIdx = catItems.findIndex(m => m.id === active.id);
        const newIdx = catItems.findIndex(m => m.id === over.id);
        const reordered = arrayMove(catItems, oldIdx, newIdx).map((m, i) => ({ ...m, sort_order: i }));

        const updated = members.map(m => {
            const r = reordered.find(r => r.id === m.id);
            return r ?? m;
        });
        setMembers(updated);
        persistOrder(updated);
    };

    // ── Toggle helpers ────────────────────────────────────────────────────────
    const toggleActive = (m: CreditsMember) => {
        router.put(`credits/${m.id}`, { is_active: !m.is_active }, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => setMembers(prev => prev.map(p => p.id === m.id ? { ...p, is_active: !p.is_active } : p)),
        });
    };

    const toggleFeatured = (m: CreditsMember) => {
        router.put(`credits/${m.id}`, { is_featured: !m.is_featured }, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => setMembers(prev => prev.map(p => p.id === m.id ? { ...p, is_featured: !p.is_featured } : p)),
        });
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Credits' }]}>
            <Head title="Credits Management" />
            <div className="p-6 space-y-5 max-w-5xl">

                {/* Header */}
                <PageHeader
                    title="Credits"
                    description="Manage the people and organisations behind AiKFS."
                    actions={canEdit ? (
                        <button
                            onClick={() => { setEditing(null); setModal('create'); }}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Member
                        </button>
                    ) : undefined}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard title="Total Members"   value={String(stats.total)}   icon={Users}         color="green"  index={0} />
                    <StatCard title="Active"          value={String(stats.active)}  icon={Eye}           color="blue"   index={1} />
                    <StatCard title="Featured"        value={String(stats.featured)} icon={Star}         color="yellow" index={2} />
                    <StatCard title="Dev Team"        value={String(stats.development_team)} icon={Code2} color="purple" index={3} />
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#0F172A] border border-[#1E293B] rounded-xl w-fit">
                    {CATEGORIES.map(cat => {
                        const Icon  = cat.icon;
                        const count = stats[cat.key];
                        const active = activeTab === cat.key;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setActiveTab(cat.key)}
                                className={cn(
                                    'flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer',
                                    active
                                        ? 'bg-[#1E293B] text-[#F8FAFC] shadow-sm'
                                        : 'text-[#475569] hover:text-[#94A3B8]'
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" style={{ color: active ? cat.color : undefined }} />
                                {locale === 'ar' ? cat.label_ar : cat.label}
                                <span className={cn(
                                    'flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold',
                                    active ? 'bg-[#334155] text-[#94A3B8]' : 'bg-[#1E293B] text-[#334155]'
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    {saving && <Loader2 className="w-3.5 h-3.5 text-[#334155] animate-spin ms-2" />}
                </div>

                {/* Category panel */}
                <div className="rounded-xl border border-[#1E293B] bg-[#0A0F1A] overflow-hidden">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E293B] bg-[#0F172A]">
                        <div className="flex items-center gap-2">
                            <activeCat.icon className="w-4 h-4" style={{ color: activeCat.color }} />
                            <span className="text-sm font-semibold text-[#F8FAFC]">
                                {locale === 'ar' ? activeCat.label_ar : activeCat.label}
                            </span>
                            <span className="text-xs text-[#334155]">{tabMembers.length} members</span>
                        </div>
                        {canEdit && (
                            <button
                                onClick={() => { setEditing(null); setModal('create'); }}
                                className="flex items-center gap-1 h-6 px-2 rounded-md text-[10px] text-[#475569] hover:text-[#22C55E] hover:bg-[#1E293B] transition-colors cursor-pointer"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        )}
                    </div>

                    {/* Sortable list */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tabMembers.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="p-3 space-y-2 min-h-24">
                                <AnimatePresence>
                                    {tabMembers.length === 0 ? (
                                        <div className="flex flex-col items-center gap-3 py-12 text-[#334155]">
                                            <activeCat.icon className="w-10 h-10" />
                                            <p className="text-sm">No members yet</p>
                                            {canEdit && (
                                                <button
                                                    onClick={() => { setEditing(null); setModal('create'); }}
                                                    className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-dashed border-[#1E293B] text-xs text-[#475569] hover:text-[#94A3B8] hover:border-[#334155] transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3 h-3" /> Add first member
                                                </button>
                                            )}
                                        </div>
                                    ) : tabMembers.map(m => (
                                        <SortableCard
                                            key={m.id}
                                            member={m}
                                            locale={locale}
                                            canEdit={canEdit}
                                            onEdit={member => { setEditing(member); setModal('edit'); }}
                                            onDelete={setDeleting}
                                            onToggleActive={toggleActive}
                                            onToggleFeatured={toggleFeatured}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </SortableContext>

                        {/* Drag overlay */}
                        <DragOverlay>
                            {draggingMember && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#334155] bg-[#0F172A] shadow-2xl opacity-90 rotate-1">
                                    <GripVertical className="w-4 h-4 text-[#475569]" />
                                    {draggingMember.avatar ? (
                                        <img src={draggingMember.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-sm font-semibold text-[#475569]">
                                            {draggingMember.name_en.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-[#F8FAFC]">{draggingMember.name_en}</p>
                                        <p className="text-xs text-[#475569]">{draggingMember.title_en}</p>
                                    </div>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(modal === 'create' || modal === 'edit') && (
                    <MemberModal
                        key={editing?.id ?? 'new'}
                        member={editing}
                        locale={locale}
                        defaultCategory={activeTab}
                        onClose={() => { setModal(null); setEditing(null); }}
                    />
                )}
                {deleting && (
                    <DeleteConfirm
                        key={deleting.id}
                        member={deleting}
                        onClose={() => setDeleting(null)}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
