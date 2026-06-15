import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'default';
    description?: string;
    index?: number;
}

const COLOR_MAP = {
    green:   { icon: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', glow: 'shadow-[0_0_24px_rgba(34,197,94,0.08)]' },
    blue:    { icon: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20', glow: 'shadow-[0_0_24px_rgba(59,130,246,0.08)]' },
    yellow:  { icon: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.08)]' },
    red:     { icon: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', glow: 'shadow-[0_0_24px_rgba(239,68,68,0.08)]' },
    purple:  { icon: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/20', glow: 'shadow-[0_0_24px_rgba(168,85,247,0.08)]' },
    default: { icon: 'text-[#94A3B8]', bg: 'bg-[#1E293B]',    border: 'border-[#1E293B]',    glow: '' },
};

export default function StatCard({
    title, value, icon: Icon, trend, trendLabel, color = 'default', description, index = 0
}: StatCardProps) {
    const c = COLOR_MAP[color];
    const isPositive = trend !== undefined && trend > 0;
    const isNegative = trend !== undefined && trend < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                'relative flex flex-col gap-3 p-4 rounded-xl border bg-[#0F172A] overflow-hidden',
                c.border, c.glow
            )}
        >
            {/* Subtle gradient top */}
            <div className={cn('absolute inset-x-0 top-0 h-px opacity-60', c.bg)} />

            <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{title}</p>
                <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', c.bg)}>
                    <Icon className={cn('w-4 h-4', c.icon)} />
                </div>
            </div>

            <div>
                <p className="text-2xl font-semibold text-[#F8FAFC] tabular-nums tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {description && (
                    <p className="mt-0.5 text-xs text-[#475569]">{description}</p>
                )}
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        'flex items-center gap-0.5 text-xs font-medium',
                        isPositive ? 'text-[#22C55E]' : isNegative ? 'text-[#EF4444]' : 'text-[#64748B]'
                    )}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> :
                         isNegative ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                    {trendLabel && (
                        <span className="text-xs text-[#475569]">{trendLabel}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
