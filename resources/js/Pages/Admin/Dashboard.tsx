import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import ChartCard from '@/components/admin/ChartCard';
import AdminBadge from '@/components/admin/AdminBadge';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    FolderOpen, Clock, CheckCircle, XCircle, Users,
    Code2, Eye, TrendingUp, ArrowRight, Activity,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

// ── Mock data ──────────────────────────────────────────────────────────────────

const trafficData = [
    { month: 'Jan', visits: 3200, users: 1800 },
    { month: 'Feb', visits: 4100, users: 2200 },
    { month: 'Mar', visits: 3800, users: 2100 },
    { month: 'Apr', visits: 5200, users: 3100 },
    { month: 'May', visits: 4700, users: 2900 },
    { month: 'Jun', visits: 6100, users: 3800 },
];

const projectsOverTime = [
    { week: 'W1', pending: 8, approved: 12, rejected: 2 },
    { week: 'W2', pending: 11, approved: 15, rejected: 3 },
    { week: 'W3', pending: 7, approved: 18, rejected: 1 },
    { week: 'W4', pending: 14, approved: 22, rejected: 4 },
    { week: 'W5', pending: 9, approved: 25, rejected: 2 },
    { week: 'W6', pending: 12, approved: 30, rejected: 5 },
];

const techData = [
    { name: 'React', count: 48, color: '#3B82F6' },
    { name: 'Laravel', count: 41, color: '#EF4444' },
    { name: 'Python', count: 37, color: '#F59E0B' },
    { name: 'Vue.js', count: 29, color: '#22C55E' },
    { name: 'Flutter', count: 24, color: '#A855F7' },
    { name: 'Node.js', count: 19, color: '#06B6D4' },
];

const mostViewedProjects = [
    { title: 'AI Resume Scanner', views: 2841, student: 'Ahmed Al-Rashidi', category: 'AI/ML' },
    { title: 'Smart Campus Navigator', views: 2103, student: 'Sara Al-Otaibi', category: 'Mobile' },
    { title: 'Blockchain Voting System', views: 1892, student: 'Omar Khaled', category: 'Web3' },
    { title: 'Drone Fleet Manager', views: 1654, student: 'Noura Al-Dossari', category: 'IoT' },
    { title: 'Medical Diagnosis AI', views: 1431, student: 'Khalid Al-Shamrani', category: 'AI/ML' },
];

const recentActivity = [
    { action: 'Project submitted', detail: 'Smart Irrigation System by Fatima Al-Zahraa', time: '2 min ago', type: 'submit' },
    { action: 'Project approved', detail: 'Facial Recognition Attendance by Ali Hassan', time: '14 min ago', type: 'approve' },
    { action: 'New user registered', detail: 'Mohammed Al-Ghamdi joined as student', time: '31 min ago', type: 'user' },
    { action: 'Project rejected', detail: 'Duplicate submission detected: Web Scraper', time: '1 hr ago', type: 'reject' },
    { action: 'Award assigned', detail: 'Best AI Project awarded to Omar Khaled', time: '2 hr ago', type: 'award' },
];

const ACTIVITY_COLORS: Record<string, string> = {
    submit:  'bg-[#3B82F6]/10 text-[#3B82F6]',
    approve: 'bg-[#22C55E]/10 text-[#22C55E]',
    user:    'bg-[#A855F7]/10 text-[#A855F7]',
    reject:  'bg-[#EF4444]/10 text-[#EF4444]',
    award:   'bg-[#F59E0B]/10 text-[#F59E0B]',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 shadow-xl">
            <p className="text-[11px] font-medium text-[#475569] mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="text-xs" style={{ color: p.color }}>
                    {p.name}: <span className="font-semibold tabular-nums">{p.value.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
};

export default function AdminDashboard() {
    return (
        <AdminLayout title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]}>
            <div className="p-6 space-y-6 max-w-[1600px]">

                {/* Page title row */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#F8FAFC] tracking-tight">Dashboard</h1>
                        <p className="mt-0.5 text-sm text-[#475569]">Platform overview — June 2026</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                            Live
                        </span>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Projects" value={284} icon={FolderOpen} trend={12} trendLabel="vs last month" color="blue" index={0} />
                    <StatCard title="Pending Review" value={12} icon={Clock} trend={-3} trendLabel="vs last week" color="yellow" description="Awaiting approval" index={1} />
                    <StatCard title="Approved" value={249} icon={CheckCircle} trend={8} trendLabel="vs last month" color="green" index={2} />
                    <StatCard title="Rejected" value={23} icon={XCircle} trend={2} trendLabel="vs last month" color="red" index={3} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Active Students" value={1_432} icon={Users} trend={15} trendLabel="vs last month" color="purple" index={4} />
                    <StatCard title="Total Views" value="48.2K" icon={Eye} trend={22} trendLabel="vs last month" color="blue" index={5} />
                    <StatCard title="Growth Rate" value="18.4%" icon={TrendingUp} trend={4} trendLabel="vs last quarter" color="green" index={6} />
                </div>

                {/* Traffic chart + Project status chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard
                        title="Traffic Statistics"
                        description="Monthly visits and unique users"
                        className="lg:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={trafficData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="visits" name="Visits" stroke="#3B82F6" strokeWidth={2} fill="url(#visitsGrad)" dot={false} />
                                <Area type="monotone" dataKey="users" name="Users" stroke="#22C55E" strokeWidth={2} fill="url(#usersGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Most Used Technologies */}
                    <ChartCard title="Most Used Technologies" description="By project count">
                        <div className="space-y-2.5">
                            {techData.map((tech, i) => {
                                const max = techData[0].count;
                                const pct = Math.round((tech.count / max) * 100);
                                return (
                                    <motion.div
                                        key={tech.name}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-16 text-xs text-[#64748B] truncate">{tech.name}</span>
                                        <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.06 + 0.2 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: tech.color }}
                                            />
                                        </div>
                                        <span className="w-8 text-right text-xs font-medium tabular-nums text-[#94A3B8]">{tech.count}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ChartCard>
                </div>

                {/* Project submissions over time + Most viewed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard
                        title="Project Submissions"
                        description="Weekly breakdown by status"
                        className="lg:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={projectsOverTime} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={8} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="approved" name="Approved" fill="#22C55E" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Most Viewed Projects */}
                    <ChartCard
                        title="Most Viewed Projects"
                        actions={
                            <Link href="/admin/projects" className="text-xs text-[#475569] hover:text-[#94A3B8] flex items-center gap-1 transition-colors cursor-pointer">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        }
                    >
                        <div className="space-y-3">
                            {mostViewedProjects.map((p, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <span className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#334155] w-4 shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[#CBD5E1] truncate">{p.title}</p>
                                        <p className="text-[11px] text-[#334155] truncate">{p.student}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-semibold tabular-nums text-[#94A3B8]">{p.views.toLocaleString()}</p>
                                        <AdminBadge variant="neutral" className="text-[9px]">{p.category}</AdminBadge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>

                {/* Recent activity */}
                <ChartCard
                    title="Recent Activity"
                    description="Latest platform events"
                    actions={
                        <Link href="/admin/logs" className="text-xs text-[#475569] hover:text-[#94A3B8] flex items-center gap-1 transition-colors cursor-pointer">
                            View logs <ArrowRight className="w-3 h-3" />
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {recentActivity.map((event, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-start gap-3"
                            >
                                <div className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 ${ACTIVITY_COLORS[event.type]}`}>
                                    <Activity className="w-3 h-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#CBD5E1]">{event.action}</p>
                                    <p className="text-[11px] text-[#475569] truncate">{event.detail}</p>
                                </div>
                                <span className="text-[11px] text-[#334155] shrink-0 tabular-nums">{event.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </ChartCard>

            </div>
        </AdminLayout>
    );
}
