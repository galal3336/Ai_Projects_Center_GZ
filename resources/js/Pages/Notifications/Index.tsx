import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, CheckCheck, Trash2, Filter,
    AlertCircle, CheckCircle, Globe, Inbox,
    Megaphone, ArrowLeft, RefreshCw, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationCategory, Paginated, SharedProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    'check-circle': CheckCircle,
    'x-circle':     X,
    'alert-circle': AlertCircle,
    'globe':        Globe,
    'inbox':        Inbox,
    'megaphone':    Megaphone,
    'bell':         Bell,
};

function NotifIcon({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' }) {
    const Icon = ICON_MAP[name] ?? Bell;
    const dim  = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const icon = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
        <span
            className={cn('flex items-center justify-center rounded-full shrink-0', dim)}
            style={{ backgroundColor: color + '22', color }}
        >
            <Icon className={icon} />
        </span>
    );
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString();
}

// ─── Category filter tabs ─────────────────────────────────────────────────────

const CATEGORIES: { value: NotificationCategory | 'all'; label: string; label_ar: string }[] = [
    { value: 'all',         label: 'All',         label_ar: 'الكل' },
    { value: 'project',     label: 'Projects',    label_ar: 'المشاريع' },
    { value: 'review',      label: 'Reviews',     label_ar: 'المراجعات' },
    { value: 'system',      label: 'System',      label_ar: 'النظام' },
    { value: 'account',     label: 'Account',     label_ar: 'الحساب' },
    { value: 'award',       label: 'Awards',      label_ar: 'الجوائز' },
    { value: 'competition', label: 'Competitions',label_ar: 'المسابقات' },
    { value: 'member',      label: 'Members',     label_ar: 'الأعضاء' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    notifications: Paginated<AppNotification>;
    unread_count:  number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationsIndex({ notifications: initial, unread_count }: Props) {
    const { locale } = usePage<SharedProps>().props;
    const isRtl      = locale === 'ar';
    const base       = `/${locale}`;

    const [items, setItems]         = useState<AppNotification[]>(initial.data);
    const [unread, setUnread]       = useState(unread_count);
    const [filter, setFilter]       = useState<NotificationCategory | 'all'>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [marking, setMarking]     = useState<string | null>(null);
    const [deleting, setDeleting]   = useState<string | null>(null);

    const t = (en: string, ar: string) => locale === 'ar' ? ar : en;

    const displayed = items.filter(n => {
        if (filter !== 'all' && n.category !== filter) return false;
        if (showUnreadOnly && n.read_at) return false;
        return true;
    });

    const markRead = async (id: string) => {
        setMarking(id);
        setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnread(prev => Math.max(0, prev - 1));
        await window.axios.post(`${base}/notifications/${id}/read`);
        setMarking(null);
    };

    const markAllRead = async () => {
        setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setUnread(0);
        await window.axios.post(`${base}/notifications/read-all`);
    };

    const remove = async (id: string, wasUnread: boolean) => {
        setDeleting(id);
        setItems(prev => prev.filter(n => n.id !== id));
        if (wasUnread) setUnread(prev => Math.max(0, prev - 1));
        await window.axios.delete(`${base}/notifications/${id}`);
        setDeleting(null);
    };

    const clearAll = async () => {
        if (!confirm(t('Delete all notifications?', 'حذف جميع الإشعارات؟'))) return;
        setItems([]);
        setUnread(0);
        await window.axios.delete(`${base}/notifications`);
    };

    const navigate = (n: AppNotification) => {
        if (!n.read_at) markRead(n.id);
        if (n.action_url) router.visit(n.action_url);
    };

    const title = (n: AppNotification) => locale === 'ar' ? n.title_ar : n.title;
    const body  = (n: AppNotification) => locale === 'ar' ? (n.body_ar ?? n.body) : n.body;

    return (
        <AppLayout>
            <Head title={t('Notifications', 'الإشعارات')} />

            <div
                className="min-h-screen bg-[#020617] text-[#F8FAFC] pb-20"
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <div className="max-w-3xl mx-auto px-4 py-8">

                    {/* Page header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`${base}/dashboard`}
                                className="flex items-center justify-center w-8 h-8 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
                            >
                                <ArrowLeft className={cn('w-4 h-4', isRtl && 'rotate-180')} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-[#F8FAFC]">
                                    {t('Notifications', 'الإشعارات')}
                                </h1>
                                {unread > 0 && (
                                    <p className="text-xs text-[#475569] mt-0.5">
                                        {t(`${unread} unread`, `${unread} غير مقروء`)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-[#22C55E] hover:border-[#22C55E]/30 transition-all text-xs cursor-pointer"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    {t('Mark all read', 'تحديد الكل')}
                                </button>
                            )}
                            {items.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-[#ef4444] hover:border-[#ef4444]/30 transition-all text-xs cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {t('Clear all', 'حذف الكل')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setFilter(cat.value)}
                                className={cn(
                                    'shrink-0 h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer',
                                    filter === cat.value
                                        ? 'bg-[#22C55E] text-white'
                                        : 'bg-[#0F172A] border border-[#1E293B] text-[#475569] hover:text-[#94A3B8] hover:border-[#334155]'
                                )}
                            >
                                {locale === 'ar' ? cat.label_ar : cat.label}
                            </button>
                        ))}

                        <button
                            onClick={() => setShowUnreadOnly(p => !p)}
                            className={cn(
                                'shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ms-auto',
                                showUnreadOnly
                                    ? 'bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E]'
                                    : 'bg-[#0F172A] border border-[#1E293B] text-[#475569] hover:text-[#94A3B8]'
                            )}
                        >
                            <Filter className="w-3 h-3" />
                            {t('Unread only', 'غير مقروء فقط')}
                        </button>
                    </div>

                    {/* List */}
                    <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] overflow-hidden">
                        {displayed.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-20 text-[#334155]">
                                <Bell className="w-12 h-12" />
                                <div className="text-center">
                                    <p className="font-medium text-[#475569]">
                                        {t('No notifications', 'لا توجد إشعارات')}
                                    </p>
                                    <p className="text-sm mt-1">
                                        {t("You're all caught up!", 'أنت على اطلاع بكل شيء!')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {displayed.map((n, i) => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        transition={{ duration: 0.15, delay: i * 0.02 }}
                                        className={cn(
                                            'group relative flex items-start gap-4 px-5 py-4 border-b border-[#1E293B]/60 last:border-0',
                                            !n.read_at && 'bg-[#22C55E]/5',
                                            n.action_url && 'cursor-pointer hover:bg-[#1E293B]/40 transition-colors'
                                        )}
                                        onClick={() => n.action_url && navigate(n)}
                                    >
                                        {/* Unread indicator */}
                                        {!n.read_at && (
                                            <span className="absolute top-5 inset-s-2 w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                                        )}

                                        <NotifIcon name={n.icon} color={n.color} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    'text-sm leading-snug',
                                                    n.read_at ? 'text-[#94A3B8]' : 'text-[#F8FAFC] font-semibold'
                                                )}>
                                                    {title(n)}
                                                </p>
                                                <span className="text-[10px] text-[#334155] shrink-0 mt-0.5">
                                                    {timeAgo(n.created_at)}
                                                </span>
                                            </div>
                                            {body(n) && (
                                                <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                                                    {body(n)}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={cn(
                                                    'inline-flex items-center h-4 px-1.5 rounded text-[9px] font-semibold uppercase tracking-wide',
                                                    'bg-[#1E293B] text-[#475569]'
                                                )}>
                                                    {n.category}
                                                </span>
                                                {n.priority !== 'normal' && (
                                                    <span className={cn(
                                                        'inline-flex items-center h-4 px-1.5 rounded text-[9px] font-semibold uppercase tracking-wide',
                                                        n.priority === 'urgent' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                                                        n.priority === 'high'   ? 'bg-amber-500/15 text-amber-500' :
                                                        'bg-[#6366f1]/15 text-[#6366f1]'
                                                    )}>
                                                        {n.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className={cn(
                                            'flex flex-col gap-1 transition-opacity shrink-0',
                                            'opacity-0 group-hover:opacity-100'
                                        )}>
                                            {!n.read_at && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); markRead(n.id); }}
                                                    disabled={marking === n.id}
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E293B] text-[#475569] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors cursor-pointer"
                                                    title={t('Mark as read', 'تحديد كمقروء')}
                                                >
                                                    {marking === n.id
                                                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        : <Check className="w-3.5 h-3.5" />
                                                    }
                                                </button>
                                            )}
                                            <button
                                                onClick={e => { e.stopPropagation(); remove(n.id, !n.read_at); }}
                                                disabled={deleting === n.id}
                                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E293B] text-[#475569] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                                                title={t('Delete', 'حذف')}
                                            >
                                                {deleting === n.id
                                                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    : <Trash2 className="w-3.5 h-3.5" />
                                                }
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Pagination */}
                    {initial.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {initial.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        'flex items-center justify-center h-8 min-w-8 px-3 rounded-lg text-sm transition-colors',
                                        link.active
                                            ? 'bg-[#22C55E] text-white font-medium'
                                            : link.url
                                                ? 'bg-[#0F172A] border border-[#1E293B] text-[#475569] hover:text-[#F8FAFC] hover:border-[#334155]'
                                                : 'opacity-30 pointer-events-none bg-[#0F172A] border border-[#1E293B] text-[#475569]'
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
