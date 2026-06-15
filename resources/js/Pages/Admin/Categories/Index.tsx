import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag, FolderOpen } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    projects: number;
    color: string;
    description: string;
    active: boolean;
}

const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: 'AI / Machine Learning', slug: 'ai-ml',        projects: 48, color: '#3B82F6', description: 'Artificial intelligence and ML projects',  active: true },
    { id: 2, name: 'Web Development',       slug: 'web',          projects: 41, color: '#22C55E', description: 'Frontend, backend and full-stack web apps',  active: true },
    { id: 3, name: 'Mobile Apps',           slug: 'mobile',       projects: 37, color: '#A855F7', description: 'iOS, Android and cross-platform apps',       active: true },
    { id: 4, name: 'IoT',                   slug: 'iot',          projects: 29, color: '#F59E0B', description: 'Internet of Things and embedded systems',     active: true },
    { id: 5, name: 'Cybersecurity',         slug: 'cybersecurity',projects: 24, color: '#EF4444', description: 'Security, penetration testing, defense',     active: true },
    { id: 6, name: 'Blockchain / Web3',     slug: 'web3',         projects: 19, color: '#06B6D4', description: 'Decentralized apps, smart contracts',        active: true },
    { id: 7, name: 'AR / VR',              slug: 'ar-vr',        projects: 11, color: '#EC4899', description: 'Augmented and virtual reality experiences',   active: false },
    { id: 8, name: 'Data Science',          slug: 'data-science', projects: 33, color: '#8B5CF6', description: 'Data analysis, visualization, BI',           active: true },
];

export default function CategoriesIndex() {
    const [categories, setCategories] = useState(MOCK_CATEGORIES);

    const toggleActive = (id: number) => {
        setCategories(cats => cats.map(c => c.id === id ? { ...c, active: !c.active } : c));
    };

    return (
        <AdminLayout breadcrumbs={[{ label: 'Categories' }]}>
            <div className="p-6 space-y-5 max-w-[1600px]">
                <PageHeader
                    title="Categories"
                    description={`${categories.length} categories · ${categories.filter(c => c.active).length} active`}
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> New Category
                        </button>
                    }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative flex flex-col gap-3 p-4 rounded-xl border border-[#1E293B] bg-[#0F172A] hover:border-[#334155] transition-colors"
                        >
                            {/* Color dot + icon */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: `${cat.color}18` }}>
                                    <Tag className="w-4 h-4" style={{ color: cat.color }} />
                                </div>
                                <AdminBadge variant={cat.active ? 'success' : 'neutral'} dot>
                                    {cat.active ? 'Active' : 'Hidden'}
                                </AdminBadge>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-[#F8FAFC]">{cat.name}</h3>
                                <p className="mt-0.5 text-xs text-[#475569] line-clamp-2">{cat.description}</p>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span className="tabular-nums font-medium text-[#94A3B8]">{cat.projects}</span>
                                <span>projects</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 pt-1 border-t border-[#1E293B]">
                                <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => toggleActive(cat.id)}
                                    className="flex-1 h-7 px-2 rounded-md text-[10px] font-medium text-[#475569] hover:bg-[#1E293B] hover:text-[#94A3B8] transition-colors cursor-pointer"
                                >
                                    {cat.active ? 'Hide' : 'Show'}
                                </button>
                                <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add new card */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categories.length * 0.04 }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[#1E293B] bg-transparent hover:border-[#334155] hover:bg-[#0F172A]/40 transition-all min-h-[160px] cursor-pointer group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-[#1E293B] flex items-center justify-center group-hover:bg-[#334155] transition-colors">
                            <Plus className="w-4 h-4 text-[#475569] group-hover:text-[#94A3B8]" />
                        </div>
                        <span className="text-xs text-[#334155] group-hover:text-[#475569] transition-colors">Add Category</span>
                    </motion.button>
                </div>
            </div>
        </AdminLayout>
    );
}
