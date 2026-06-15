import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import AdminBadge from '@/components/admin/AdminBadge';
import PageHeader from '@/components/admin/PageHeader';
import { Plus, UserCog, Ban, MoreHorizontal, Mail } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'student';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    department: string;
    projects: number;
    joined: string;
}

const MOCK_USERS: User[] = [
    { id: 1,  name: 'Ahmed Al-Rashidi',   email: 'ahmed@kfu.edu.sa',   role: 'student',     status: 'active',    department: 'Computer Science', projects: 3, joined: '2024-09-01' },
    { id: 2,  name: 'Sara Al-Otaibi',     email: 'sara@kfu.edu.sa',    role: 'student',     status: 'active',    department: 'Software Eng.',    projects: 2, joined: '2024-09-01' },
    { id: 3,  name: 'Dr. Omar Khaled',    email: 'omar@kfu.edu.sa',    role: 'admin',       status: 'active',    department: 'IT Department',    projects: 0, joined: '2023-01-15' },
    { id: 4,  name: 'Fatima Al-Zahraa',   email: 'fatima@kfu.edu.sa',  role: 'student',     status: 'active',    department: 'Computer Science', projects: 1, joined: '2025-02-10' },
    { id: 5,  name: 'System Admin',       email: 'admin@kfu.edu.sa',   role: 'super_admin', status: 'active',    department: 'Administration',   projects: 0, joined: '2022-06-01' },
    { id: 6,  name: 'Khalid Al-Shamrani', email: 'khalid@kfu.edu.sa',  role: 'student',     status: 'suspended', department: 'Cybersecurity',    projects: 1, joined: '2024-09-01' },
    { id: 7,  name: 'Ali Hassan',         email: 'ali@kfu.edu.sa',     role: 'student',     status: 'active',    department: 'AI & Data Science', projects: 2, joined: '2024-09-01' },
    { id: 8,  name: 'Noura Al-Dossari',   email: 'noura@kfu.edu.sa',   role: 'student',     status: 'pending',   department: 'Computer Science', projects: 0, joined: '2026-02-01' },
    { id: 9,  name: 'Ziad Hamdan',        email: 'ziad@kfu.edu.sa',    role: 'student',     status: 'active',    department: 'Robotics',         projects: 1, joined: '2024-09-01' },
    { id: 10, name: 'Dr. Layla Al-Farsi', email: 'layla@kfu.edu.sa',   role: 'admin',       status: 'inactive',  department: 'Computer Science', projects: 0, joined: '2023-08-20' },
];

const STATUS_VARIANT = {
    active:    'success',
    inactive:  'neutral',
    suspended: 'danger',
    pending:   'warning',
} as const;

const ROLE_VARIANT = {
    super_admin: 'purple',
    admin:       'info',
    student:     'neutral',
} as const;

const ROLE_LABELS = {
    super_admin: 'Super Admin',
    admin:       'Admin',
    student:     'Student',
} as const;

const ROLE_FILTERS = ['All', 'Students', 'Admins'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

export default function UsersIndex() {
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

    const filtered = roleFilter === 'All'
        ? MOCK_USERS
        : roleFilter === 'Students'
            ? MOCK_USERS.filter(u => u.role === 'student')
            : MOCK_USERS.filter(u => u.role === 'admin' || u.role === 'super_admin');

    const columns: Column<User>[] = [
        {
            key: 'name', label: 'User', sortable: true,
            render: (_, row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#334155] to-[#1E293B] border border-[#334155] flex items-center justify-center text-[10px] font-semibold text-[#94A3B8] shrink-0">
                        {row.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{row.name}</p>
                        <p className="text-xs text-[#475569]">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role', label: 'Role', sortable: true,
            render: (v) => <AdminBadge variant={ROLE_VARIANT[v as keyof typeof ROLE_VARIANT]}>{ROLE_LABELS[v as keyof typeof ROLE_LABELS]}</AdminBadge>,
        },
        {
            key: 'status', label: 'Status', sortable: true,
            render: (v) => <AdminBadge variant={STATUS_VARIANT[v as keyof typeof STATUS_VARIANT]} dot>{String(v)}</AdminBadge>,
        },
        { key: 'department', label: 'Department', sortable: true, render: (v) => <span className="text-xs text-[#94A3B8]">{String(v)}</span> },
        {
            key: 'projects', label: 'Projects', sortable: true,
            render: (v) => <span className="text-sm tabular-nums font-medium text-[#CBD5E1]">{String(v)}</span>,
        },
        { key: 'joined', label: 'Joined', sortable: true, render: (v) => <span className="text-xs text-[#475569] tabular-nums">{String(v)}</span> },
    ];

    return (
        <AdminLayout breadcrumbs={[{ label: 'Users' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Users"
                    description={`${MOCK_USERS.length} total · ${MOCK_USERS.filter(u => u.status === 'active').length} active`}
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Invite User
                        </button>
                    }
                />

                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-[#1E293B] w-fit">
                    {ROLE_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setRoleFilter(f)}
                            className={`h-7 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                roleFilter === f ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#475569] hover:text-[#94A3B8]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={filtered as unknown as Record<string, unknown>[]}
                    keyField="id"
                    searchPlaceholder="Search users, departments..."
                    actions={(row) => (
                        <div className="flex items-center gap-1 justify-end">
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors cursor-pointer" title="Email">
                                <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer" title="Edit role">
                                <UserCog className="w-3.5 h-3.5" />
                            </button>
                            <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer" title="Suspend">
                                <Ban className="w-3.5 h-3.5" />
                            </button>
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
