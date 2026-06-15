import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import AdminBadge from '@/components/admin/AdminBadge';
import PageHeader from '@/components/admin/PageHeader';
import { Plus, Trophy, Pencil, Trash2, Users } from 'lucide-react';

interface Competition {
    id: number;
    title: string;
    semester: string;
    status: 'upcoming' | 'active' | 'judging' | 'closed';
    projects: number;
    participants: number;
    deadline: string;
    prizes: string;
}

const MOCK: Competition[] = [
    { id: 1, title: 'Innovation Challenge 2026', semester: 'Spring 2026', status: 'active',   projects: 48, participants: 128, deadline: '2026-06-30', prizes: '3 prizes' },
    { id: 2, title: 'AI & ML Hackathon',         semester: 'Spring 2026', status: 'judging',  projects: 31, participants: 89,  deadline: '2026-06-10', prizes: '3 prizes' },
    { id: 3, title: 'Best Capstone Project',     semester: 'Fall 2025',   status: 'closed',   projects: 62, participants: 154, deadline: '2025-12-20', prizes: '5 prizes' },
    { id: 4, title: 'Web Dev Sprint',            semester: 'Spring 2026', status: 'upcoming', projects: 0,  participants: 0,   deadline: '2026-08-01', prizes: '2 prizes' },
    { id: 5, title: 'IoT Design Challenge',      semester: 'Fall 2025',   status: 'closed',   projects: 19, participants: 47,  deadline: '2025-11-15', prizes: '3 prizes' },
];

const STATUS_VARIANT = { upcoming: 'info', active: 'success', judging: 'warning', closed: 'neutral' } as const;

const columns: Column<Competition>[] = [
    {
        key: 'title', label: 'Competition', sortable: true,
        render: (_, row) => (
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{row.title}</p>
                    <p className="text-xs text-[#475569]">{row.semester}</p>
                </div>
            </div>
        ),
    },
    {
        key: 'status', label: 'Status', sortable: true,
        render: (v) => <AdminBadge variant={STATUS_VARIANT[v as keyof typeof STATUS_VARIANT]} dot>{String(v)}</AdminBadge>,
    },
    {
        key: 'projects', label: 'Projects', sortable: true,
        render: (v) => <span className="tabular-nums text-sm text-[#94A3B8]">{String(v)}</span>,
    },
    {
        key: 'participants', label: 'Participants', sortable: true,
        render: (v) => (
            <div className="flex items-center gap-1.5 text-sm text-[#94A3B8]">
                <Users className="w-3.5 h-3.5 text-[#334155]" />
                <span className="tabular-nums">{String(v)}</span>
            </div>
        ),
    },
    { key: 'deadline', label: 'Deadline', sortable: true, render: (v) => <span className="text-xs text-[#475569] tabular-nums">{String(v)}</span> },
    { key: 'prizes', label: 'Prizes', render: (v) => <AdminBadge variant="purple">{String(v)}</AdminBadge> },
];

export default function CompetitionsIndex() {
    return (
        <AdminLayout breadcrumbs={[{ label: 'Competitions' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Competitions"
                    description="Manage academic project competitions and challenges"
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> New Competition
                        </button>
                    }
                />
                <DataTable
                    columns={columns}
                    data={MOCK as unknown as Record<string, unknown>[]}
                    keyField="id"
                    searchPlaceholder="Search competitions..."
                    actions={() => (
                        <div className="flex items-center gap-1 justify-end">
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
