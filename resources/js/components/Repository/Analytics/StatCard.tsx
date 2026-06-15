import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: LucideIcon;
    accent?: string; // tailwind gradient class pair or hex
    className?: string;
}

export default function StatCard({ label, value, sub, icon: Icon, accent = 'from-purple-500 to-blue-500', className }: StatCardProps) {
    return (
        <div className={cn(
            'group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-md',
            'transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]',
            className,
        )}>
            {/* Gradient corner glow */}
            <div className={cn('absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-br opacity-20 blur-xl', accent)} />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">{label}</p>
                    <p className="mt-1.5 font-mono text-2xl font-bold text-white leading-none">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {sub && <p className="mt-1 text-[11px] text-gray-600">{sub}</p>}
                </div>
                <div className={cn('shrink-0 rounded-lg bg-gradient-to-br p-2.5', accent)}>
                    <Icon size={16} className="text-white" />
                </div>
            </div>
        </div>
    );
}
