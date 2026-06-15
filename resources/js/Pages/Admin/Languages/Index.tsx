import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import PageHeader from '@/components/admin/PageHeader';
import AdminBadge from '@/components/admin/AdminBadge';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
    id: number;
    code: string;
    name: string;
    nativeName: string;
    rtl: boolean;
    active: boolean;
    default: boolean;
    coverage: number;
}

const MOCK_LANGS: Language[] = [
    { id: 1, code: 'en', name: 'English',  nativeName: 'English',  rtl: false, active: true,  default: true,  coverage: 100 },
    { id: 2, code: 'ar', name: 'Arabic',   nativeName: 'العربية',  rtl: true,  active: true,  default: false, coverage: 94  },
    { id: 3, code: 'fr', name: 'French',   nativeName: 'Français', rtl: false, active: false, default: false, coverage: 42  },
];

export default function LanguagesIndex() {
    const [langs, setLangs] = useState(MOCK_LANGS);

    const toggleActive = (id: number) =>
        setLangs(ls => ls.map(l => l.id === id && !l.default ? { ...l, active: !l.active } : l));

    return (
        <AdminLayout breadcrumbs={[{ label: 'Languages' }]}>
            <div className="p-6 space-y-5 max-w-3xl">
                <PageHeader
                    title="Languages"
                    description="Manage interface localization and translations"
                    actions={
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#22C55E] text-xs text-white font-medium hover:bg-[#16A34A] transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Add Language
                        </button>
                    }
                />

                <div className="space-y-3">
                    {langs.map((lang, i) => (
                        <motion.div
                            key={lang.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-4 p-4 rounded-xl border border-[#1E293B] bg-[#0F172A] hover:border-[#334155] transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 text-lg font-bold text-[#94A3B8]">
                                {lang.code.toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-[#F8FAFC]">{lang.name}</p>
                                    <span className="text-xs text-[#475569]" dir={lang.rtl ? 'rtl' : 'ltr'}>{lang.nativeName}</span>
                                    {lang.default && <AdminBadge variant="success">Default</AdminBadge>}
                                    {lang.rtl && <AdminBadge variant="info">RTL</AdminBadge>}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', lang.coverage === 100 ? 'bg-[#22C55E]' : lang.coverage > 50 ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]')}
                                            style={{ width: `${lang.coverage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs tabular-nums text-[#475569]">{lang.coverage}% translated</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <AdminBadge variant={lang.active ? 'success' : 'neutral'} dot>
                                    {lang.active ? 'Active' : 'Disabled'}
                                </AdminBadge>
                                <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {!lang.default && (
                                    <>
                                        <button
                                            onClick={() => toggleActive(lang.id)}
                                            className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors cursor-pointer"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
                    <h3 className="text-sm font-medium text-[#F8FAFC] mb-3">Translation Editor</h3>
                    <p className="text-xs text-[#475569] mb-4">Edit translation strings for the selected language.</p>
                    <div className="space-y-2">
                        {[
                            { key: 'nav.dashboard', en: 'Dashboard', ar: 'لوحة التحكم' },
                            { key: 'nav.projects',  en: 'Projects',  ar: 'المشاريع' },
                            { key: 'nav.users',     en: 'Users',     ar: 'المستخدمون' },
                            { key: 'btn.submit',    en: 'Submit',    ar: 'إرسال' },
                        ].map(t => (
                            <div key={t.key} className="grid grid-cols-[160px_1fr_1fr] gap-2 items-center">
                                <code className="text-[11px] text-[#475569] font-mono bg-[#1A2235] px-2 py-1 rounded">{t.key}</code>
                                <input defaultValue={t.en} className="h-7 px-2 rounded-md bg-[#020617] border border-[#1E293B] text-xs text-[#94A3B8] outline-none focus:border-[#334155] transition-colors" />
                                <input defaultValue={t.ar} dir="rtl" className="h-7 px-2 rounded-md bg-[#020617] border border-[#1E293B] text-xs text-[#94A3B8] outline-none focus:border-[#334155] transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
