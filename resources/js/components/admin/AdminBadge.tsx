import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface AdminBadgeProps {
    children: React.ReactNode;
    variant?: Variant;
    dot?: boolean;
    className?: string;
}

const VARIANTS: Record<Variant, string> = {
    success: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    danger:  'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
    info:    'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    neutral: 'bg-[#1E293B] text-[#64748B] border-[#334155]',
    purple:  'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20',
};

const DOT_COLORS: Record<Variant, string> = {
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    danger:  'bg-[#EF4444]',
    info:    'bg-[#3B82F6]',
    neutral: 'bg-[#475569]',
    purple:  'bg-[#A855F7]',
};

export default function AdminBadge({ children, variant = 'neutral', dot = false, className }: AdminBadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border',
            VARIANTS[variant], className
        )}>
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[variant])} />}
            {children}
        </span>
    );
}
