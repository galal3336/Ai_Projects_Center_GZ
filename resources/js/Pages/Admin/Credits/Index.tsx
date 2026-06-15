import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import StatCard from '@/components/admin/StatCard';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Plus, CreditCard, TrendingUp, Users, Coins, MoreHorizontal } from 'lucide-react';

interface CreditTransaction {
    id: number;
    user: string;
    type: 'earned' | 'redeemed' | 'granted' | 'deducted';
    amount: number;
    reason: string;
    balance: number;
    date: string;
}

const MOCK_TX: CreditTransaction[] = [
    { id: 1,  user: 'Ahmed Al-Rashidi',   type: 'earned',   amount: 50,  reason: 'Project approved',       balance: 150, date: '2026-06-15' },
    { id: 2,  user: 'Sara Al-Otaibi',     type: 'granted',  amount: 100, reason: 'Competition winner',     balance: 220, date: '2026-06-14' },
    { id: 3,  user: 'Omar Khaled',        type: 'redeemed', amount: -30, reason: 'Profile badge unlocked', balance: 190, date: '2026-06-13' },
    { id: 4,  user: 'Fatima Al-Zahraa',   type: 'earned',   amount: 10,  reason: 'Profile completed',      balance: 60,  date: '2026-06-12' },
    { id: 5,  user: 'Ali Hassan',         type: 'earned',   amount: 50,  reason: 'Project approved',       balance: 100, date: '2026-06-11' },
    { id: 6,  user: 'Khalid Al-Shamrani', type: 'deducted', amount: -20, reason: 'Policy violation',       balance: 30,  date: '2026-06-10' },
    { id: 7,  user: 'Ziad Hamdan',        type: 'earned',   amount: 25,  reason: 'First project',          balance: 75,  date: '2026-06-09' },
    { id: 8,  user: 'Noura Al-Dossari',   type: 'granted',  amount: 50,  reason: 'Admin bonus',            balance: 50,  date: '2026-06-08' },
];

const TYPE_VARIANT = { earned: 'success', granted: 'info', redeemed: 'warning', deducted: 'danger' } as const;

const columns: Column<CreditTransaction>[] = [
    {
        key: 'user', label: 'User', sortable: true,
        render: (v) => <span className="text-sm font-medium text-[#CBD5E1]">{String(v)}</span>,
    },
    {
        key: 'type', label: 'Type', sortable: true,
        render: (v) => <AdminBadge variant={TYPE_VARIANT[v as keyof typeof TYPE_VARIANT]}>{String(v)}</AdminBadge>,
    },
    {
        key: 'amount', label: 'Amount', sortable: true,
        render: (v) => {
            const n = Number(v);
            return (
                <span className={`text-sm font-semibold tabular-nums ${n > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {n > 0 ? '+' : ''}{n}
                </span>
            );
        },
    },
    { key: 'reason',  label: 'Reason',  render: (v) => <span className="text-xs text-[#94A3B8]">{String(v)}</span> },
    {
        key: 'balance', label: 'Balance', sortable: true,
        render: (v) => <span className="text-sm tabular-nums font-medium text-[#CBD5E1]">{String(v)} cr</span>,
    },
    { key: 'date', label: 'Date', sortable: true, render: (v) => <span className="text-xs text-[#475569] tabular-nums">{String(v)}</span> },
];

export default function CreditsIndex() {
    return (
        <AdminLayout breadcrumbs={[{ label: 'Credits' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Credits Management"
                    description="Manage student credit points and rewards"
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Grant Credits
                        </button>
                    }
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Issued"    value="14,280" icon={Coins}       trend={18} trendLabel="vs last month" color="green"  index={0} />
                    <StatCard title="Redeemed"        value="3,940"  icon={CreditCard}  trend={12} trendLabel="vs last month" color="yellow" index={1} />
                    <StatCard title="Active Earners"  value="892"    icon={Users}       trend={9}  trendLabel="vs last month" color="blue"   index={2} />
                    <StatCard title="Avg. per User"   value="16.0"   icon={TrendingUp}  trend={5}  trendLabel="vs last month" color="purple" index={3} />
                </div>

                <DataTable
                    columns={columns}
                    data={MOCK_TX as unknown as Record<string, unknown>[]}
                    keyField="id"
                    searchPlaceholder="Search users, reasons..."
                    actions={() => (
                        <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-colors cursor-pointer">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
