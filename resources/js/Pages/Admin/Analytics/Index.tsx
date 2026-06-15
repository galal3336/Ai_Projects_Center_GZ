import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import ChartCard from '@/components/admin/ChartCard';
import StatCard from '@/components/admin/StatCard';
import PageHeader from '@/components/admin/PageHeader';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, Eye, FolderOpen, Globe, Smartphone, Monitor } from 'lucide-react';

const PERIODS = ['7d', '30d', '90d', '1y'] as const;
type Period = typeof PERIODS[number];

const trafficByDay = [
    { day: 'Mon', visits: 820, users: 480 },
    { day: 'Tue', visits: 1140, users: 620 },
    { day: 'Wed', visits: 980, users: 540 },
    { day: 'Thu', visits: 1320, users: 740 },
    { day: 'Fri', visits: 1050, users: 590 },
    { day: 'Sat', visits: 640, users: 310 },
    { day: 'Sun', visits: 510, users: 280 },
];

const categoryDist = [
    { name: 'AI/ML',         value: 48, color: '#3B82F6' },
    { name: 'Web',           value: 41, color: '#22C55E' },
    { name: 'Mobile',        value: 37, color: '#A855F7' },
    { name: 'IoT',           value: 29, color: '#F59E0B' },
    { name: 'Cybersecurity', value: 24, color: '#EF4444' },
    { name: 'Other',         value: 30, color: '#475569' },
];

const projectGrowth = [
    { month: 'Jan', projects: 12 },
    { month: 'Feb', projects: 19 },
    { month: 'Mar', projects: 28 },
    { month: 'Apr', projects: 41 },
    { month: 'May', projects: 58 },
    { month: 'Jun', projects: 74 },
];

const deviceData = [
    { device: 'Desktop', pct: 58, color: '#3B82F6' },
    { device: 'Mobile',  pct: 34, color: '#22C55E' },
    { device: 'Tablet',  pct: 8,  color: '#F59E0B' },
];

const topCountries = [
    { country: 'Saudi Arabia', visits: 18420, flag: '🇸🇦' },
    { country: 'UAE',          visits: 3210,  flag: '🇦🇪' },
    { country: 'Kuwait',       visits: 1890,  flag: '🇰🇼' },
    { country: 'Egypt',        visits: 1540,  flag: '🇪🇬' },
    { country: 'Jordan',       visits: 920,   flag: '🇯🇴' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
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
};

export default function AnalyticsIndex() {
    const [period, setPeriod] = useState<Period>('7d');

    return (
        <AdminLayout breadcrumbs={[{ label: 'Analytics' }]}>
            <div className="p-6 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <PageHeader title="Analytics" description="Platform traffic and engagement insights" />
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                        {PERIODS.map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`h-7 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                    period === p ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#475569] hover:text-[#94A3B8]'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Visits"    value="48,230" icon={Eye}       trend={22} trendLabel="vs prev period" color="blue"   index={0} />
                    <StatCard title="Unique Users"    value="12,841" icon={Users}     trend={18} trendLabel="vs prev period" color="green"  index={1} />
                    <StatCard title="Project Views"   value="31,940" icon={FolderOpen}trend={15} trendLabel="vs prev period" color="purple" index={2} />
                    <StatCard title="Avg. Session"    value="4m 12s" icon={TrendingUp}trend={6}  trendLabel="vs prev period" color="yellow" index={3} />
                </div>

                {/* Traffic + Category distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard title="Daily Traffic" description="Visits and unique users" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trafficByDay} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="visits" name="Visits" stroke="#3B82F6" strokeWidth={2} fill="url(#vGrad)" dot={false} />
                                <Area type="monotone" dataKey="users" name="Users" stroke="#22C55E" strokeWidth={2} fill="url(#uGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Projects by Category">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={categoryDist} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                                    {categoryDist.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                            {categoryDist.map(c => (
                                <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>

                {/* Project growth + Devices + Countries */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard title="Project Growth" description="Cumulative approved projects" className="lg:col-span-1">
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={projectGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="projects" name="Projects" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Devices">
                        <div className="space-y-4 mt-2">
                            {deviceData.map(d => (
                                <div key={d.device} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-[#94A3B8]">
                                            {d.device === 'Desktop' ? <Monitor className="w-3.5 h-3.5 text-[#475569]" /> :
                                             d.device === 'Mobile'  ? <Smartphone className="w-3.5 h-3.5 text-[#475569]" /> :
                                             <Globe className="w-3.5 h-3.5 text-[#475569]" />}
                                            {d.device}
                                        </div>
                                        <span className="tabular-nums font-semibold text-[#CBD5E1]">{d.pct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ChartCard>

                    <ChartCard title="Top Countries" description="By visit count">
                        <div className="space-y-3 mt-1">
                            {topCountries.map((c, i) => (
                                <div key={c.country} className="flex items-center gap-3">
                                    <span className="text-base">{c.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-[#94A3B8]">{c.country}</span>
                                            <span className="text-xs tabular-nums text-[#CBD5E1] font-medium">{c.visits.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-[#1E293B] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#3B82F6]"
                                                style={{ width: `${Math.round((c.visits / topCountries[0].visits) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>
            </div>
        </AdminLayout>
    );
}
