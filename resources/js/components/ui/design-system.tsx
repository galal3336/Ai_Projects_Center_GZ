/**
 * AIKFS Premium Design System
 * Shared atoms, tokens, and motion utilities used across all pages.
 */

import { motion, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

// ─── Motion Variants ─────────────────────────────────────────────────────────

export const fadeUp: Variants = {
    hidden:  { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
    }),
};

export const fadeIn: Variants = {
    hidden:  { opacity: 0 },
    visible: (i = 0) => ({
        opacity: 1,
        transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
    }),
};

export const scaleIn: Variants = {
    hidden:  { opacity: 0, scale: 0.93 },
    visible: (i = 0) => ({
        opacity: 1, scale: 1,
        transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
    }),
};

export const slideLeft: Variants = {
    hidden:  { opacity: 0, x: -20 },
    visible: (i = 0) => ({
        opacity: 1, x: 0,
        transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
    }),
};

// ─── Reveal wrapper (scroll-triggered) ───────────────────────────────────────

interface RevealProps {
    children: React.ReactNode;
    variants?: Variants;
    custom?: number;
    className?: string;
    once?: boolean;
}

export function Reveal({ children, variants = fadeUp, custom = 0, className = '', once = true }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once, margin: '-50px 0px' });
    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={custom}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Ambient background ───────────────────────────────────────────────────────

export function AmbientBackground({ className = '' }: { className?: string }) {
    return (
        <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`} aria-hidden="true">
            <div className="absolute -top-[30%] left-[15%]  h-[65%] w-[55%] rounded-full opacity-[0.065] blur-[130px]"
                 style={{ background: 'radial-gradient(circle, #7c3aed 0%, #3b82f6 60%, transparent 100%)' }} />
            <div className="absolute top-[30%]  -right-[15%] h-[50%] w-[40%] rounded-full opacity-[0.045] blur-[110px]"
                 style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 100%)' }} />
            <div className="absolute -bottom-[15%] left-[5%] h-[45%] w-[45%] rounded-full opacity-[0.04] blur-[100px]"
                 style={{ background: 'radial-gradient(circle, #3b82f6 0%, #7c3aed 50%, transparent 100%)' }} />
        </div>
    );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    lift?: boolean;
    as?: 'div' | 'article' | 'section';
}

export function GlassCard({ children, className = '', lift = true, as: Tag = 'div' }: GlassCardProps) {
    return (
        <Tag className={`glass ${lift ? 'glass-lift' : ''} ${className}`}>
            {children}
        </Tag>
    );
}

// ─── Section label chip ───────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="label-chip mb-4">
            <span className="live-dot" aria-hidden="true" />
            {children}
        </div>
    );
}

// ─── Gradient headline text ───────────────────────────────────────────────────

export function GradientText({ children, className = '', variant = 'violet' }: {
    children: React.ReactNode;
    className?: string;
    variant?: 'violet' | 'gold';
}) {
    return (
        <span className={`text-gradient-${variant} ${className}`}>
            {children}
        </span>
    );
}

// ─── Stat counter card ────────────────────────────────────────────────────────

export function StatPill({ value, label, icon: Icon, color = '#8b5cf6' }: {
    value: string;
    label: string;
    icon?: React.ElementType;
    color?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" style={{ color }} />}
                <span className="tabular text-2xl font-black text-white/85">{value}</span>
            </div>
            <span className="text-[11px] font-medium tracking-wide text-white/35">{label}</span>
        </div>
    );
}

// ─── Tag/badge ────────────────────────────────────────────────────────────────

export function Tag({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/50 transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300">
            {children}
        </span>
    );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

export function ScoreBar({ score, max = 10000, color }: { score: number; max?: number; color: string }) {
    const pct = Math.min(100, Math.round((score / max) * 100));
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
            <span className="w-11 text-right font-mono text-[11px] font-bold tabular text-white/40">
                {score.toLocaleString()}
            </span>
        </div>
    );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

export function AvatarInitials({ initials, color, size = 'md' }: {
    initials: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const sizeMap = { sm: 'h-8 w-8 text-[11px]', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg' };
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl font-black text-white shadow-lg ${sizeMap[size]}`}
            style={{
                background: `linear-gradient(135deg, ${color}cc, ${color}55)`,
                border: `1.5px solid ${color}44`,
            }}
        >
            {initials}
        </div>
    );
}

// ─── Rank ornament ────────────────────────────────────────────────────────────

import { Crown, Medal, Award } from 'lucide-react';

export function RankOrnament({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
            <Crown className="h-4 w-4 text-white" />
        </div>
    );
    if (rank === 2) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-400/20">
            <Medal className="h-4 w-4 text-white" />
        </div>
    );
    if (rank === 3) return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg shadow-orange-500/20">
            <Award className="h-4 w-4 text-white" />
        </div>
    );
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <span className="tabular font-mono text-[11px] font-black text-white/35">#{rank}</span>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
    icon: React.ElementType;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
        >
            <div className="glass mb-5 flex h-16 w-16 items-center justify-center">
                <Icon className="h-7 w-7 text-white/20" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-white/80">{title}</h3>
            {description && (
                <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/40">{description}</p>
            )}
            {action}
        </motion.div>
    );
}
