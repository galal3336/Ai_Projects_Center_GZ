import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    Eye, Users, Link2, Globe, Monitor,
    Chrome, ArrowLeft, TrendingUp,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import StatCard from '@/components/admin/StatCard';
import ChartCard from '@/components/admin/ChartCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectSummary {
    id: string;
    title: string;
    slug: string;
    status: string;
    views_count: number;
    stars_count: number;
    bookmarks_count: number;
    followers_count: number;
}

interface ViewsDay {
    date: string;
    views: number;
    unique_visitors: number;
}

interface ReferrerRow {
    referrer: string;
    visits: number;
}

interface CountryRow {
    country: string;
    visits: number;
}

interface BrowserRow {
    browser: string;
    visits: number;
}

interface Summary {
    total_views: number;
    unique_visitors: number;
    views_trend: number;
}

interface Props {
    project: ProjectSummary;
    period: string;
    summary: Summary;
    views_timeline: ViewsDay[];
    referrers: ReferrerRow[];
    countries: CountryRow[];
    browsers: BrowserRow[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODS = ['7d', '30d', '90d', '1y'] as const;

const BROWSER_COLORS: Record<string, string> = {
    Chrome: '#4285F4',
    Firefox: '#FF7139',
    Safari: '#0FB5EE',
    Edge: '#0078D4',
    Opera: '#FF1B2D',
    Other: '#475569',
};

const COUNTRY_NAMES: Record<string, string> = {
    SA: 'Saudi Arabia', AE: 'UAE', KW: 'Kuwait', EG: 'Egypt', JO: 'Jordan',
    US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
    IN: 'India', PK: 'Pakistan', TR: 'Turkey', MA: 'Morocco', DZ: 'Algeria',
};

const COUNTRY_FLAGS: Record<string, string> = {
    SA: '🇸🇦', AE: '🇦🇪', KW: '🇰🇼', EG: '🇪🇬', JO: '🇯🇴',
    US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
    IN: '🇮🇳', PK: '🇵🇰', TR: '🇹🇷', MA: '🇲🇦', DZ: '🇩🇿',
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 shadow-xl">
            <p className="text-[11px] font-medium text-[#475569] mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="text-xs" style={{ color: p.color ?? p.fill }}>
                    {p.name}: <span className="font-semibold tabular-nums">{p.value?.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectAnalytics({
    project, period, summary, views_timeline, referrers, countries, browsers,
}: Props) {
    const [activePeriod, setActivePeriod] = useState(period);

    function switchPeriod(p: string) {
        setActivePeriod(p);
        router.get(
            `/student/projects/${project.id}/analytics`,
            { period: p },
            { preserveScroll: true, replace: true },
        );
    }

    const topCountry = countries[0]?.visits ?? 1;
    const topBrowser = browsers[0]?.visits ?? 1;
    const totalBrowserVisits = browsers.reduce((s, b) => s + b.visits, 0) || 1;

    return (
        <AppLayout>
            <Head title={`Analytics — ${project.title}`} />

            <div className="min-h-screen bg-[#020817] text-[#F8FAFC]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <a
                                href={`/student/projects/${project.id}`}
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#64748B] hover:text-[#F8FAFC] transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </a>
                            <div>
                                <h1 className="text-lg font-semibold text-[#F8FAFC] leading-tight">
                                    {project.title}
                                </h1>
                                <p className="text-xs text-[#475569] mt-0.5">Project Analytics</p>
                            </div>
                        </div>

                        {/* Period picker */}
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-[#1E293B] self-start sm:self-auto">
                            {PERIODS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => switchPeriod(p)}
                                    className={`h-7 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                        activePeriod === p
                                            ? 'bg-[#1E293B] text-[#F8FAFC]'
                                            : 'text-[#475569] hover:text-[#94A3B8]'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── KPI row ────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Views"
                            value={summary.total_views}
                            icon={Eye}
                            trend={summary.views_trend}
                            trendLabel="vs prev period"
                            color="blue"
                            index={0}
                        />
                        <StatCard
                            title="Unique Visitors"
                            value={summary.unique_visitors}
                            icon={Users}
                            color="green"
                            index={1}
                        />
                        <StatCard
                            title="All-time Views"
                            value={project.views_count}
                            icon={TrendingUp}
                            color="purple"
                            index={2}
                        />
                        <StatCard
                            title="Stars"
                            value={project.stars_count}
                            icon={TrendingUp}
                            color="yellow"
                            index={3}
                        />
                    </div>

                    {/* ── Views timeline ──────────────────────────────────── */}
                    <ChartCard
                        title="Views Over Time"
                        description="Daily views and unique visitors"
                    >
                        {views_timeline.length === 0 ? (
                            <EmptyState label="No view data for this period" />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={views_timeline} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#475569' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={d => d.slice(5)}
                                    />
                                    <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        name="Views"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fill="url(#vGrad)"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="unique_visitors"
                                        name="Unique Visitors"
                                        stroke="#22C55E"
                                        strokeWidth={2}
                                        fill="url(#uGrad)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* ── Referrers + Countries ───────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Referrers */}
                        <ChartCard title="Top Referrers" description="Where your visitors come from">
                            {referrers.length === 0 ? (
                                <EmptyState label="No referrer data yet" />
                            ) : (
                                <div className="space-y-3 mt-1">
                                    {referrers.map((r, i) => (
                                        <ReferrerRow
                                            key={r.referrer}
                                            label={r.referrer}
                                            visits={r.visits}
                                            max={referrers[0].visits}
                                            rank={i + 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </ChartCard>

                        {/* Countries */}
                        <ChartCard title="Countries" description="Visitor geographic distribution">
                            {countries.length === 0 ? (
                                <EmptyState label="No country data yet" />
                            ) : (
                                <div className="space-y-3 mt-1">
                                    {countries.map(c => (
                                        <div key={c.country} className="flex items-center gap-3">
                                            <span className="text-base w-6 text-center">
                                                {COUNTRY_FLAGS[c.country] ?? '🌐'}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-[#94A3B8]">
                                                        {COUNTRY_NAMES[c.country] ?? c.country}
                                                    </span>
                                                    <span className="text-xs tabular-nums text-[#CBD5E1] font-medium">
                                                        {c.visits.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-1 rounded-full bg-[#1E293B] overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#3B82F6] transition-all duration-500"
                                                        style={{ width: `${Math.round((c.visits / topCountry) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    {/* ── Browsers ────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Donut */}
                        <ChartCard title="Browsers" description="Browser share">
                            {browsers.length === 0 ? (
                                <EmptyState label="No browser data yet" />
                            ) : (
                                <div className="flex items-center gap-6">
                                    <ResponsiveContainer width={160} height={160}>
                                        <PieChart>
                                            <Pie
                                                data={browsers}
                                                dataKey="visits"
                                                nameKey="browser"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={72}
                                                paddingAngle={2}
                                            >
                                                {browsers.map(b => (
                                                    <Cell
                                                        key={b.browser}
                                                        fill={BROWSER_COLORS[b.browser] ?? '#475569'}
                                                        strokeWidth={0}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 flex-1">
                                        {browsers.map(b => (
                                            <div key={b.browser} className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                                                    <span
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: BROWSER_COLORS[b.browser] ?? '#475569' }}
                                                    />
                                                    {b.browser}
                                                </div>
                                                <span className="text-xs tabular-nums text-[#CBD5E1] font-medium">
                                                    {Math.round((b.visits / totalBrowserVisits) * 100)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ChartCard>

                        {/* Bar breakdown */}
                        <ChartCard title="Browser Visits" description="Absolute visit counts by browser">
                            {browsers.length === 0 ? (
                                <EmptyState label="No browser data yet" />
                            ) : (
                                <div className="space-y-3 mt-1">
                                    {browsers.map(b => (
                                        <div key={b.browser} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-[#94A3B8]">
                                                    <Chrome className="w-3.5 h-3.5 text-[#475569]" />
                                                    {b.browser}
                                                </div>
                                                <span className="tabular-nums font-semibold text-[#CBD5E1]">
                                                    {b.visits.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.round((b.visits / topBrowser) * 100)}%`,
                                                        backgroundColor: BROWSER_COLORS[b.browser] ?? '#475569',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ChartCard>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center h-24 text-xs text-[#475569]">
            {label}
        </div>
    );
}

function ReferrerRow({ label, visits, max, rank }: { label: string; visits: number; max: number; rank: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-[#475569] w-4 text-right">{rank}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#94A3B8] truncate max-w-[180px]">{label}</span>
                    <span className="text-xs tabular-nums text-[#CBD5E1] font-medium shrink-0 ml-2">
                        {visits.toLocaleString()}
                    </span>
                </div>
                <div className="h-1 rounded-full bg-[#1E293B] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[#A855F7] transition-all duration-500"
                        style={{ width: `${Math.round((visits / max) * 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
