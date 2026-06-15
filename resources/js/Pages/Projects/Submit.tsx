import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    Code2,
    Eye,
    FolderGit2,
    Image,
    Info,
    Loader2,
    Save,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WizardFormData {
    // Step 1: Basic Information
    title: string;
    tagline: string;
    description: string;
    category: string;
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'private' | 'unlisted';
    start_date: string;
    end_date: string;
    demo_url: string;
    cover_image: File | null;

    // Step 2: Team Information
    team_name: string;
    team_size: string;
    team_members: { name: string; role: string; email: string }[];

    // Step 3: Technologies
    technologies: string[];
    tech_input: string;
    frameworks: string[];
    languages: string[];
    tools: string[];

    // Step 4: Awards
    awards: { title: string; issuer: string; date: string; description: string }[];

    // Step 5: Gallery
    gallery: File[];
    gallery_urls: string[];

    // Step 6: Repository
    repo_url: string;
    repo_type: 'github' | 'gitlab' | 'bitbucket' | 'other';
    is_private: boolean;
    branch: string;

    // Step 7: README
    readme_content: string;
    readme_source: 'write' | 'import';

    // Step 8: Review — no extra fields
}

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type StepErrors = Partial<Record<keyof WizardFormData | string, string>>;

interface WizardStep {
    id: StepId;
    label: string;
    icon: React.ElementType;
    description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: WizardStep[] = [
    { id: 1, label: 'Basic Info',    icon: Info,       description: 'Title, description and visibility' },
    { id: 2, label: 'Team',          icon: Users,      description: 'Team name and members' },
    { id: 3, label: 'Technologies',  icon: Code2,      description: 'Stack, languages and tools' },
    { id: 4, label: 'Awards',        icon: Award,      description: 'Recognition and achievements' },
    { id: 5, label: 'Gallery',       icon: Image,      description: 'Screenshots and media' },
    { id: 6, label: 'Repository',    icon: FolderGit2, description: 'Source code and version control' },
    { id: 7, label: 'README',        icon: BookOpen,   description: 'Project documentation' },
    { id: 8, label: 'Review',        icon: Eye,        description: 'Review and submit' },
];

const CATEGORIES = ['Web App', 'Mobile App', 'Desktop App', 'API / Backend', 'AI / ML', 'Game', 'IoT', 'Other'];
const DRAFT_KEY = 'project_wizard_draft';
const AUTOSAVE_INTERVAL = 5000;

const DEFAULT_FORM: WizardFormData = {
    title: '', tagline: '', description: '', category: '', status: 'draft',
    visibility: 'public', start_date: '', end_date: '', demo_url: '', cover_image: null,
    team_name: '', team_size: '1', team_members: [{ name: '', role: '', email: '' }],
    technologies: [], tech_input: '', frameworks: [], languages: [], tools: [],
    awards: [],
    gallery: [], gallery_urls: [],
    repo_url: '', repo_type: 'github', is_private: false, branch: 'main',
    readme_content: '', readme_source: 'write',
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: StepId, data: WizardFormData): StepErrors {
    const e: StepErrors = {};
    if (step === 1) {
        if (!data.title.trim()) e.title = 'Project title is required.';
        else if (data.title.length < 3) e.title = 'Title must be at least 3 characters.';
        if (!data.description.trim()) e.description = 'Description is required.';
        else if (data.description.length < 20) e.description = 'Description must be at least 20 characters.';
        if (!data.category) e.category = 'Please select a category.';
    }
    if (step === 2) {
        if (!data.team_name.trim()) e.team_name = 'Team name is required.';
        data.team_members.forEach((m, i) => {
            if (!m.name.trim()) e[`member_${i}_name`] = 'Member name is required.';
        });
    }
    if (step === 3) {
        if (data.technologies.length === 0) e.technologies = 'Add at least one technology.';
    }
    if (step === 6) {
        if (data.repo_url && !/^https?:\/\//.test(data.repo_url)) {
            e.repo_url = 'Must be a valid URL starting with http:// or https://';
        }
    }
    return e;
}

// ─── Utility Components ───────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
            role="alert"
        >
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
            {msg}
        </motion.p>
    );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-sm font-medium text-white/80 mb-1.5">
            {children}
            {required && <span className="text-violet-400 ml-0.5">*</span>}
        </label>
    );
}

function Input({
    className,
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <div>
            <input
                {...props}
                aria-invalid={!!error}
                className={cn(
                    'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30',
                    'transition-all duration-150 outline-none',
                    'focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20',
                    error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20',
                    className,
                )}
            />
            <FieldError msg={error} />
        </div>
    );
}

function Textarea({
    className,
    error,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
    return (
        <div>
            <textarea
                {...props}
                aria-invalid={!!error}
                className={cn(
                    'w-full bg-white/[0.04] border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 resize-none',
                    'transition-all duration-150 outline-none',
                    'focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20',
                    error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20',
                    className,
                )}
            />
            <FieldError msg={error} />
        </div>
    );
}

function Select({
    className,
    error,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
    return (
        <div>
            <select
                {...props}
                className={cn(
                    'w-full bg-[#0f0f0f] border rounded-xl px-4 py-2.5 text-sm text-white',
                    'transition-all duration-150 outline-none cursor-pointer',
                    'focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20',
                    error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20',
                    className,
                )}
            >
                {children}
            </select>
            <FieldError msg={error} />
        </div>
    );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            'rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-6',
            className,
        )}>
            {children}
        </div>
    );
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressIndicator({
    steps,
    current,
    visited,
    onStepClick,
}: {
    steps: WizardStep[];
    current: StepId;
    visited: Set<StepId>;
    onStepClick: (id: StepId) => void;
}) {
    const pct = ((current - 1) / (steps.length - 1)) * 100;

    return (
        <div className="relative">
            {/* Mobile: compact bar */}
            <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Step {current} of {steps.length}</span>
                    <span className="text-xs font-medium text-violet-400">{steps[current - 1].label}</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
            </div>

            {/* Desktop: step dots */}
            <div className="hidden sm:block">
                {/* Track line */}
                <div className="absolute top-5 left-0 right-0 h-px bg-white/[0.06]" />
                <motion.div
                    className="absolute top-5 left-0 h-px bg-gradient-to-r from-violet-600 to-violet-400 origin-left"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isDone = visited.has(step.id) && step.id < current;
                        const isActive = step.id === current;
                        const isClickable = visited.has(step.id) || step.id <= current;
                        const Icon = step.icon;

                        return (
                            <button
                                key={step.id}
                                onClick={() => isClickable && onStepClick(step.id)}
                                disabled={!isClickable}
                                aria-current={isActive ? 'step' : undefined}
                                aria-label={`Step ${step.id}: ${step.label}`}
                                className={cn(
                                    'flex flex-col items-center gap-2 group',
                                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
                                )}
                            >
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                                    'border-2 relative z-10',
                                    isDone && 'bg-violet-600 border-violet-600',
                                    isActive && 'bg-violet-600/20 border-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)]',
                                    !isDone && !isActive && 'bg-[#0a0a0a] border-white/10 group-hover:border-white/25',
                                )}>
                                    {isDone ? (
                                        <Check className="w-4 h-4 text-white" />
                                    ) : (
                                        <Icon className={cn(
                                            'w-4 h-4 transition-colors duration-200',
                                            isActive ? 'text-violet-400' : 'text-white/30 group-hover:text-white/60',
                                        )} />
                                    )}
                                </div>
                                <span className={cn(
                                    'text-[10px] font-medium transition-colors duration-200 text-center leading-tight max-w-[60px]',
                                    isActive ? 'text-violet-400' : isDone ? 'text-white/60' : 'text-white/25 group-hover:text-white/50',
                                )}>
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Step 1: Basic Information ────────────────────────────────────────────────

function StepBasicInfo({
    data,
    errors,
    onChange,
}: {
    data: WizardFormData;
    errors: StepErrors;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    return (
        <div className="space-y-5">
            <div>
                <Label required>Project Title</Label>
                <Input
                    value={data.title}
                    onChange={e => onChange({ title: e.target.value })}
                    placeholder="e.g. AI-Powered Task Manager"
                    error={errors.title}
                    maxLength={100}
                />
                <p className="mt-1 text-xs text-white/30 text-right">{data.title.length}/100</p>
            </div>

            <div>
                <Label>Tagline</Label>
                <Input
                    value={data.tagline}
                    onChange={e => onChange({ tagline: e.target.value })}
                    placeholder="One line that captures your project"
                    maxLength={160}
                />
            </div>

            <div>
                <Label required>Description</Label>
                <Textarea
                    value={data.description}
                    onChange={e => onChange({ description: e.target.value })}
                    placeholder="Describe your project — what it does, why it matters, how it works..."
                    rows={5}
                    error={errors.description}
                />
                <p className="mt-1 text-xs text-white/30">{data.description.length} chars (min 20)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label required>Category</Label>
                    <Select
                        value={data.category}
                        onChange={e => onChange({ category: e.target.value })}
                        error={errors.category}
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
                <div>
                    <Label>Visibility</Label>
                    <Select
                        value={data.visibility}
                        onChange={e => onChange({ visibility: e.target.value as WizardFormData['visibility'] })}
                    >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        value={data.start_date}
                        onChange={e => onChange({ start_date: e.target.value })}
                        className="[color-scheme:dark]"
                    />
                </div>
                <div>
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        value={data.end_date}
                        onChange={e => onChange({ end_date: e.target.value })}
                        className="[color-scheme:dark]"
                    />
                </div>
            </div>

            <div>
                <Label>Demo URL</Label>
                <Input
                    type="url"
                    value={data.demo_url}
                    onChange={e => onChange({ demo_url: e.target.value })}
                    placeholder="https://your-demo.example.com"
                />
            </div>
        </div>
    );
}

// ─── Step 2: Team Information ─────────────────────────────────────────────────

function StepTeamInfo({
    data,
    errors,
    onChange,
}: {
    data: WizardFormData;
    errors: StepErrors;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    const addMember = () =>
        onChange({ team_members: [...data.team_members, { name: '', role: '', email: '' }] });

    const removeMember = (i: number) =>
        onChange({ team_members: data.team_members.filter((_, idx) => idx !== i) });

    const updateMember = (i: number, patch: Partial<(typeof data.team_members)[0]>) =>
        onChange({
            team_members: data.team_members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
        });

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label required>Team Name</Label>
                    <Input
                        value={data.team_name}
                        onChange={e => onChange({ team_name: e.target.value })}
                        placeholder="e.g. The Innovators"
                        error={errors.team_name}
                    />
                </div>
                <div>
                    <Label>Team Size</Label>
                    <Select value={data.team_size} onChange={e => onChange({ team_size: e.target.value })}>
                        {['1', '2', '3', '4', '5', '6+'].map(n => <option key={n} value={n}>{n} {n === '1' ? 'member' : 'members'}</option>)}
                    </Select>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label>Team Members</Label>
                    <button
                        type="button"
                        onClick={addMember}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                    >
                        + Add Member
                    </button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {data.team_members.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <GlassCard className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                                            Member {i + 1}
                                        </span>
                                        {data.team_members.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMember(i)}
                                                className="text-xs text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label required>Name</Label>
                                            <Input
                                                value={member.name}
                                                onChange={e => updateMember(i, { name: e.target.value })}
                                                placeholder="Full name"
                                                error={errors[`member_${i}_name`]}
                                            />
                                        </div>
                                        <div>
                                            <Label>Role</Label>
                                            <Input
                                                value={member.role}
                                                onChange={e => updateMember(i, { role: e.target.value })}
                                                placeholder="e.g. Frontend Dev"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={member.email}
                                                onChange={e => updateMember(i, { email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Step 3: Technologies ─────────────────────────────────────────────────────

const SUGGESTED_TECH = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
    'TypeScript', 'JavaScript', 'Python', 'PHP', 'Go', 'Rust', 'Java', 'C#',
    'Laravel', 'Django', 'FastAPI', 'Node.js', 'Express', 'NestJS',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'AWS', 'Tailwind CSS', 'GraphQL',
];

function StepTechnologies({
    data,
    errors,
    onChange,
}: {
    data: WizardFormData;
    errors: StepErrors;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    const [input, setInput] = useState('');

    const addTech = (tech: string) => {
        const cleaned = tech.trim();
        if (!cleaned || data.technologies.includes(cleaned)) return;
        onChange({ technologies: [...data.technologies, cleaned] });
    };

    const removeTech = (t: string) =>
        onChange({ technologies: data.technologies.filter(x => x !== t) });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ',', 'Tab'].includes(e.key)) {
            e.preventDefault();
            addTech(input);
            setInput('');
        }
    };

    const suggestions = SUGGESTED_TECH.filter(
        t => !data.technologies.includes(t) &&
            (input ? t.toLowerCase().includes(input.toLowerCase()) : true),
    ).slice(0, 12);

    return (
        <div className="space-y-5">
            <div>
                <Label required>Technologies Used</Label>
                <div className={cn(
                    'min-h-[100px] bg-white/[0.04] border rounded-xl px-3 py-3 flex flex-wrap gap-2 items-start',
                    'transition-all duration-150 focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/20',
                    errors.technologies ? 'border-red-500/60' : 'border-white/10',
                )}>
                    <AnimatePresence>
                        {data.technologies.map(t => (
                            <motion.span
                                key={t}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="inline-flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs px-2.5 py-1 rounded-lg"
                            >
                                {t}
                                <button
                                    type="button"
                                    onClick={() => removeTech(t)}
                                    className="text-violet-400/60 hover:text-violet-300 transition-colors cursor-pointer leading-none"
                                    aria-label={`Remove ${t}`}
                                >
                                    ×
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => { if (input.trim()) { addTech(input); setInput(''); } }}
                        placeholder={data.technologies.length === 0 ? 'Type and press Enter or comma…' : ''}
                        className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                    />
                </div>
                <FieldError msg={errors.technologies} />
                <p className="mt-1.5 text-xs text-white/30">Press Enter, comma, or Tab to add</p>
            </div>

            {suggestions.length > 0 && (
                <div>
                    <p className="text-xs text-white/40 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addTech(s)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-white/50 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-600/10 transition-all duration-150 cursor-pointer"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Step 4: Awards ───────────────────────────────────────────────────────────

function StepAwards({
    data,
    onChange,
}: {
    data: WizardFormData;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    const addAward = () =>
        onChange({ awards: [...data.awards, { title: '', issuer: '', date: '', description: '' }] });

    const removeAward = (i: number) =>
        onChange({ awards: data.awards.filter((_, idx) => idx !== i) });

    const updateAward = (i: number, patch: Partial<(typeof data.awards)[0]>) =>
        onChange({ awards: data.awards.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">Add any prizes, recognitions, or hackathon placements.</p>
                <button
                    type="button"
                    onClick={addAward}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                    + Add Award
                </button>
            </div>

            {data.awards.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
                    <Award className="w-10 h-10 text-white/10 mb-3" />
                    <p className="text-sm text-white/30">No awards yet</p>
                    <p className="text-xs text-white/20 mt-1">This section is optional</p>
                    <button
                        type="button"
                        onClick={addAward}
                        className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                    >
                        + Add your first award
                    </button>
                </GlassCard>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {data.awards.map((award, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-amber-400/70 uppercase tracking-wider flex items-center gap-1.5">
                                            <Award className="w-3 h-3" /> Award {i + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAward(i)}
                                            className="text-xs text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label>Award Title</Label>
                                            <Input
                                                value={award.title}
                                                onChange={e => updateAward(i, { title: e.target.value })}
                                                placeholder="e.g. 1st Place — Hackathon 2024"
                                            />
                                        </div>
                                        <div>
                                            <Label>Issuer / Organization</Label>
                                            <Input
                                                value={award.issuer}
                                                onChange={e => updateAward(i, { issuer: e.target.value })}
                                                placeholder="e.g. MIT Media Lab"
                                            />
                                        </div>
                                        <div>
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={award.date}
                                                onChange={e => updateAward(i, { date: e.target.value })}
                                                className="[color-scheme:dark]"
                                            />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Input
                                                value={award.description}
                                                onChange={e => updateAward(i, { description: e.target.value })}
                                                placeholder="Brief note about the award"
                                            />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// ─── Step 5: Gallery ──────────────────────────────────────────────────────────

function StepGallery({
    data,
    onChange,
}: {
    data: WizardFormData;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
        onChange({ gallery: [...data.gallery, ...valid] });
    };

    const removeFile = (i: number) =>
        onChange({ gallery: data.gallery.filter((_, idx) => idx !== i) });

    const addUrl = () =>
        onChange({ gallery_urls: [...data.gallery_urls, ''] });

    const updateUrl = (i: number, val: string) =>
        onChange({ gallery_urls: data.gallery_urls.map((u, idx) => idx === i ? val : u) });

    const removeUrl = (i: number) =>
        onChange({ gallery_urls: data.gallery_urls.filter((_, idx) => idx !== i) });

    return (
        <div className="space-y-5">
            {/* Upload zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
                aria-label="Upload gallery images"
                className={cn(
                    'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
                    dragging
                        ? 'border-violet-500 bg-violet-600/10 scale-[1.01]'
                        : 'border-white/10 hover:border-white/25 hover:bg-white/[0.02]',
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleFiles(e.target.files)}
                    className="sr-only"
                />
                <Image className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">
                    Drag & drop images or{' '}
                    <span className="text-violet-400 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-white/25 mt-1">PNG, JPG, GIF, WebP — any size</p>
            </div>

            {/* Preview grid */}
            {data.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <AnimatePresence>
                        {data.gallery.map((file, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="relative group aspect-square rounded-xl overflow-hidden border border-white/10"
                            >
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); removeFile(i); }}
                                        className="text-xs text-red-400 hover:text-red-300 bg-black/50 px-2 py-1 rounded-lg cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* URL inputs */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Or add image URLs</Label>
                    <button
                        type="button"
                        onClick={addUrl}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                    >
                        + Add URL
                    </button>
                </div>
                <div className="space-y-2">
                    <AnimatePresence initial={false}>
                        {data.gallery_urls.map((url, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex gap-2"
                            >
                                <Input
                                    type="url"
                                    value={url}
                                    onChange={e => updateUrl(i, e.target.value)}
                                    placeholder="https://example.com/screenshot.png"
                                    className="flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeUrl(i)}
                                    className="text-white/30 hover:text-red-400 transition-colors cursor-pointer px-2"
                                    aria-label="Remove URL"
                                >
                                    ×
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Step 6: Repository ───────────────────────────────────────────────────────

function StepRepository({
    data,
    errors,
    onChange,
}: {
    data: WizardFormData;
    errors: StepErrors;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    return (
        <div className="space-y-5">
            <div>
                <Label>Repository URL</Label>
                <Input
                    type="url"
                    value={data.repo_url}
                    onChange={e => onChange({ repo_url: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    error={errors.repo_url}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Platform</Label>
                    <Select
                        value={data.repo_type}
                        onChange={e => onChange({ repo_type: e.target.value as WizardFormData['repo_type'] })}
                    >
                        <option value="github">GitHub</option>
                        <option value="gitlab">GitLab</option>
                        <option value="bitbucket">Bitbucket</option>
                        <option value="other">Other</option>
                    </Select>
                </div>
                <div>
                    <Label>Default Branch</Label>
                    <Input
                        value={data.branch}
                        onChange={e => onChange({ branch: e.target.value })}
                        placeholder="main"
                    />
                </div>
            </div>

            <div>
                <GlassCard className="flex items-center justify-between py-4">
                    <div>
                        <p className="text-sm font-medium text-white/80">Private Repository</p>
                        <p className="text-xs text-white/40 mt-0.5">Repository requires authentication to access</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={data.is_private}
                        onClick={() => onChange({ is_private: !data.is_private })}
                        className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer',
                            data.is_private ? 'bg-violet-600' : 'bg-white/10',
                        )}
                    >
                        <span className={cn(
                            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                            data.is_private ? 'translate-x-6' : 'translate-x-1',
                        )} />
                    </button>
                </GlassCard>
            </div>

            <GlassCard className="p-4 border-blue-500/20 bg-blue-500/[0.04]">
                <p className="text-xs text-blue-400/80 leading-relaxed">
                    <span className="font-medium text-blue-300">Tip:</span> You can skip this step if your project doesn't have a public repository. The README step below lets you write documentation directly.
                </p>
            </GlassCard>
        </div>
    );
}

// ─── Step 7: README ───────────────────────────────────────────────────────────

function StepReadme({
    data,
    onChange,
}: {
    data: WizardFormData;
    onChange: (patch: Partial<WizardFormData>) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {(['write', 'import'] as const).map(src => (
                    <button
                        key={src}
                        type="button"
                        onClick={() => onChange({ readme_source: src })}
                        className={cn(
                            'px-4 py-1.5 text-sm rounded-lg border transition-all duration-150 cursor-pointer capitalize',
                            data.readme_source === src
                                ? 'border-violet-500/50 bg-violet-600/20 text-violet-300'
                                : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70',
                        )}
                    >
                        {src === 'write' ? 'Write Manually' : 'Import Markdown'}
                    </button>
                ))}
            </div>

            {data.readme_source === 'write' ? (
                <div>
                    <Label>README Content</Label>
                    <Textarea
                        value={data.readme_content}
                        onChange={e => onChange({ readme_content: e.target.value })}
                        placeholder={`# Project Name\n\nA brief description of your project.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Installation\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Usage\n...`}
                        rows={16}
                        className="font-mono text-xs leading-relaxed"
                    />
                    <p className="mt-1.5 text-xs text-white/30">Markdown is supported</p>
                </div>
            ) : (
                <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-10 h-10 text-white/10 mb-3" />
                    <p className="text-sm text-white/40">Paste your README.md content below</p>
                    <Textarea
                        value={data.readme_content}
                        onChange={e => onChange({ readme_content: e.target.value })}
                        placeholder="Paste markdown content here..."
                        rows={10}
                        className="mt-4 font-mono text-xs text-left"
                    />
                </GlassCard>
            )}
        </div>
    );
}

// ─── Step 8: Review ───────────────────────────────────────────────────────────

function StepReview({
    data,
    onGoToStep,
}: {
    data: WizardFormData;
    onGoToStep: (step: StepId) => void;
}) {
    const sections: { label: string; step: StepId; items: [string, string | number | boolean | null][] }[] = [
        {
            label: 'Basic Information', step: 1,
            items: [
                ['Title', data.title || '—'],
                ['Tagline', data.tagline || '—'],
                ['Category', data.category || '—'],
                ['Visibility', data.visibility],
                ['Demo URL', data.demo_url || '—'],
            ],
        },
        {
            label: 'Team', step: 2,
            items: [
                ['Team Name', data.team_name || '—'],
                ['Size', data.team_size],
                ['Members', data.team_members.filter(m => m.name).map(m => m.name).join(', ') || '—'],
            ],
        },
        {
            label: 'Technologies', step: 3,
            items: [
                ['Stack', data.technologies.join(', ') || '—'],
            ],
        },
        {
            label: 'Awards', step: 4,
            items: [
                ['Count', data.awards.length],
            ],
        },
        {
            label: 'Gallery', step: 5,
            items: [
                ['Images', data.gallery.length + data.gallery_urls.length],
            ],
        },
        {
            label: 'Repository', step: 6,
            items: [
                ['URL', data.repo_url || '—'],
                ['Platform', data.repo_type],
                ['Private', data.is_private ? 'Yes' : 'No'],
            ],
        },
        {
            label: 'README', step: 7,
            items: [
                ['Content', data.readme_content ? `${data.readme_content.length} chars` : '—'],
            ],
        },
    ];

    return (
        <div className="space-y-3">
            <p className="text-sm text-white/50 pb-1">Review your project before submitting. Click Edit on any section to go back.</p>
            {sections.map(section => (
                <GlassCard key={section.label} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white/80">{section.label}</h3>
                        <button
                            type="button"
                            onClick={() => onGoToStep(section.step)}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                        >
                            Edit
                        </button>
                    </div>
                    <dl className="space-y-1.5">
                        {section.items.map(([key, val]) => (
                            <div key={key} className="flex gap-3 text-xs">
                                <dt className="text-white/35 w-28 shrink-0">{key}</dt>
                                <dd className="text-white/70 truncate">{String(val)}</dd>
                            </div>
                        ))}
                    </dl>
                </GlassCard>
            ))}
        </div>
    );
}

// ─── Auto-save Badge ──────────────────────────────────────────────────────────

function AutoSaveBadge({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={state}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 text-xs"
            >
                {state === 'saving' && (
                    <>
                        <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                        <span className="text-white/30">Saving draft…</span>
                    </>
                )}
                {state === 'saved' && (
                    <>
                        <Save className="w-3 h-3 text-emerald-400/70" />
                        <span className="text-emerald-400/70">Draft saved</span>
                    </>
                )}
                {state === 'error' && (
                    <span className="text-red-400/70">Save failed</span>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────

const STEP_VARIANTS = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function ProjectSubmitWizard() {
    const [step, setStep] = useState<StepId>(1);
    const [dir, setDir] = useState(1);
    const [form, setForm] = useState<WizardFormData>(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<WizardFormData>;
                return { ...DEFAULT_FORM, ...parsed, gallery: [], cover_image: null };
            }
        } catch {}
        return DEFAULT_FORM;
    });
    const [errors, setErrors] = useState<StepErrors>({});
    const [visited, setVisited] = useState<Set<StepId>>(new Set([1]));
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [submitting, setSubmitting] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const saveStateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-save on form change
    useEffect(() => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            setSaveState('saving');
            try {
                const { gallery, cover_image, ...serializeable } = form;
                localStorage.setItem(DRAFT_KEY, JSON.stringify(serializeable));
                setSaveState('saved');
                if (saveStateTimer.current) clearTimeout(saveStateTimer.current);
                saveStateTimer.current = setTimeout(() => setSaveState('idle'), 3000);
            } catch {
                setSaveState('error');
            }
        }, AUTOSAVE_INTERVAL);

        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [form]);

    const onChange = useCallback((patch: Partial<WizardFormData>) => {
        setForm(prev => ({ ...prev, ...patch }));
        // Clear errors for changed keys
        setErrors(prev => {
            const next = { ...prev };
            Object.keys(patch).forEach(k => delete next[k]);
            return next;
        });
    }, []);

    const goToStep = useCallback((target: StepId) => {
        setDir(target > step ? 1 : -1);
        setStep(target);
        setVisited(prev => new Set([...prev, target]));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleNext = () => {
        const stepErrors = validateStep(step, form);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            // Focus first error field
            const firstKey = Object.keys(stepErrors)[0];
            const el = document.querySelector<HTMLElement>(`[name="${firstKey}"], #${firstKey}`);
            el?.focus();
            return;
        }
        setErrors({});
        if (step < 8) goToStep((step + 1) as StepId);
    };

    const handleBack = () => {
        if (step > 1) goToStep((step - 1) as StepId);
    };

    const handleSubmit = async () => {
        const stepErrors = validateStep(8, form);
        if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
        setSubmitting(true);
        // Inertia form submission
        router.post('/projects', form as unknown as Record<string, unknown>, {
            onSuccess: () => {
                localStorage.removeItem(DRAFT_KEY);
            },
            onError: (e) => {
                setErrors(e);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const currentStepMeta = STEPS[step - 1];

    return (
        <AppLayout>
            <Head title="Submit Project" />

            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[100px]" />
            </div>

            <div className="min-h-screen px-4 py-10 sm:py-16">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-1">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Submit Project</h1>
                            <AutoSaveBadge state={saveState} />
                        </div>
                        <p className="text-sm text-white/40">Share your work with the community</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-10">
                        <ProgressIndicator
                            steps={STEPS}
                            current={step}
                            visited={visited}
                            onStepClick={goToStep}
                        />
                    </div>

                    {/* Step Card */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md overflow-hidden">
                        {/* Step Header */}
                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <currentStepMeta.icon className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">{currentStepMeta.label}</h2>
                                <p className="text-xs text-white/40">{currentStepMeta.description}</p>
                            </div>
                            <div className="ml-auto text-xs text-white/25 shrink-0">{step} / {STEPS.length}</div>
                        </div>

                        {/* Step Content */}
                        <div className="relative overflow-hidden">
                            <AnimatePresence custom={dir} mode="wait" initial={false}>
                                <motion.div
                                    key={step}
                                    custom={dir}
                                    variants={STEP_VARIANTS}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="px-6 py-6"
                                >
                                    {step === 1 && <StepBasicInfo data={form} errors={errors} onChange={onChange} />}
                                    {step === 2 && <StepTeamInfo data={form} errors={errors} onChange={onChange} />}
                                    {step === 3 && <StepTechnologies data={form} errors={errors} onChange={onChange} />}
                                    {step === 4 && <StepAwards data={form} onChange={onChange} />}
                                    {step === 5 && <StepGallery data={form} onChange={onChange} />}
                                    {step === 6 && <StepRepository data={form} errors={errors} onChange={onChange} />}
                                    {step === 7 && <StepReadme data={form} onChange={onChange} />}
                                    {step === 8 && <StepReview data={form} onGoToStep={goToStep} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Footer */}
                        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={step === 1}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
                                    step === 1
                                        ? 'text-white/20 cursor-not-allowed'
                                        : 'text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10',
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            <div className="flex items-center gap-2">
                                {/* Save draft manually */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSaveState('saving');
                                        try {
                                            const { gallery, cover_image, ...s } = form;
                                            localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
                                            setSaveState('saved');
                                            setTimeout(() => setSaveState('idle'), 3000);
                                        } catch { setSaveState('error'); }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 border border-transparent hover:border-white/10 transition-all duration-150 cursor-pointer"
                                    aria-label="Save draft"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save Draft
                                </button>

                                {step < 8 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all duration-150 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all duration-150 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                                        ) : (
                                            <><Check className="w-4 h-4" /> Submit Project</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom hint */}
                    <p className="mt-4 text-center text-xs text-white/20">
                        Your draft is saved automatically every {AUTOSAVE_INTERVAL / 1000} seconds
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
