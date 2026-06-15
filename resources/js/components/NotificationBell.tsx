import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, CheckCheck, Trash2, X,
    AlertCircle, CheckCircle, Globe, Inbox,
    Megaphone, RefreshCw, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification, SharedProps } from '@/types';

// ─── Icon map (lucide icon name → component) ─────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    'check-circle':  CheckCircle,
    'x-circle':      X,
    'alert-circle':  AlertCircle,
    'globe':         Globe,
    'inbox':         Inbox,
    'megaphone':     Megaphone,
    'bell':          Bell,
};

function NotifIcon({ name, color }: { name: string; color: string }) {
    const Icon = ICON_MAP[name] ?? Bell;
    return (
        <span
            className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            style={{ backgroundColor: color + '22', color }}
        >
            <Icon className="w-4 h-4" />
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
    return `${Math.floor(h / 24)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationBell({ locale }: { locale: 'en' | 'ar' }) {
    const { notifications: notifShared, auth } = usePage<SharedProps>().props;
    const base = `/${locale}`;
    const [open, setOpen]                 = useState(false);
    const [items, setItems]               = useState<AppNotification[]>([]);
    const [unread, setUnread]             = useState(notifShared?.unread_count ?? 0);
    const [loading, setLoading]           = useState(false);
    const [markingAll, setMarkingAll]     = useState(false);
    const panelRef                        = useRef<HTMLDivElement>(null);

    const isRtl = locale === 'ar';

    // ── Fetch from API ───────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!auth.user) return;
        setLoading(true);
        try {
            const res  = await window.axios.get(`${base}/notifications/fetch`);
            setItems(res.data.notifications);
            setUnread(res.data.unread_count);
        } finally {
            setLoading(false);
        }
    }, [auth.user, base]);

    // ── Open → load ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // ── Realtime via Echo ────────────────────────────────────────────────────
    useEffect(() => {
        if (!auth.user || typeof window.Echo === 'undefined') return;

        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);

        channel.listen('.notification.sent', (e: { notification: AppNotification; unread_count: number }) => {
            setUnread(e.unread_count);
            setItems(prev => [e.notification, ...prev]);
        });

        return () => {
            window.Echo.leave(`App.Models.User.${auth.user!.id}`);
        };
    }, [auth.user]);

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // ── Mark single read ─────────────────────────────────────────────────────
    const markRead = async (id: string) => {
        setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnread(prev => Math.max(0, prev - 1));
        await window.axios.post(`${base}/notifications/${id}/read`);
    };

    // ── Mark all read ────────────────────────────────────────────────────────
    const markAllRead = async () => {
        setMarkingAll(true);
        setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setUnread(0);
        await window.axios.post(`${base}/notifications/read-all`);
        setMarkingAll(false);
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const remove = async (id: string, wasUnread: boolean) => {
        setItems(prev => prev.filter(n => n.id !== id));
        if (wasUnread) setUnread(prev => Math.max(0, prev - 1));
        await window.axios.delete(`${base}/notifications/${id}`);
    };

    // ── Navigate to notification ──────────────────────────────────────────────
    const navigate = (n: AppNotification) => {
        if (!n.read_at) markRead(n.id);
        setOpen(false);
        if (n.action_url) router.visit(n.action_url);
    };

    const title = (n: AppNotification) => locale === 'ar' ? n.title_ar : n.title;
    const body  = (n: AppNotification) => locale === 'ar' ? (n.body_ar ?? n.body) : n.body;

    if (!auth.user) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'relative flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer',
                    open
                        ? 'bg-[#1E293B] text-[#F8FAFC]'
                        : 'text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                )}
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4" />
                <AnimatePresence>
                    {unread > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#22C55E] text-white text-[9px] font-bold leading-none"
                        >
                            {unread > 99 ? '99+' : unread}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute top-10 z-50 w-90 rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl overflow-hidden',
                            isRtl ? 'left-0' : 'right-0'
                        )}
                        dir={isRtl ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-[#22C55E]" />
                                <span className="text-sm font-semibold text-[#F8FAFC]">
                                    {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                                </span>
                                {unread > 0 && (
                                    <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold">
                                        {unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {loading && <RefreshCw className="w-3 h-3 text-[#475569] animate-spin" />}
                                {unread > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        disabled={markingAll}
                                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#1E293B] transition-colors cursor-pointer"
                                        title={locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                                    >
                                        <CheckCheck className="w-3 h-3" />
                                        {locale === 'ar' ? 'قراءة الكل' : 'All read'}
                                    </button>
                                )}
                                <Link
                                    href={`${base}/notifications`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center w-7 h-7 rounded-md text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
                                    title={locale === 'ar' ? 'عرض الكل' : 'View all'}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-105 overflow-y-auto divide-y divide-[#1E293B]/60">
                            {items.length === 0 && !loading && (
                                <div className="flex flex-col items-center gap-3 py-12 text-[#334155]">
                                    <Bell className="w-8 h-8" />
                                    <p className="text-sm">
                                        {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
                                    </p>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {items.map(n => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={cn(
                                            'group relative flex items-start gap-3 px-4 py-3 hover:bg-[#1E293B]/50 transition-colors cursor-pointer',
                                            !n.read_at && 'bg-[#22C55E]/5'
                                        )}
                                        onClick={() => navigate(n)}
                                    >
                                        {/* Unread dot */}
                                        {!n.read_at && (
                                            <span className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                        )}

                                        <NotifIcon name={n.icon} color={n.color} />

                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm leading-snug truncate',
                                                n.read_at ? 'text-[#94A3B8]' : 'text-[#F8FAFC] font-medium'
                                            )}>
                                                {title(n)}
                                            </p>
                                            {body(n) && (
                                                <p className="mt-0.5 text-xs text-[#475569] line-clamp-2">
                                                    {body(n)}
                                                </p>
                                            )}
                                            <p className="mt-1 text-[10px] text-[#334155]">
                                                {timeAgo(n.created_at)}
                                            </p>
                                        </div>

                                        {/* Actions (hover) */}
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            {!n.read_at && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); markRead(n.id); }}
                                                    className="flex items-center justify-center w-6 h-6 rounded-md text-[#475569] hover:text-[#22C55E] hover:bg-[#1E293B] transition-colors cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={e => { e.stopPropagation(); remove(n.id, !n.read_at); }}
                                                className="flex items-center justify-center w-6 h-6 rounded-md text-[#475569] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-[#1E293B]">
                                <Link
                                    href={`${base}/notifications`}
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-xs text-[#475569] hover:text-[#22C55E] transition-colors py-1"
                                >
                                    {locale === 'ar' ? 'عرض جميع الإشعارات ←' : 'View all notifications →'}
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
