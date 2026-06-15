import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import AdminBadge from '@/components/admin/AdminBadge';
import PageHeader from '@/components/admin/PageHeader';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, Eye, Check, X, MoreHorizontal, FolderOpen } from 'lucide-react';

interface Project {
    id: number;
    title: string;
    student: string;
    category: string;
    technology: string;
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    submitted_at: string;
}

const MOCK_PROJECTS: Project[] = [
    { id: 1,  title: 'AI Resume Scanner',          student: 'Ahmed Al-Rashidi',   category: 'AI/ML',    technology: 'Python',   status: 'approved', views: 2841, submitted_at: '2026-06-10' },
    { id: 2,  title: 'Smart Campus Navigator',     student: 'Sara Al-Otaibi',     category: 'Mobile',   technology: 'Flutter',  status: 'approved', views: 2103, submitted_at: '2026-06-09' },
    { id: 3,  title: 'Blockchain Voting System',   student: 'Omar Khaled',        category: 'Web3',     technology: 'Solidity', status: 'approved', views: 1892, submitted_at: '2026-06-08' },
    { id: 4,  title: 'Smart Irrigation System',    student: 'Fatima Al-Zahraa',   category: 'IoT',      technology: 'Arduino',  status: 'pending',  views: 0,    submitted_at: '2026-06-15' },
    { id: 5,  title: 'Medical Diagnosis AI',       student: 'Khalid Al-Shamrani', category: 'AI/ML',    technology: 'Python',   status: 'approved', views: 1431, submitted_at: '2026-06-07' },
    { id: 6,  title: 'Duplicate Web Scraper',      student: 'Rayan Al-Dosari',    category: 'Web',      technology: 'Node.js',  status: 'rejected', views: 12,   submitted_at: '2026-06-14' },
    { id: 7,  title: 'Facial Recognition System',  student: 'Ali Hassan',         category: 'AI/ML',    technology: 'Python',   status: 'approved', views: 987,  submitted_at: '2026-06-06' },
    { id: 8,  title: 'E-Commerce Platform',        student: 'Noura Al-Dossari',   category: 'Web',      technology: 'React',    status: 'pending',  views: 0,    submitted_at: '2026-06-15' },
    { id: 9,  title: 'Drone Fleet Manager',        student: 'Ziad Hamdan',        category: 'IoT',      technology: 'Python',   status: 'approved', views: 654,  submitted_at: '2026-06-05' },
    { id: 10, title: 'AR Campus Tour',             student: 'Layla Al-Farsi',     category: 'AR/VR',    technology: 'Unity',    status: 'pending',  views: 0,    submitted_at: '2026-06-13' },
    { id: 11, title: 'Supply Chain Tracker',       student: 'Majed Al-Qahtani',   category: 'Web3',     technology: 'Solidity', status: 'approved', views: 432,  submitted_at: '2026-06-04' },
    { id: 12, title: 'Sign Language Translator',   student: 'Hind Al-Mutairi',    category: 'AI/ML',    technology: 'Python',   status: 'pending',  views: 0,    submitted_at: '2026-06-12' },
];

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type Filter = typeof FILTERS[number];

export default function ProjectsIndex() {
    const [filter, setFilter] = useState<Filter>('All');

    const filtered = filter === 'All'
        ? MOCK_PROJECTS
        : MOCK_PROJECTS.filter(p => p.status === filter.toLowerCase());

    const columns: Column<Project>[] = [
        {
            key: 'title', label: 'Project', sortable: true,
            render: (_, row) => (
                <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{row.title}</p>
                    <p className="text-xs text-[#475569]">{row.student}</p>
                </div>
            ),
        },
        { key: 'category', label: 'Category', sortable: true, render: (v) => <AdminBadge variant="info">{String(v)}</AdminBadge> },
        { key: 'technology', label: 'Tech', sortable: true, render: (v) => <span className="text-xs font-mono text-[#94A3B8]">{String(v)}</span> },
        {
            key: 'status', label: 'Status', sortable: true,
            render: (v) => <AdminBadge variant={STATUS_VARIANT[v as keyof typeof STATUS_VARIANT]} dot>{String(v)}</AdminBadge>,
        },
        {
            key: 'views', label: 'Views', sortable: true,
            render: (v) => <span className="text-sm tabular-nums text-[#94A3B8]">{Number(v).toLocaleString()}</span>,
        },
        { key: 'submitted_at', label: 'Submitted', sortable: true, render: (v) => <span className="text-xs text-[#475569] tabular-nums">{String(v)}</span> },
    ];

    return (
        <AdminLayout breadcrumbs={[{ label: 'Projects' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Projects"
                    description={`${MOCK_PROJECTS.length} total projects · ${MOCK_PROJECTS.filter(p => p.status === 'pending').length} awaiting review`}
                    actions={
                        <>
                            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC] transition-all cursor-pointer">
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                                <Plus className="w-3.5 h-3.5" /> Add Project
                            </button>
                        </>
                    }
                />

                {/* Status filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-[#1E293B] w-fit">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`h-7 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                filter === f
                                    ? 'bg-[#1E293B] text-[#F8FAFC]'
                                    : 'text-[#475569] hover:text-[#94A3B8]'
                            }`}
                        >
                            {f}
                            {f !== 'All' && (
                                <span className="ml-1.5 text-[10px] opacity-60">
                                    {MOCK_PROJECTS.filter(p => p.status === f.toLowerCase()).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={filtered as unknown as Record<string, unknown>[]}
                    keyField="id"
                    searchPlaceholder="Search projects, students..."
                    actions={(row) => (
                        <div className="flex items-center gap-1 justify-end">
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors cursor-pointer" title="View">
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                            {(row as unknown as Project).status === 'pending' && (
                                <>
                                    <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors cursor-pointer" title="Approve">
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer" title="Reject">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-colors cursor-pointer">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
