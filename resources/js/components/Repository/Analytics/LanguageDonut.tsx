import { cn } from '@/lib/utils';
import type { LanguageStat } from '@/types';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface LanguageDonutProps {
    languages: LanguageStat[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: LanguageStat }> }) {
    if (!active || !payload?.length) return null;
    const lang = payload[0].payload;
    return (
        <div className="rounded-lg border border-white/[0.10] bg-[#0d1117]/95 px-3 py-2.5 text-xs backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="font-semibold text-white">{lang.name}</span>
            </div>
            <div className="space-y-0.5 text-gray-400">
                <p>{lang.percentage}%</p>
                <p>{lang.lines.toLocaleString()} lines</p>
                <p>{lang.files} files</p>
            </div>
        </div>
    );
}

// Compact horizontal language bar (GitHub-style)
function LanguageBar({ languages }: { languages: LanguageStat[] }) {
    const top = languages.slice(0, 10);
    // Normalise to 100%
    const total = top.reduce((s, l) => s + l.percentage, 0);
    const normalised = top.map(l => ({ ...l, pct: total > 0 ? (l.percentage / total) * 100 : 0 }));

    return (
        <div className="space-y-3">
            {/* Bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                {normalised.map((l, i) => (
                    <div
                        key={l.name}
                        className={cn('h-full transition-all duration-500', i > 0 && 'ml-px')}
                        style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                        title={`${l.name} ${l.percentage}%`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {normalised.map(l => (
                    <div key={l.name} className="flex items-center gap-1.5">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[11px] text-gray-400">{l.name}</span>
                        <span className="text-[11px] font-mono text-gray-600">{l.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LanguageDonut({ languages }: LanguageDonutProps) {
    if (!languages.length) {
        return <p className="py-10 text-center text-sm text-gray-600">No language data</p>;
    }

    const top = languages.slice(0, 8);

    return (
        <div className="space-y-6">
            {/* Donut + right legend */}
            <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="h-48 w-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={top}
                                dataKey="bytes"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={52}
                                outerRadius={88}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {top.map((lang) => (
                                    <Cell key={lang.name} fill={lang.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Right legend */}
                <div className="flex-1 space-y-2 min-w-0">
                    {top.map(lang => (
                        <div key={lang.name} className="flex items-center gap-2.5">
                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: lang.color }} />
                            <span className="min-w-0 flex-1 truncate text-[12px] text-gray-300">{lang.name}</span>
                            <span className="shrink-0 font-mono text-[11px] text-gray-500">{lang.files} files</span>
                            <span className="shrink-0 w-10 text-right font-mono text-[11px] text-gray-400">{lang.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* GitHub-style horizontal bar */}
            <LanguageBar languages={top} />
        </div>
    );
}
