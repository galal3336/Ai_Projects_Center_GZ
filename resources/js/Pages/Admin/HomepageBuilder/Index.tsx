import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    AlertCircle, Award, BarChart3, Check, ChevronDown, ChevronRight,
    Clock, Eye, EyeOff, FileText, GripVertical, History, Image,
    Layout, Loader2, Monitor, RefreshCw, RotateCcw, Save,
    Smartphone, Star, Trash2, TrendingUp, Trophy, Users, X, Zap,
    Globe, AlignLeft, Link2,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type SectionType =
    | 'hero'
    | 'statistics'
    | 'featured_projects'
    | 'winning_projects'
    | 'sponsors'
    | 'partners'
    | 'footer';

interface HeroConfig {
    headline: string;
    subheadline: string;
    cta_text: string;
    cta_url: string;
}
interface FeaturedConfig { title: string; limit: number }
interface WinningConfig { title: string; limit: number }
interface SponsorsConfig { title: string; logos: string[] }
interface PartnersConfig { title: string; logos: string[] }
interface FooterConfig { tagline: string; show_socials: boolean; show_links: boolean }

type SectionConfig =
    | HeroConfig
    | FeaturedConfig
    | WinningConfig
    | SponsorsConfig
    | PartnersConfig
    | FooterConfig
    | Record<string, never>;

interface Section {
    id: string;
    type: SectionType;
    label: string;
    enabled: boolean;
    order: number;
    config: SectionConfig;
}

interface VersionRecord {
    id: number;
    label: string;
    is_published: boolean;
    created_by: string;
    created_at: string;
}

interface PageProps {
    draft: Section[];
    versions: VersionRecord[];
    published_version_id: number | null;
}

// ─── Section meta ──────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { icon: React.ElementType; color: string }> = {
    hero:              { icon: Layout,    color: '#6366f1' },
    statistics:        { icon: TrendingUp, color: '#22c55e' },
    featured_projects: { icon: Star,      color: '#f59e0b' },
    winning_projects:  { icon: Trophy,    color: '#ec4899' },
    sponsors:          { icon: Users,     color: '#3b82f6' },
    partners:          { icon: Globe,     color: '#8b5cf6' },
    footer:            { icon: AlignLeft, color: '#64748b' },
};

// ─── Field helpers ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function TextInput({
    value,
    onChange,
    placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors"
        />
    );
}

function NumberInput({ value, onChange, min = 1, max = 50 }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={e => onChange(Number(e.target.value))}
            className="w-24 h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] outline-none focus:border-[#334155] transition-colors"
        />
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                checked ? 'bg-[#22C55E]' : 'bg-[#1E293B]'
            )}
        >
            <span className={cn(
                'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200',
                checked ? 'translate-x-4' : 'translate-x-0'
            )} />
        </button>
    );
}

// ─── Section config editors ────────────────────────────────────────────────────

function HeroEditor({ config, onChange }: { config: HeroConfig; onChange: (c: HeroConfig) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Headline">
                <TextInput value={config.headline} onChange={v => onChange({ ...config, headline: v })} placeholder="Enter headline…" />
            </Field>
            <Field label="Subheadline">
                <TextInput value={config.subheadline} onChange={v => onChange({ ...config, subheadline: v })} placeholder="Enter subheadline…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Button Text">
                    <TextInput value={config.cta_text} onChange={v => onChange({ ...config, cta_text: v })} placeholder="e.g. Explore Projects" />
                </Field>
                <Field label="CTA URL">
                    <TextInput value={config.cta_url} onChange={v => onChange({ ...config, cta_url: v })} placeholder="/projects" />
                </Field>
            </div>
        </div>
    );
}

function FeaturedEditor({ config, onChange }: { config: FeaturedConfig; onChange: (c: FeaturedConfig) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Section Title">
                <TextInput value={config.title} onChange={v => onChange({ ...config, title: v })} />
            </Field>
            <Field label="Number of Projects to Show">
                <NumberInput value={config.limit} onChange={v => onChange({ ...config, limit: v })} max={24} />
            </Field>
        </div>
    );
}

function WinningEditor({ config, onChange }: { config: WinningConfig; onChange: (c: WinningConfig) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Section Title">
                <TextInput value={config.title} onChange={v => onChange({ ...config, title: v })} />
            </Field>
            <Field label="Number of Entries to Show">
                <NumberInput value={config.limit} onChange={v => onChange({ ...config, limit: v })} max={12} />
            </Field>
        </div>
    );
}

function LogoListEditor({ config, onChange, field }: {
    config: SponsorsConfig | PartnersConfig;
    onChange: (c: SponsorsConfig | PartnersConfig) => void;
    field: 'sponsors' | 'partners';
}) {
    const [newUrl, setNewUrl] = useState('');
    const add = () => {
        if (!newUrl.trim()) return;
        onChange({ ...config, logos: [...(config.logos ?? []), newUrl.trim()] });
        setNewUrl('');
    };
    const remove = (i: number) =>
        onChange({ ...config, logos: config.logos.filter((_, idx) => idx !== i) });

    return (
        <div className="space-y-3">
            <Field label="Section Title">
                <TextInput value={config.title} onChange={v => onChange({ ...config, title: v })} />
            </Field>
            <Field label={`${field === 'sponsors' ? 'Sponsor' : 'Partner'} Logo URLs`}>
                <div className="space-y-1.5">
                    {(config.logos ?? []).map((url, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="flex-1 truncate text-xs text-[#64748B] bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-1.5 font-mono">
                                {url}
                            </span>
                            <button
                                onClick={() => remove(i)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#1E293B] transition-colors cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <input
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && add()}
                            placeholder="https://example.com/logo.svg"
                            className="flex-1 h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors font-mono"
                        />
                        <button
                            onClick={add}
                            className="h-8 px-3 rounded-lg bg-[#1E293B] text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#334155] transition-colors cursor-pointer"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </Field>
        </div>
    );
}

function FooterEditor({ config, onChange }: { config: FooterConfig; onChange: (c: FooterConfig) => void }) {
    return (
        <div className="space-y-3">
            <Field label="Tagline">
                <TextInput value={config.tagline} onChange={v => onChange({ ...config, tagline: v })} />
            </Field>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Toggle checked={config.show_socials} onChange={v => onChange({ ...config, show_socials: v })} />
                    <span className="text-xs text-[#64748B]">Show Social Links</span>
                </div>
                <div className="flex items-center gap-2">
                    <Toggle checked={config.show_links} onChange={v => onChange({ ...config, show_links: v })} />
                    <span className="text-xs text-[#64748B]">Show Footer Links</span>
                </div>
            </div>
        </div>
    );
}

function StatisticsEditor() {
    return (
        <p className="text-xs text-[#475569] italic">
            Statistics are pulled automatically from live platform data and cannot be manually configured.
        </p>
    );
}

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
    section,
    onToggle,
    onExpand,
    onConfigChange,
}: {
    section: Section;
    onToggle: () => void;
    onExpand: () => void;
    onConfigChange: (config: SectionConfig) => void;
}) {
    const meta = SECTION_META[section.type];
    const Icon = meta.icon;

    const renderEditor = () => {
        switch (section.type) {
            case 'hero':
                return <HeroEditor config={section.config as HeroConfig} onChange={onConfigChange} />;
            case 'featured_projects':
                return <FeaturedEditor config={section.config as FeaturedConfig} onChange={onConfigChange} />;
            case 'winning_projects':
                return <WinningEditor config={section.config as WinningConfig} onChange={onConfigChange} />;
            case 'sponsors':
                return <LogoListEditor config={section.config as SponsorsConfig} onChange={onConfigChange} field="sponsors" />;
            case 'partners':
                return <LogoListEditor config={section.config as PartnersConfig} onChange={onConfigChange} field="partners" />;
            case 'footer':
                return <FooterEditor config={section.config as FooterConfig} onChange={onConfigChange} />;
            case 'statistics':
                return <StatisticsEditor />;
            default:
                return null;
        }
    };

    return (
        <div className={cn(
            'rounded-xl border transition-all duration-200',
            section.enabled
                ? 'border-[#1E293B] bg-[#0F172A]'
                : 'border-[#0F172A] bg-[#080E1A] opacity-60'
        )}>
            <div className="flex items-center gap-3 px-4 py-3 select-none">
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing text-[#1E293B] hover:text-[#334155] transition-colors shrink-0" title="Drag to reorder">
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                    style={{ backgroundColor: section.enabled ? `${meta.color}20` : '#0F172A' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: section.enabled ? meta.color : '#334155' }} />
                </div>

                {/* Label */}
                <span className={cn('flex-1 text-sm font-medium', section.enabled ? 'text-[#F8FAFC]' : 'text-[#334155]')}>
                    {section.label}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <Toggle checked={section.enabled} onChange={onToggle} />
                    <button
                        onClick={onExpand}
                        disabled={!section.enabled}
                        aria-label={section.expanded ? 'Collapse' : 'Expand'}
                        className={cn(
                            'flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer',
                            section.enabled
                                ? 'text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B]'
                                : 'text-[#1E293B] cursor-default'
                        )}
                    >
                        {section.expanded
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {section.enabled && section.expanded && (
                    <motion.div
                        key="editor"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-3 border-t border-[#1E293B]">
                            {renderEditor()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Live Preview ──────────────────────────────────────────────────────────────

function LivePreview({ sections, device }: { sections: Section[]; device: 'desktop' | 'mobile' }) {
    const enabled = sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);

    const previewSection = (s: Section) => {
        switch (s.type) {
            case 'hero': {
                const c = s.config as HeroConfig;
                return (
                    <div className="bg-gradient-to-br from-[#020617] via-[#0a0f1e] to-[#020617] px-6 py-10 text-center border-b border-[#1E293B]">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-medium mb-4">
                            <Zap className="w-2.5 h-2.5" /> AI Projects Showcase
                        </div>
                        <h2 className="text-xl font-bold text-[#F8FAFC] leading-tight mb-2">{c.headline || 'Headline'}</h2>
                        <p className="text-xs text-[#64748B] mb-4 max-w-xs mx-auto">{c.subheadline || 'Subheadline'}</p>
                        <button className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#22C55E] text-xs font-medium text-white">
                            {c.cta_text || 'CTA'} <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                );
            }
            case 'statistics':
                return (
                    <div className="grid grid-cols-2 gap-2 px-4 py-4 bg-[#0A111E] border-b border-[#1E293B]">
                        {[['2.4K+', 'Projects'], ['1.8K+', 'Students'], ['48', 'Universities'], ['12', 'Competitions']].map(([val, lbl]) => (
                            <div key={lbl} className="text-center">
                                <div className="text-sm font-bold text-[#22C55E]">{val}</div>
                                <div className="text-[9px] text-[#475569]">{lbl}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'featured_projects': {
                const c = s.config as FeaturedConfig;
                return (
                    <div className="px-4 py-4 border-b border-[#1E293B]">
                        <div className="flex items-center gap-1.5 mb-3">
                            <Star className="w-3 h-3 text-[#f59e0b]" />
                            <span className="text-xs font-semibold text-[#F8FAFC]">{c.title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: Math.min(c.limit, 4) }).map((_, i) => (
                                <div key={i} className="h-16 rounded-lg bg-[#0F172A] border border-[#1E293B] flex items-end p-2">
                                    <div className="text-[9px] text-[#475569]">Project {i + 1}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'winning_projects': {
                const c = s.config as WinningConfig;
                return (
                    <div className="px-4 py-4 border-b border-[#1E293B] bg-[#0A111E]">
                        <div className="flex items-center gap-1.5 mb-3">
                            <Trophy className="w-3 h-3 text-[#ec4899]" />
                            <span className="text-xs font-semibold text-[#F8FAFC]">{c.title}</span>
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: Math.min(c.limit, 3) }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 h-10 rounded-lg bg-[#0F172A] border border-[#1E293B] px-3">
                                    <Award className="w-3 h-3 text-[#f59e0b]" />
                                    <div className="flex-1 h-1.5 rounded-full bg-[#1E293B]" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'sponsors':
            case 'partners': {
                const c = s.config as SponsorsConfig | PartnersConfig;
                return (
                    <div className="px-4 py-4 border-b border-[#1E293B]">
                        <p className="text-[10px] font-medium text-[#475569] text-center uppercase tracking-widest mb-3">{c.title}</p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            {(c.logos ?? []).length > 0
                                ? c.logos.map((url, i) => (
                                    <img key={i} src={url} alt="" className="h-6 object-contain opacity-60" />
                                ))
                                : Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-5 w-12 rounded bg-[#1E293B]" />
                                ))}
                        </div>
                    </div>
                );
            }
            case 'footer': {
                const c = s.config as FooterConfig;
                return (
                    <div className="px-4 py-4 bg-[#0A111E]">
                        <p className="text-[9px] text-[#334155] text-center">{c.tagline}</p>
                        {c.show_links && (
                            <div className="flex justify-center gap-3 mt-2">
                                {['Privacy', 'Terms', 'Contact'].map(l => (
                                    <span key={l} className="text-[9px] text-[#475569] underline cursor-pointer">{l}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return null;
        }
    };

    return (
        <div className={cn(
            'bg-[#020617] border border-[#1E293B] rounded-xl overflow-hidden transition-all duration-300',
            device === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'
        )}>
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] border-b border-[#1E293B]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <div className="flex-1 h-4 mx-2 rounded-full bg-[#1E293B] flex items-center px-2">
                    <span className="text-[9px] text-[#334155] truncate">aikfs.edu.sa</span>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[480px]">
                {enabled.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[#334155]">
                        <EyeOff className="w-8 h-8 mb-2" />
                        <p className="text-xs">No sections enabled</p>
                    </div>
                ) : (
                    enabled.map(s => (
                        <div key={s.id}>{previewSection(s)}</div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Version History Panel ─────────────────────────────────────────────────────

function VersionHistoryPanel({
    versions,
    publishedId,
    onRestore,
    onDelete,
}: {
    versions: VersionRecord[];
    publishedId: number | null;
    onRestore: (v: VersionRecord) => void;
    onDelete: (v: VersionRecord) => void;
}) {
    const fmt = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (versions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-[#334155]">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-xs">No versions yet</p>
                <p className="text-[10px] mt-1">Publish to create a version snapshot</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {versions.map(v => (
                <div
                    key={v.id}
                    className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                        v.id === publishedId
                            ? 'border-[#22C55E]/30 bg-[#22C55E]/5'
                            : 'border-[#1E293B] bg-[#0A111E]'
                    )}
                >
                    <div className={cn(
                        'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                        v.id === publishedId ? 'bg-[#22C55E]/15' : 'bg-[#1E293B]'
                    )}>
                        {v.id === publishedId
                            ? <Check className="w-3 h-3 text-[#22C55E]" />
                            : <Clock className="w-3 h-3 text-[#475569]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#F8FAFC] truncate">{v.label}</p>
                        <p className="text-[10px] text-[#475569] mt-0.5">
                            {fmt(v.created_at)} · by {v.created_by}
                        </p>
                        {v.id === publishedId && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[9px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onRestore(v)}
                            title="Restore to draft"
                            className="flex items-center justify-center w-6 h-6 rounded-md text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                        {v.id !== publishedId && (
                            <button
                                onClick={() => onDelete(v)}
                                title="Delete version"
                                className="flex items-center justify-center w-6 h-6 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#1E293B] transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Publish modal ─────────────────────────────────────────────────────────────

function PublishModal({
    open,
    onClose,
    onConfirm,
    publishing,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: (label: string) => void;
    publishing: boolean;
}) {
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (open) setLabel('');
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-sm bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[#22C55E]/15 flex items-center justify-center">
                                    <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
                                </div>
                                <span className="text-sm font-semibold text-[#F8FAFC]">Publish Homepage</span>
                            </div>
                            <button onClick={onClose} className="text-[#475569] hover:text-[#F8FAFC] transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <p className="text-sm text-[#64748B]">
                                This will make the current layout live on the public homepage and create a version snapshot.
                            </p>
                            <div>
                                <label className="block text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1.5">
                                    Version Label <span className="text-[#334155] normal-case">(optional)</span>
                                </label>
                                <input
                                    value={label}
                                    onChange={e => setLabel(e.target.value)}
                                    placeholder="e.g. Summer 2026 Launch"
                                    className="w-full h-9 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#1E293B]">
                            <button
                                onClick={onClose}
                                className="flex-1 h-9 rounded-lg border border-[#1E293B] text-sm text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC] transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onConfirm(label)}
                                disabled={publishing}
                                className="flex-1 h-9 rounded-lg bg-[#22C55E] text-sm font-medium text-white hover:bg-[#16A34A] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                {publishing ? 'Publishing…' : 'Publish Now'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto min-w-[240px] max-w-[320px]',
                            t.type === 'success' && 'bg-[#0A1F0E] border-[#22C55E]/30 text-[#22C55E]',
                            t.type === 'error'   && 'bg-[#1A0A0A] border-[#EF4444]/30 text-[#EF4444]',
                            t.type === 'info'    && 'bg-[#0A0F1E] border-[#3B82F6]/30 text-[#3B82F6]',
                        )}
                    >
                        {t.type === 'success' && <Check className="w-3.5 h-3.5 shrink-0" />}
                        {t.type === 'error'   && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {t.type === 'info'    && <Zap className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 text-xs font-medium">{t.message}</span>
                        <button onClick={() => onDismiss(t.id)} className="shrink-0 cursor-pointer opacity-70 hover:opacity-100">
                            <X className="w-3 h-3" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function HomepageBuilderIndex() {
    const { draft, versions: initialVersions, published_version_id } = usePage<SharedProps & PageProps>().props;

    const [sections, setSections] = useState<Section[]>(() =>
        (draft ?? []).map((s, i) => ({ ...s, expanded: false, order: i }))
    );
    const [versions, setVersions] = useState<VersionRecord[]>(initialVersions ?? []);
    const [publishedId, setPublishedId] = useState<number | null>(published_version_id ?? null);
    const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showPreview, setShowPreview] = useState(true);
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = ++toastId.current;
        setToasts(ts => [...ts, { id, type, message }]);
        setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4000);
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts(ts => ts.filter(t => t.id !== id));
    }, []);

    const normalizedSections = useCallback(() =>
        sections.map((s, i) => ({ ...s, order: i })),
    [sections]);

    // Auto-save draft after 2 s of inactivity
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!dirty) return;
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => saveDraft(true), 2000);
        return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
    }, [sections, dirty]);

    const markDirty = () => setDirty(true);

    const toggle = (id: string) => {
        setSections(ss => ss.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled, expanded: s.expanded && !s.enabled } : s
        ));
        markDirty();
    };

    const expand = (id: string) => {
        setSections(ss => ss.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
    };

    const updateConfig = (id: string, config: SectionConfig) => {
        setSections(ss => ss.map(s => s.id === id ? { ...s, config } : s));
        markDirty();
    };

    const handleReorder = (newOrder: Section[]) => {
        setSections(newOrder.map((s, i) => ({ ...s, order: i })));
        markDirty();
    };

    const saveDraft = async (silent = false) => {
        if (!silent) setSaving(true);
        try {
            await fetch('/admin/homepage-builder/draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ sections: normalizedSections() }),
            });
            setDirty(false);
            if (!silent) addToast('success', 'Draft saved successfully.');
        } catch {
            if (!silent) addToast('error', 'Failed to save draft.');
        } finally {
            if (!silent) setSaving(false);
        }
    };

    const handlePublish = async (label: string) => {
        setPublishing(true);
        try {
            const res = await fetch('/admin/homepage-builder/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ sections: normalizedSections(), label }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? 'Publish failed');

            setVersions(vs => [data.version, ...vs]);
            setPublishedId(data.version.id);
            setPublishModalOpen(false);
            setDirty(false);
            addToast('success', 'Homepage published successfully!');
        } catch (e: unknown) {
            addToast('error', e instanceof Error ? e.message : 'Publish failed.');
        } finally {
            setPublishing(false);
        }
    };

    const handleRestore = async (v: VersionRecord) => {
        try {
            const res = await fetch(`/admin/homepage-builder/versions/${v.id}/restore`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSections((data.sections as Section[]).map((s, i) => ({ ...s, expanded: false, order: i })));
            setActiveTab('builder');
            addToast('info', `Restored "${v.label}" to draft.`);
        } catch {
            addToast('error', 'Failed to restore version.');
        }
    };

    const handleDeleteVersion = async (v: VersionRecord) => {
        try {
            const res = await fetch(`/admin/homepage-builder/versions/${v.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
            });
            if (!res.ok) throw new Error((await res.json()).message);
            setVersions(vs => vs.filter(ver => ver.id !== v.id));
            addToast('success', 'Version deleted.');
        } catch (e: unknown) {
            addToast('error', e instanceof Error ? e.message : 'Delete failed.');
        }
    };

    const enabledCount = sections.filter(s => s.enabled).length;

    return (
        <AdminLayout breadcrumbs={[{ label: 'Homepage Builder' }]}>
            <div className="flex flex-col h-full overflow-hidden">

                {/* ── Top bar ──────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1E293B] shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">Homepage Builder</h1>
                            {dirty && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                    Unsaved
                                </span>
                            )}
                            {!dirty && publishedId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                    Live
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5">
                            {enabledCount} of {sections.length} sections enabled · Drag to reorder
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Preview toggle */}
                        <button
                            onClick={() => setShowPreview(p => !p)}
                            className={cn(
                                'hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs transition-all cursor-pointer',
                                showPreview
                                    ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                                    : 'bg-[#0F172A] border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'
                            )}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>

                        {/* Save draft */}
                        <button
                            onClick={() => saveDraft(false)}
                            disabled={saving || !dirty}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save Draft
                        </button>

                        {/* Publish */}
                        <button
                            onClick={() => setPublishModalOpen(true)}
                            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Publish
                        </button>
                    </div>
                </div>

                {/* ── Tabs (mobile) ─────────────────────────────────────────── */}
                <div className="flex items-center gap-1 px-6 py-2 border-b border-[#1E293B] shrink-0">
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={cn(
                            'flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer',
                            activeTab === 'builder'
                                ? 'bg-[#1E293B] text-[#F8FAFC]'
                                : 'text-[#64748B] hover:text-[#94A3B8]'
                        )}
                    >
                        <Layout className="w-3.5 h-3.5" />
                        Sections
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            'flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer',
                            activeTab === 'history'
                                ? 'bg-[#1E293B] text-[#F8FAFC]'
                                : 'text-[#64748B] hover:text-[#94A3B8]'
                        )}
                    >
                        <History className="w-3.5 h-3.5" />
                        Version History
                        {versions.length > 0 && (
                            <span className="ml-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#1E293B] text-[#64748B] text-[10px]">
                                {versions.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Body ─────────────────────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left panel */}
                    <div className="flex-1 overflow-y-auto min-w-0">
                        <div className="p-6 max-w-2xl">
                            {activeTab === 'builder' && (
                                <Reorder.Group
                                    axis="y"
                                    values={sections}
                                    onReorder={handleReorder}
                                    className="space-y-2"
                                >
                                    {sections.map(section => (
                                        <Reorder.Item
                                            key={section.id}
                                            value={section}
                                            className="outline-none"
                                        >
                                            <SectionCard
                                                section={section}
                                                onToggle={() => toggle(section.id)}
                                                onExpand={() => expand(section.id)}
                                                onConfigChange={cfg => updateConfig(section.id, cfg)}
                                            />
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}

                            {activeTab === 'history' && (
                                <VersionHistoryPanel
                                    versions={versions}
                                    publishedId={publishedId}
                                    onRestore={handleRestore}
                                    onDelete={handleDeleteVersion}
                                />
                            )}

                            {activeTab === 'builder' && (
                                <div className="mt-4 rounded-xl border border-dashed border-[#1E293B] p-4 text-center">
                                    <p className="text-xs text-[#334155]">
                                        Drag sections to reorder · Toggle to enable/disable · Changes auto-save as draft
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right panel — Live Preview */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 420, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="hidden lg:flex flex-col border-l border-[#1E293B] overflow-hidden shrink-0"
                                style={{ minWidth: 0 }}
                            >
                                {/* Preview header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] shrink-0">
                                    <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Live Preview</span>
                                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0A111E] border border-[#1E293B]">
                                        <button
                                            onClick={() => setPreviewDevice('desktop')}
                                            className={cn(
                                                'flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer',
                                                previewDevice === 'desktop' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#334155] hover:text-[#64748B]'
                                            )}
                                            title="Desktop"
                                        >
                                            <Monitor className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setPreviewDevice('mobile')}
                                            className={cn(
                                                'flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer',
                                                previewDevice === 'mobile' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#334155] hover:text-[#64748B]'
                                            )}
                                            title="Mobile"
                                        >
                                            <Smartphone className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 bg-[#060D1A]">
                                    <LivePreview sections={sections} device={previewDevice} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Publish modal */}
            <PublishModal
                open={publishModalOpen}
                onClose={() => setPublishModalOpen(false)}
                onConfirm={handlePublish}
                publishing={publishing}
            />

            {/* Toasts */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </AdminLayout>
    );
}
