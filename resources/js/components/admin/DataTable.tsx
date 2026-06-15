import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    className?: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField?: keyof T;
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    actions?: (row: T) => React.ReactNode;
    emptyMessage?: string;
    loading?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

export default function DataTable<T extends Record<string, unknown>>({
    columns, data, keyField, searchable = true, searchPlaceholder = 'Search…',
    pageSize = 10, actions, emptyMessage = 'No records found.', loading = false,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);

    const filtered = React.useMemo(() => {
        let rows = [...data];
        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter(row =>
                columns.some(col => {
                    const val = row[col.key as keyof T];
                    return String(val ?? '').toLowerCase().includes(q);
                })
            );
        }
        if (sortKey && sortDir) {
            rows.sort((a, b) => {
                const av = String(a[sortKey as keyof T] ?? '');
                const bv = String(b[sortKey as keyof T] ?? '');
                const cmp = av.localeCompare(bv, undefined, { numeric: true });
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return rows;
    }, [data, search, sortKey, sortDir, columns]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    const toggleSort = (key: string) => {
        if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
        else if (sortDir === 'asc') setSortDir('desc');
        else { setSortKey(null); setSortDir(null); }
        setPage(1);
    };

    const SortIcon = ({ col }: { col: Column<T> }) => {
        if (!col.sortable) return null;
        if (sortKey !== col.key) return <ChevronsUpDown className="w-3 h-3 text-[#334155]" />;
        if (sortDir === 'asc') return <ChevronUp className="w-3 h-3 text-[#22C55E]" />;
        return <ChevronDown className="w-3 h-3 text-[#22C55E]" />;
    };

    return (
        <div className="flex flex-col gap-3">
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#334155]" />
                    <input
                        type="search"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder={searchPlaceholder}
                        className="w-full max-w-sm h-8 pl-8 pr-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#334155] outline-none focus:border-[#334155] transition-colors"
                    />
                </div>
            )}

            <div className="rounded-xl border border-[#1E293B] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#1E293B] bg-[#0F172A]">
                                {columns.map(col => (
                                    <th
                                        key={String(col.key)}
                                        className={cn(
                                            'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]',
                                            col.sortable && 'cursor-pointer select-none hover:text-[#94A3B8] transition-colors',
                                            col.className
                                        )}
                                        onClick={() => col.sortable && toggleSort(String(col.key))}
                                    >
                                        <span className="flex items-center gap-1">
                                            {col.label}
                                            <SortIcon col={col} />
                                        </span>
                                    </th>
                                ))}
                                {actions && <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-[#0F172A] bg-[#020617]">
                                            {columns.map((col, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-3.5 rounded bg-[#1E293B] animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                                                </td>
                                            ))}
                                            {actions && <td className="px-4 py-3"><div className="h-3.5 rounded bg-[#1E293B] animate-pulse w-16 ml-auto" /></td>}
                                        </tr>
                                    ))
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-[#334155]">
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    paged.map((row, i) => (
                                        <motion.tr
                                            key={keyField ? String(row[keyField]) : i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.15, delay: i * 0.02 }}
                                            className="border-b border-[#0F172A] bg-[#020617] hover:bg-[#0F172A]/60 transition-colors"
                                        >
                                            {columns.map(col => (
                                                <td key={String(col.key)} className={cn('px-4 py-3 text-[#94A3B8]', col.className)}>
                                                    {col.render
                                                        ? col.render(row[col.key as keyof T], row)
                                                        : <span className="text-[#CBD5E1]">{String(row[col.key as keyof T] ?? '—')}</span>
                                                    }
                                                </td>
                                            ))}
                                            {actions && (
                                                <td className="px-4 py-3 text-right">
                                                    {actions(row)}
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filtered.length > pageSize && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E293B] bg-[#0F172A]">
                        <p className="text-xs text-[#475569]">
                            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            'flex items-center justify-center w-7 h-7 rounded-md text-xs transition-colors cursor-pointer',
                                            p === page
                                                ? 'bg-[#1E293B] text-[#F8FAFC] font-medium'
                                                : 'text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1A2235]'
                                        )}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
