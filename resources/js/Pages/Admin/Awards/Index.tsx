import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import { motion } from 'framer-motion';
import { Plus, Award, Pencil, Trash2, Trophy, Medal } from 'lucide-react';

interface AwardItem {
    id: number;
    title: string;
    competition: string;
    recipient: string;
    project: string;
    rank: 1 | 2 | 3 | number;
    year: string;
}

const MOCK_AWARDS: AwardItem[] = [
    { id: 1, title: '1st Place — Innovation Challenge', competition: 'Innovation Challenge 2025', recipient: 'Omar Khaled',       project: 'Blockchain Voting System',  rank: 1, year: '2025' },
    { id: 2, title: '2nd Place — Innovation Challenge', competition: 'Innovation Challenge 2025', recipient: 'Ahmed Al-Rashidi', project: 'AI Resume Scanner',          rank: 2, year: '2025' },
    { id: 3, title: '3rd Place — Innovation Challenge', competition: 'Innovation Challenge 2025', recipient: 'Sara Al-Otaibi',   project: 'Smart Campus Navigator',     rank: 3, year: '2025' },
    { id: 4, title: '1st Place — AI Hackathon 2025',    competition: 'AI & ML Hackathon 2025',   recipient: 'Ali Hassan',        project: 'Facial Recognition System',  rank: 1, year: '2025' },
    { id: 5, title: 'Best Capstone — Fall 2025',        competition: 'Best Capstone Project',    recipient: 'Ziad Hamdan',       project: 'Drone Fleet Manager',        rank: 1, year: '2025' },
    { id: 6, title: '2nd Place — AI Hackathon 2025',    competition: 'AI & ML Hackathon 2025',   recipient: 'Khalid Al-Shamrani',project: 'Medical Diagnosis AI',       rank: 2, year: '2025' },
];

const RANK_ICON = {
    1: { icon: Trophy, color: '#F59E0B', label: '1st' },
    2: { icon: Medal,  color: '#94A3B8', label: '2nd' },
    3: { icon: Medal,  color: '#CD7C2F', label: '3rd' },
};

export default function AwardsIndex() {
    return (
        <AdminLayout breadcrumbs={[{ label: 'Awards' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Awards"
                    description={`${MOCK_AWARDS.length} awards issued across competitions`}
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Assign Award
                        </button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {MOCK_AWARDS.map((award, i) => {
                        const rank = RANK_ICON[award.rank as 1|2|3] ?? { icon: Award, color: '#475569', label: `#${award.rank}` };
                        const RankIcon = rank.icon;

                        return (
                            <motion.div
                                key={award.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col gap-3 p-4 rounded-xl border border-[#1E293B] bg-[#0F172A] hover:border-[#334155] transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className="flex items-center justify-center w-9 h-9 rounded-lg"
                                        style={{ backgroundColor: `${rank.color}18` }}
                                    >
                                        <RankIcon className="w-4.5 h-4.5" style={{ color: rank.color }} />
                                    </div>
                                    <span
                                        className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                                        style={{ color: rank.color, backgroundColor: `${rank.color}18` }}
                                    >
                                        {rank.label} Place
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-[#F8FAFC] leading-tight">{award.title}</h3>
                                    <p className="mt-1 text-xs text-[#475569]">{award.competition}</p>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-[#64748B]">
                                        <span className="text-[#334155]">Project:</span>
                                        <span className="text-[#94A3B8] font-medium truncate">{award.project}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#64748B]">
                                        <span className="text-[#334155]">Recipient:</span>
                                        <span className="text-[#94A3B8]">{award.recipient}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#64748B]">
                                        <span className="text-[#334155]">Year:</span>
                                        <span className="text-[#94A3B8] tabular-nums">{award.year}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 pt-2 border-t border-[#1E293B]">
                                    <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
