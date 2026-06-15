import type { RepositoryAnalytics } from '@/types';

interface LocBreakdownProps {
    analytics: RepositoryAnalytics;
}

export default function LocBreakdown({ analytics }: LocBreakdownProps) {
    const { total_lines, code_lines, comment_lines, blank_lines } = analytics;
    if (total_lines === 0) return null;

    const segments = [
        { label: 'Code',     value: code_lines,    color: '#3B82F6', pct: (code_lines / total_lines) * 100 },
        { label: 'Comments', value: comment_lines,  color: '#22C55E', pct: (comment_lines / total_lines) * 100 },
        { label: 'Blank',    value: blank_lines,    color: '#374151', pct: (blank_lines / total_lines) * 100 },
    ];

    return (
        <div className="space-y-4">
            {/* Stacked bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                {segments.map(s => (
                    <div
                        key={s.label}
                        className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                        style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                    />
                ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
                {segments.map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="flex-1 text-[12px] text-gray-400">{s.label}</span>
                        <span className="font-mono text-[12px] text-gray-300">{s.value.toLocaleString()}</span>
                        <span className="w-10 text-right font-mono text-[11px] text-gray-600">{s.pct.toFixed(1)}%</span>
                    </div>
                ))}
                <div className="border-t border-white/[0.06] pt-2 flex items-center gap-3">
                    <span className="w-2.5" />
                    <span className="flex-1 text-[12px] font-semibold text-gray-300">Total</span>
                    <span className="font-mono text-[12px] font-bold text-white">{total_lines.toLocaleString()}</span>
                    <span className="w-10" />
                </div>
            </div>
        </div>
    );
}
