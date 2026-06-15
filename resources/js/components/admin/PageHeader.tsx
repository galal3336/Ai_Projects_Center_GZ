import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
            <div>
                <h1 className="text-xl font-semibold text-[#F8FAFC] tracking-tight">{title}</h1>
                {description && (
                    <p className="mt-0.5 text-sm text-[#475569]">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
