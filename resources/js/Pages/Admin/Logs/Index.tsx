import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Download, Filter, ChevronDown } from 'lucide-react';

interface LogEntry {
    id: number;
    level: 'info' | 'warning' | 'error' | 'debug';
    event: string;
    detail: string;
    user: string;
    ip: string;
    timestamp: string;
}

const MOCK_LOGS: LogEntry[] = [
    { id: 1,  level: 'info',    event: 'project.submitted',    detail: 'Project "Smart Irrigation" submitted for review',       user: 'fatima@kfu.edu.sa',  ip: '10.0.1.42',   timestamp: '2026-06-15 14:32:11' },
    { id: 2,  level: 'info',    event: 'project.approved',     detail: 'Project "AI Resume Scanner" approved by admin',          user: 'admin@kfu.edu.sa',   ip: '10.0.0.5',    timestamp: '2026-06-15 14:18:05' },
    { id: 3,  level: 'warning', event: 'login.failed',         detail: 'Failed login attempt (3rd attempt) for user',            user: 'unknown',            ip: '185.12.44.9',  timestamp: '2026-06-15 13:59:48' },
    { id: 4,  level: 'info',    event: 'user.registered',      detail: 'New student registered: Mohammed Al-Ghamdi',             user: 'system',             ip: '10.0.1.80',   timestamp: '2026-06-15 13:41:22' },
    { id: 5,  level: 'error',   event: 'repository.failed',    detail: 'Repository analysis failed — file too large (>50MB)',    user: 'rayan@kfu.edu.sa',   ip: '10.0.1.91',   timestamp: '2026-06-15 13:28:54' },
    { id: 6,  level: 'info',    event: 'award.assigned',       detail: 'Best AI Project award assigned to Omar Khaled',          user: 'admin@kfu.edu.sa',   ip: '10.0.0.5',    timestamp: '2026-06-15 12:55:30' },
    { id: 7,  level: 'debug',   event: 'cache.flush',          detail: 'Redis cache flushed — homepage builder preview updated', user: 'system',             ip: '127.0.0.1',   timestamp: '2026-06-15 12:30:00' },
    { id: 8,  level: 'warning', event: 'project.duplicate',    detail: 'Duplicate detection triggered for "Web Scraper" submission', user: 'system',          ip: '127.0.0.1',   timestamp: '2026-06-15 12:10:19' },
    { id: 9,  level: 'info',    event: 'project.rejected',     detail: 'Project "Duplicate Web Scraper" rejected — duplicate',   user: 'admin@kfu.edu.sa',   ip: '10.0.0.5',    timestamp: '2026-06-15 12:05:43' },
    { id: 10, level: 'error',   event: 'mail.failed',          detail: 'Email delivery failed: SMTP connection timed out',       user: 'system',             ip: '127.0.0.1',   timestamp: '2026-06-15 11:48:02' },
    { id: 11, level: 'info',    event: 'settings.updated',     detail: 'Platform settings updated: registration closed',         user: 'admin@kfu.edu.sa',   ip: '10.0.0.5',    timestamp: '2026-06-15 11:30:55' },
    { id: 12, level: 'info',    event: 'competition.created',  detail: 'New competition "IoT Design Challenge 2026" created',    user: 'admin@kfu.edu.sa',   ip: '10.0.0.5',    timestamp: '2026-06-15 11:00:00' },
];

const LEVEL_VARIANT = {
    info:    'info',
    warning: 'warning',
    error:   'danger',
    debug:   'neutral',
} as const;

const LEVEL_FILTERS = ['All', 'Info', 'Warning', 'Error', 'Debug'] as const;
type LevelFilter = typeof LEVEL_FILTERS[number];

export default function LogsIndex() {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');

    const filtered = MOCK_LOGS.filter(log => {
        const matchLevel = levelFilter === 'All' || log.level === levelFilter.toLowerCase();
        const matchSearch = !search ||
            log.event.includes(search.toLowerCase()) ||
            log.detail.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase());
        return matchLevel && matchSearch;
    });

    return (
        <AdminLayout breadcrumbs={[{ label: 'Logs' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="System Logs"
                    description="Audit trail and platform event log"
                    actions={
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#334155] transition-all cursor-pointer">
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#334155] transition-all cursor-pointer">
                                <RefreshCw className="w-3.5 h-3.5" /> Refresh
                            </button>
                        </div>
                    }
                />

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#334155]" />
                        <input
                            type="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search events, users..."
                            className="h-8 pl-8 pr-3 w-56 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                        {LEVEL_FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setLevelFilter(f)}
                                className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                    levelFilter === f ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#475569] hover:text-[#94A3B8]'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-[#334155]">{filtered.length} entries</span>
                </div>

                {/* Log table */}
                <div className="rounded-xl border border-[#1E293B] overflow-hidden font-mono text-xs">
                    <div className="grid grid-cols-[80px_140px_160px_1fr_160px_100px] bg-[#0F172A] border-b border-[#1E293B] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
                        <span>Level</span>
                        <span>Event</span>
                        <span>Timestamp</span>
                        <span>Detail</span>
                        <span>User</span>
                        <span>IP</span>
                    </div>
                    <div className="divide-y divide-[#0F172A]">
                        {filtered.map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="grid grid-cols-[80px_140px_160px_1fr_160px_100px] px-4 py-3 bg-[#020617] hover:bg-[#0F172A]/50 transition-colors items-start gap-2"
                            >
                                <span><AdminBadge variant={LEVEL_VARIANT[log.level]}>{log.level}</AdminBadge></span>
                                <span className="text-[#64748B] truncate pt-0.5">{log.event}</span>
                                <span className="text-[#334155] tabular-nums pt-0.5">{log.timestamp}</span>
                                <span className="text-[#94A3B8] leading-relaxed">{log.detail}</span>
                                <span className="text-[#475569] truncate pt-0.5">{log.user}</span>
                                <span className="text-[#334155] tabular-nums pt-0.5">{log.ip}</span>
                            </motion.div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-4 py-12 text-center text-sm text-[#334155] bg-[#020617]">
                                No log entries match your filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
