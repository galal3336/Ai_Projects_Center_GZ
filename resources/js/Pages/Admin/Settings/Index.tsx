import React, { useCallback, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle, Bell, Check, ChevronRight, Database, ExternalLink,
    Globe, Image, Link2, Loader2,
    Lock, Mail, MapPin, Monitor, Phone, RefreshCw, Save, Search,
    Settings, Shield, Tag, Upload, X, Youtube, Zap,
    Palette, FileCode, Building2, Hash,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';
import type {
    SharedProps, AllSettings, FooterLink,
    GeneralSettings, BrandingSettings, SeoSettings,
    ContactSettings, SocialSettings, FooterSettings,
} from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
    settings: AllSettings;
}

type TabId = 'general' | 'branding' | 'seo' | 'contact' | 'social' | 'footer';

interface Tab { id: TabId; label: string; icon: React.ElementType; group: string }

// ─── Tabs config ───────────────────────────────────────────────────────────────

const TABS: Tab[] = [
    { id: 'general',  label: 'General',     icon: Settings,  group: 'general'  },
    { id: 'branding', label: 'Branding',    icon: Palette,   group: 'branding' },
    { id: 'seo',      label: 'SEO & Meta',  icon: Search,    group: 'seo'      },
    { id: 'contact',  label: 'Contact',     icon: Mail,      group: 'contact'  },
    { id: 'social',   label: 'Social',      icon: Globe,     group: 'social'   },
    { id: 'footer',   label: 'Footer',      icon: FileCode,  group: 'footer'   },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';
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
                            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto min-w-60 max-w-xs',
                            t.type === 'success' && 'bg-[#0A1F0E] border-[#22C55E]/30 text-[#22C55E]',
                            t.type === 'error'   && 'bg-[#1A0A0A] border-[#EF4444]/30 text-[#EF4444]',
                        )}
                    >
                        {t.type === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 text-xs font-medium">{t.message}</span>
                        <button onClick={() => onDismiss(t.id)} className="shrink-0 cursor-pointer opacity-60 hover:opacity-100">
                            <X className="w-3 h-3" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ─── Field atoms ───────────────────────────────────────────────────────────────

function SectionHeading({ title, description }: { title: string; description?: string }) {
    return (
        <div className="pb-4 mb-2 border-b border-[#1E293B]">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-[#475569]">{description}</p>}
        </div>
    );
}

function FieldRow({ label, description, children, className }: {
    label: string; description?: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={cn('flex items-start justify-between gap-8 py-3.5 border-b border-[#0F172A] last:border-0', className)}>
            <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-[#CBD5E1]">{label}</p>
                {description && <p className="mt-0.5 text-xs text-[#475569] leading-relaxed">{description}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function TextInput({ value, onChange, placeholder, type = 'text', className }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
    return (
        <input
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                'h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors',
                className ?? 'w-56'
            )}
        />
    );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
    value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
    return (
        <textarea
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-72 px-3 py-2 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors resize-none leading-relaxed"
        />
    );
}

function NumberInput({ value, onChange, min = 1, max = 9999 }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
    return (
        <input
            type="number"
            value={value ?? ''}
            min={min}
            max={max}
            onChange={e => onChange(Number(e.target.value))}
            className="w-24 h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] outline-none focus:border-[#334155] transition-colors tabular-nums"
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

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={e => onChange(e.target.value)}
                    className="sr-only"
                    id={`color-${label}`}
                />
                <label
                    htmlFor={`color-${label}`}
                    className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] cursor-pointer hover:border-[#334155] transition-colors"
                >
                    <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: value || '#666' }} />
                    <span className="text-sm text-[#F8FAFC] font-mono">{value || '#000000'}</span>
                </label>
            </div>
            <TextInput value={value ?? ''} onChange={onChange} placeholder="#000000" className="w-28 font-mono" />
        </div>
    );
}

function SelectInput({ value, onChange, options }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <select
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            className="h-8 px-3 rounded-lg bg-[#020617] border border-[#1E293B] text-sm text-[#F8FAFC] outline-none focus:border-[#334155] transition-colors cursor-pointer"
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

// ─── File Upload component ────────────────────────────────────────────────────

function AssetUpload({
    settingKey,
    label,
    current,
    accept,
    onUploaded,
}: {
    settingKey: string;
    label: string;
    current: string;
    accept: string;
    onUploaded: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setUploading(true);
        setError(null);
        const fd = new FormData();
        fd.append('key', settingKey);
        fd.append('file', file);
        fd.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');

        try {
            const res = await fetch('/admin/settings/upload-asset', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? 'Upload failed');
            onUploaded(data.url);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
            {current && (
                <div className="w-16 h-10 rounded-lg bg-[#020617] border border-[#1E293B] flex items-center justify-center overflow-hidden">
                    <img src={current} alt={label} className="max-w-full max-h-full object-contain" />
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {error && <p className="text-[10px] text-[#EF4444]">{error}</p>}
        </div>
    );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function GeneralTab({ data, onChange }: { data: GeneralSettings; onChange: (d: GeneralSettings) => void }) {
    const u = <K extends keyof GeneralSettings>(k: K, v: GeneralSettings[K]) =>
        onChange({ ...data, [k]: v });

    return (
        <div className="space-y-0">
            <SectionHeading title="Identity" description="Basic information displayed across the platform" />
            <FieldRow label="Site Name" description="Appears in browser tabs, emails, and the header">
                <TextInput value={data.site_name} onChange={v => u('site_name', v)} placeholder="AiKFS" />
            </FieldRow>
            <FieldRow label="Tagline" description="Short phrase shown under the site name">
                <TextInput value={data.site_tagline} onChange={v => u('site_tagline', v)} placeholder="Student Project Showcase" className="w-72" />
            </FieldRow>
            <FieldRow label="Site Description" description="Used in meta tags and platform descriptions">
                <TextArea value={data.site_description} onChange={v => u('site_description', v)} rows={2} />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Access" description="Control who can access the platform" />
            </div>
            <FieldRow label="Guest View" description="Allow unauthenticated visitors to browse public projects">
                <Toggle checked={data.guest_view} onChange={v => u('guest_view', v)} />
            </FieldRow>
            <FieldRow label="Registration Open" description="Allow new students to create accounts">
                <Toggle checked={data.registration_open} onChange={v => u('registration_open', v)} />
            </FieldRow>
            <FieldRow label="Require Admin Approval" description="New accounts need approval before gaining access">
                <Toggle checked={data.require_approval} onChange={v => u('require_approval', v)} />
            </FieldRow>
            <FieldRow label="Maintenance Mode" description="Take the site offline for all non-admin visitors">
                <Toggle checked={data.maintenance_mode} onChange={v => u('maintenance_mode', v)} />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Limits" description="Operational constraints" />
            </div>
            <FieldRow label="Session Timeout" description="Minutes of inactivity before auto-logout (5–1440)">
                <NumberInput value={data.session_timeout} onChange={v => u('session_timeout', v)} min={5} max={1440} />
            </FieldRow>
            <FieldRow label="Max Upload Size (MB)" description="Maximum file size for repository uploads">
                <NumberInput value={data.max_upload_mb} onChange={v => u('max_upload_mb', v)} min={1} max={500} />
            </FieldRow>
        </div>
    );
}

function BrandingTab({
    data,
    onChange,
    onAssetUploaded,
}: {
    data: BrandingSettings;
    onChange: (d: BrandingSettings) => void;
    onAssetUploaded: (key: string, url: string) => void;
}) {
    const u = <K extends keyof BrandingSettings>(k: K, v: BrandingSettings[K]) =>
        onChange({ ...data, [k]: v });

    return (
        <div className="space-y-0">
            <SectionHeading title="Logo & Favicon" description="Visual identifiers used across the platform" />
            <FieldRow
                label="Site Logo"
                description="Used in the header and emails. Recommended: SVG or PNG, min 200×60px"
            >
                <AssetUpload
                    settingKey="site_logo"
                    label="Site Logo"
                    current={data.site_logo ?? ''}
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    onUploaded={url => {
                        u('site_logo', url);
                        onAssetUploaded('site_logo', url);
                    }}
                />
            </FieldRow>
            <FieldRow
                label="Favicon"
                description="16×16 or 32×32 icon shown in browser tabs. ICO or PNG."
            >
                <AssetUpload
                    settingKey="site_favicon"
                    label="Favicon"
                    current={data.site_favicon ?? ''}
                    accept=".ico,.png,.svg"
                    onUploaded={url => {
                        u('site_favicon', url);
                        onAssetUploaded('site_favicon', url);
                    }}
                />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Brand Colors" description="Primary palette used for buttons, links, and accents" />
            </div>
            <FieldRow label="Primary Color" description="Main action color (buttons, highlights)">
                <ColorInput value={data.primary_color ?? '#22C55E'} onChange={v => u('primary_color', v)} label="primary" />
            </FieldRow>
            <FieldRow label="Accent Color" description="Secondary accent color (badges, decorations)">
                <ColorInput value={data.accent_color ?? '#6366f1'} onChange={v => u('accent_color', v)} label="accent" />
            </FieldRow>
        </div>
    );
}

function SeoTab({ data, onChange }: { data: SeoSettings; onChange: (d: SeoSettings) => void }) {
    const u = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) =>
        onChange({ ...data, [k]: v });

    return (
        <div className="space-y-0">
            <SectionHeading title="Meta Tags" description="Affects how search engines and link previews display your site" />
            <FieldRow label="Meta Title" description="Browser tab & search result title (50–60 chars recommended)">
                <TextInput value={data.meta_title} onChange={v => u('meta_title', v)} placeholder="AiKFS — Student AI Projects" className="w-80" />
            </FieldRow>
            <FieldRow label="Meta Description" description="Snippet shown in search results (150–160 chars)">
                <TextArea value={data.meta_description} onChange={v => u('meta_description', v)} rows={2} placeholder="Discover innovative AI projects…" />
            </FieldRow>
            <FieldRow label="Meta Keywords" description="Comma-separated keywords (minor SEO impact)">
                <TextInput value={data.meta_keywords} onChange={v => u('meta_keywords', v)} placeholder="AI, machine learning, KFU" className="w-72" />
            </FieldRow>
            <FieldRow label="Robots Directive" description="Controls crawler indexing (e.g. index, follow)">
                <TextInput value={data.robots} onChange={v => u('robots', v)} placeholder="index, follow" className="w-48" />
            </FieldRow>
            <FieldRow label="Canonical URL" description="Preferred URL for duplicate content disambiguation">
                <TextInput value={data.canonical_url} onChange={v => u('canonical_url', v)} placeholder="https://aikfs.edu.sa" className="w-72" />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Open Graph" description="Controls appearance when shared on social platforms" />
            </div>
            <FieldRow label="OG Title" description="Title shown in link previews">
                <TextInput value={data.og_title} onChange={v => u('og_title', v)} placeholder="AiKFS — Student AI Projects" className="w-80" />
            </FieldRow>
            <FieldRow label="OG Description" description="Description shown in link previews (≤300 chars)">
                <TextArea value={data.og_description} onChange={v => u('og_description', v)} rows={2} placeholder="Explore student-built AI solutions…" />
            </FieldRow>
            <FieldRow label="OG Image URL" description="1200×630px image for social shares">
                <TextInput value={data.og_image_url} onChange={v => u('og_image_url', v)} placeholder="https://…/og-image.png" className="w-72" />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Twitter / X Card" />
            </div>
            <FieldRow label="Card Type">
                <SelectInput
                    value={data.twitter_card}
                    onChange={v => u('twitter_card', v)}
                    options={[
                        { value: 'summary', label: 'Summary' },
                        { value: 'summary_large_image', label: 'Summary Large Image' },
                    ]}
                />
            </FieldRow>
            <FieldRow label="Twitter @site" description="Your platform Twitter/X handle">
                <TextInput value={data.twitter_site} onChange={v => u('twitter_site', v)} placeholder="@aikfs_kfu" className="w-40" />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Analytics" description="Tracking script IDs (no scripts injected here — IDs only)" />
            </div>
            <FieldRow label="Google Analytics" description="Measurement ID (G-XXXXXXXXXX)">
                <TextInput value={data.google_analytics} onChange={v => u('google_analytics', v)} placeholder="G-XXXXXXXXXX" className="w-44 font-mono" />
            </FieldRow>
            <FieldRow label="Google Tag Manager" description="Container ID (GTM-XXXXXXXX)">
                <TextInput value={data.google_tag_manager} onChange={v => u('google_tag_manager', v)} placeholder="GTM-XXXXXXXX" className="w-44 font-mono" />
            </FieldRow>
        </div>
    );
}

function ContactTab({ data, onChange }: { data: ContactSettings; onChange: (d: ContactSettings) => void }) {
    const u = <K extends keyof ContactSettings>(k: K, v: ContactSettings[K]) =>
        onChange({ ...data, [k]: v });

    return (
        <div className="space-y-0">
            <SectionHeading title="Email Addresses" />
            <FieldRow label="Contact Email" description="Shown on the contact page and in footer">
                <TextInput value={data.contact_email} onChange={v => u('contact_email', v)} type="email" placeholder="info@aikfs.edu.sa" className="w-64" />
            </FieldRow>
            <FieldRow label="Support Email" description="Used for automated notifications and replies">
                <TextInput value={data.support_email} onChange={v => u('support_email', v)} type="email" placeholder="support@aikfs.edu.sa" className="w-64" />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading title="Location" />
            </div>
            <FieldRow label="Phone Number">
                <TextInput value={data.contact_phone} onChange={v => u('contact_phone', v)} type="tel" placeholder="+966 1 380 0000" className="w-48" />
            </FieldRow>
            <FieldRow label="Street Address">
                <TextInput value={data.contact_address} onChange={v => u('contact_address', v)} placeholder="King Faisal University, Al-Ahsa" className="w-80" />
            </FieldRow>
            <FieldRow label="City">
                <TextInput value={data.contact_city} onChange={v => u('contact_city', v)} placeholder="Al-Ahsa" className="w-48" />
            </FieldRow>
            <FieldRow label="Country">
                <TextInput value={data.contact_country} onChange={v => u('contact_country', v)} placeholder="Saudi Arabia" className="w-48" />
            </FieldRow>
            <FieldRow label="Google Maps Embed URL" description="Paste the embed src URL from Google Maps">
                <TextArea value={data.maps_embed_url} onChange={v => u('maps_embed_url', v)} rows={2} placeholder="https://maps.google.com/maps?…" />
            </FieldRow>
        </div>
    );
}

const SOCIAL_FIELDS: { key: keyof SocialSettings; label: string; icon: React.ElementType; placeholder: string }[] = [
    { key: 'social_twitter',   label: 'Twitter / X',  icon: X,     placeholder: 'https://twitter.com/aikfs_kfu' },
    { key: 'social_linkedin',  label: 'LinkedIn',     icon: Link2, placeholder: 'https://linkedin.com/company/kfu' },
    { key: 'social_github',    label: 'GitHub',       icon: Hash,  placeholder: 'https://github.com/kfu-ai' },
    { key: 'social_instagram', label: 'Instagram',    icon: Link2, placeholder: 'https://instagram.com/aikfs' },
    { key: 'social_youtube',   label: 'YouTube',      icon: Link2, placeholder: 'https://youtube.com/@kfu' },
    { key: 'social_facebook',  label: 'Facebook',     icon: Link2, placeholder: 'https://facebook.com/kfu' },
];

function SocialTab({ data, onChange }: { data: SocialSettings; onChange: (d: SocialSettings) => void }) {
    const u = <K extends keyof SocialSettings>(k: K, v: SocialSettings[K]) =>
        onChange({ ...data, [k]: v });

    return (
        <div className="space-y-0">
            <SectionHeading
                title="Social Media Links"
                description="Links shown in the footer, contact page, and user profiles. Leave blank to hide."
            />
            {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                <FieldRow key={key} label={label}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0F172A] border border-[#1E293B] flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-[#475569]" />
                        </div>
                        <TextInput
                            value={data[key] ?? ''}
                            onChange={v => u(key, v)}
                            type="url"
                            placeholder={placeholder}
                            className="w-72"
                        />
                        {data[key] && (
                            <a
                                href={data[key]}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-7 h-7 rounded-lg text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </FieldRow>
            ))}
        </div>
    );
}

function FooterTab({ data, onChange }: { data: FooterSettings; onChange: (d: FooterSettings) => void }) {
    const u = <K extends keyof FooterSettings>(k: K, v: FooterSettings[K]) =>
        onChange({ ...data, [k]: v });

    const addLink = () =>
        u('footer_links', [...(data.footer_links ?? []), { label: '', url: '', target: '_self' }]);

    const updateLink = (i: number, field: keyof FooterLink, value: string) =>
        u('footer_links', data.footer_links.map((l, idx) =>
            idx === i ? { ...l, [field]: value } : l
        ));

    const removeLink = (i: number) =>
        u('footer_links', data.footer_links.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-0">
            <SectionHeading title="Footer Content" />
            <FieldRow label="Tagline" description="Short phrase displayed at the bottom of the footer">
                <TextInput value={data.footer_tagline} onChange={v => u('footer_tagline', v)} className="w-72" placeholder="Built for students, by students." />
            </FieldRow>
            <FieldRow label="Copyright Text" description="Shown at the very bottom of the page">
                <TextInput value={data.footer_copyright} onChange={v => u('footer_copyright', v)} className="w-80" placeholder="© 2026 King Faisal University." />
            </FieldRow>
            <FieldRow label="Show Social Links" description="Display social media icons in the footer">
                <Toggle checked={data.footer_show_socials ?? true} onChange={v => u('footer_show_socials', v)} />
            </FieldRow>
            <FieldRow label="Show Footer Links" description="Display the links column in the footer">
                <Toggle checked={data.footer_show_links ?? true} onChange={v => u('footer_show_links', v)} />
            </FieldRow>

            <div className="pt-4 pb-2">
                <SectionHeading
                    title="Footer Links"
                    description="Navigation links shown in the footer. Drag to reorder."
                />
            </div>
            <div className="space-y-2 py-3">
                {(data.footer_links ?? []).map((link, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-[#020617] border border-[#1E293B]">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <input
                                value={link.label}
                                onChange={e => updateLink(i, 'label', e.target.value)}
                                placeholder="Label"
                                className="h-7 px-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors"
                            />
                            <input
                                value={link.url}
                                onChange={e => updateLink(i, 'url', e.target.value)}
                                placeholder="/url or https://…"
                                className="h-7 px-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors font-mono"
                            />
                            <select
                                value={link.target}
                                onChange={e => updateLink(i, 'target', e.target.value)}
                                className="h-7 px-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#F8FAFC] outline-none cursor-pointer"
                            >
                                <option value="_self">Same tab</option>
                                <option value="_blank">New tab</option>
                            </select>
                        </div>
                        <button
                            onClick={() => removeLink(i)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#1E293B] transition-colors cursor-pointer shrink-0"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addLink}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-[#1E293B] text-xs text-[#475569] hover:text-[#94A3B8] hover:border-[#334155] transition-all cursor-pointer"
                >
                    <ChevronRight className="w-3 h-3" /> Add Link
                </button>
            </div>
        </div>
    );
}

// ─── Save bar ─────────────────────────────────────────────────────────────────

function SaveBar({
    dirty,
    saving,
    onSave,
    onDiscard,
}: {
    dirty: boolean;
    saving: boolean;
    onSave: () => void;
    onDiscard: () => void;
}) {
    return (
        <AnimatePresence>
            {dirty && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-2xl"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                        <span className="text-xs text-[#94A3B8]">Unsaved changes</span>
                    </div>
                    <div className="w-px h-4 bg-[#1E293B]" />
                    <button
                        onClick={onDiscard}
                        className="h-7 px-3 rounded-lg text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 h-7 px-4 rounded-lg bg-[#22C55E] text-xs font-medium text-white hover:bg-[#16A34A] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsIndex() {
    const { settings: initial } = usePage<SharedProps & PageProps>().props;

    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [data, setData] = useState<AllSettings>(initial);
    const [saved, setSaved] = useState<AllSettings>(initial);
    const [saving, setSaving] = useState(false);
    const [flushing, setFlushing] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = ++toastId.current;
        setToasts(ts => [...ts, { id, type, message }]);
        setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4000);
    }, []);

    const dismissToast = (id: number) => setToasts(ts => ts.filter(t => t.id !== id));

    const currentGroup = TABS.find(t => t.id === activeTab)!.group as keyof AllSettings;
    const dirty = JSON.stringify(data[currentGroup]) !== JSON.stringify(saved[currentGroup]);

    const handleSave = async () => {
        setSaving(true);
        const group = currentGroup;
        const payload = data[group];

        try {
            const res = await fetch(`/admin/settings/group/${group}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message ?? 'Save failed');

            // Merge returned fresh settings
            if (result.settings) {
                setData(result.settings as AllSettings);
                setSaved(result.settings as AllSettings);
            } else {
                setSaved(d => ({ ...d, [group]: data[group] }));
            }
            addToast('success', `${TABS.find(t => t.id === activeTab)?.label} settings saved.`);
        } catch (e: unknown) {
            addToast('error', e instanceof Error ? e.message : 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setData(d => ({ ...d, [currentGroup]: saved[currentGroup] }));
    };

    const handleAssetUploaded = (key: string, url: string) => {
        // Asset is already saved server-side; just sync saved state
        setSaved(s => ({ ...s, branding: { ...s.branding, [key]: url } }));
        setData(d => ({ ...d, branding: { ...d.branding, [key]: url } }));
        addToast('success', 'Asset uploaded and saved.');
    };

    const handleFlushCache = async () => {
        setFlushing(true);
        try {
            const res = await fetch('/admin/settings/flush-cache', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            addToast('success', 'Settings cache cleared.');
        } catch {
            addToast('error', 'Failed to clear cache.');
        } finally {
            setFlushing(false);
        }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab data={data.general} onChange={v => setData(d => ({ ...d, general: v }))} />;
            case 'branding':
                return (
                    <BrandingTab
                        data={data.branding}
                        onChange={v => setData(d => ({ ...d, branding: v }))}
                        onAssetUploaded={handleAssetUploaded}
                    />
                );
            case 'seo':
                return <SeoTab data={data.seo} onChange={v => setData(d => ({ ...d, seo: v }))} />;
            case 'contact':
                return <ContactTab data={data.contact} onChange={v => setData(d => ({ ...d, contact: v }))} />;
            case 'social':
                return <SocialTab data={data.social} onChange={v => setData(d => ({ ...d, social: v }))} />;
            case 'footer':
                return <FooterTab data={data.footer} onChange={v => setData(d => ({ ...d, footer: v }))} />;
        }
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Settings' }]}>
            <div className="flex flex-col h-full overflow-hidden">

                {/* ── Top bar ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#1E293B] shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">Settings</h1>
                        <p className="text-xs text-[#475569] mt-0.5">Platform configuration — all settings cached in Redis</p>
                    </div>
                    <button
                        onClick={handleFlushCache}
                        disabled={flushing}
                        title="Flush Redis settings cache"
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {flushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Flush Cache
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar nav */}
                    <nav className="w-48 shrink-0 border-r border-[#1E293B] py-4 px-2 space-y-0.5 overflow-y-auto">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const tabGroup = tab.group as keyof AllSettings;
                            const hasChanges = JSON.stringify(data[tabGroup]) !== JSON.stringify(saved[tabGroup]);

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer text-left relative',
                                        isActive
                                            ? 'bg-[#1E293B] text-[#F8FAFC] font-medium'
                                            : 'text-[#475569] hover:text-[#94A3B8] hover:bg-[#0A111E]'
                                    )}
                                >
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#22C55E] rounded-r-full" />
                                    )}
                                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#22C55E]' : 'text-[#334155]')} />
                                    <span className="flex-1">{tab.label}</span>
                                    {hasChanges && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                                    )}
                                </button>
                            );
                        })}

                        <div className="pt-4 mx-2 border-t border-[#1E293B]" />

                        {/* Danger zone */}
                        <div className="pt-2 px-1">
                            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#334155]">Danger Zone</p>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#EF4444]/60 hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all cursor-pointer text-left">
                                <Shield className="w-4 h-4 shrink-0" />
                                Reset Platform
                            </button>
                        </div>
                    </nav>

                    {/* Panel */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl px-8 py-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {/* Tab header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const tab = TABS.find(t => t.id === activeTab)!;
                                                const Icon = tab.icon;
                                                return (
                                                    <>
                                                        <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                                                            <Icon className="w-4 h-4 text-[#22C55E]" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-sm font-semibold text-[#F8FAFC]">{tab.label}</h2>
                                                            <p className="text-[11px] text-[#475569]">Group: <code className="font-mono text-[#334155]">{tab.group}</code></p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || !dirty}
                                            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#22C55E] text-xs font-medium text-white hover:bg-[#16A34A] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            {saving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>

                                    {/* Settings card */}
                                    <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] px-5 py-1">
                                        {renderTab()}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </AdminLayout>
    );
}
