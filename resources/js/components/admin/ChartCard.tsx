import React from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function ChartCard({ title, description, actions, children, className }: ChartCardProps) {
    return (
        <div className={cn('rounded-xl border border-[#1E293B] bg-[#0F172A] overflow-hidden', className)}>
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#1E293B]">
                <div>
                    <h3 className="text-sm font-medium text-[#F8FAFC]">{title}</h3>
                    {description && <p className="mt-0.5 text-xs text-[#475569]">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}
