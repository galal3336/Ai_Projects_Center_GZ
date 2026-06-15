import type { LanguageStat } from '@/types';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface LinesBarProps {
    languages: LanguageStat[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: LanguageStat }>; label?: string }) {
    if (!active || !payload?.length) return null;
    const lang = payload[0].payload;
    return (
        <div className="rounded-lg border border-white/[0.10] bg-[#0d1117]/95 px-3 py-2.5 text-xs backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="font-semibold text-white">{label}</span>
            </div>
            <p className="text-gray-400">{payload[0].value.toLocaleString()} lines</p>
        </div>
    );
}

export default function LinesBar({ languages }: LinesBarProps) {
    const data = languages
        .filter(l => l.lines > 0)
        .slice(0, 12)
        .sort((a, b) => b.lines - a.lines);

    if (!data.length) {
        return <p className="py-10 text-center text-sm text-gray-600">No line count data</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                    width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="lines" radius={[4, 4, 0, 0]}>
                    {data.map((lang) => (
                        <Cell key={lang.name} fill={lang.color} fillOpacity={0.85} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
