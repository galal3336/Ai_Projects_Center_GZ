import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FolderOpen, Users, Tag, Trophy, Award,
    Home, CreditCard, Languages, Settings, BarChart3, ScrollText,
    ChevronLeft, ChevronRight, Bell, Search, Menu, X,
    LogOut, User, ChevronDown, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: number;
    superAdminOnly?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
            { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
            { label: 'Logs', icon: ScrollText, href: '/admin/logs' },
        ],
    },
    {
        title: 'Content',
        items: [
            { label: 'Projects', icon: FolderOpen, href: '/admin/projects', badge: 12 },
            { label: 'Categories', icon: Tag, href: '/admin/categories' },
            { label: 'Competitions', icon: Trophy, href: '/admin/competitions' },
            { label: 'Awards', icon: Award, href: '/admin/awards' },
        ],
    },
    {
        title: 'People',
        items: [
            { label: 'Users', icon: Users, href: '/admin/users' },
        ],
    },
    {
        title: 'System',
        items: [
            { label: 'Homepage Builder', icon: Home, href: '/admin/homepage-builder', superAdminOnly: true },
            { label: 'Credits', icon: CreditCard, href: '/admin/credits' },
            { label: 'Languages', icon: Languages, href: '/admin/languages' },
            { label: 'Settings', icon: Settings, href: '/admin/settings' },
        ],
    },
];

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
    const { auth } = usePage<SharedProps>().props;
    const user = auth.user;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const currentPath = window.location.pathname;

    // Keyboard shortcut: [ to toggle sidebar
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === '[' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCollapsed(c => !c);
            }
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen(s => !s);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const isActive = (href: string) =>
        href === '/admin' ? currentPath === href : currentPath.startsWith(href);

    return (
        <div className="flex h-screen bg-[#020617] text-[#F8FAFC] overflow-hidden">

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 64 : 240 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1E293B] bg-[#0F172A] overflow-hidden',
                    'lg:relative lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex h-14 items-center justify-between px-3 border-b border-[#1E293B] shrink-0">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shrink-0">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm tracking-tight text-[#F8FAFC]">AiKFS Admin</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {collapsed && (
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center mx-auto">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors duration-150 cursor-pointer"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 mx-auto mt-2 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors duration-150 cursor-pointer"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.title}>
                            <AnimatePresence mode="wait">
                                {!collapsed && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.1 }}
                                        className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#334155]"
                                    >
                                        {group.title}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <ul className="space-y-0.5">
                                {group.items.filter(item =>
                                    !item.superAdminOnly || user?.role === 'super_admin'
                                ).map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-all duration-150 cursor-pointer group relative',
                                                    active
                                                        ? 'bg-[#1E293B] text-[#F8FAFC] font-medium'
                                                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2235]'
                                                )}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                {active && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#22C55E] rounded-r-full" />
                                                )}
                                                <item.icon className={cn(
                                                    'shrink-0',
                                                    collapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4',
                                                    active ? 'text-[#22C55E]' : 'text-[#475569] group-hover:text-[#94A3B8]'
                                                )} />
                                                <AnimatePresence mode="wait">
                                                    {!collapsed && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -4 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.1 }}
                                                            className="flex-1 truncate"
                                                        >
                                                            {item.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                                {!collapsed && item.badge && (
                                                    <span className="ml-auto shrink-0 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-semibold">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User profile at bottom */}
                <div className="shrink-0 border-t border-[#1E293B] p-2">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={cn(
                            'w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[#1E293B] transition-colors duration-150 cursor-pointer',
                            collapsed && 'justify-center'
                        )}
                    >
                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#334155] to-[#1E293B] border border-[#334155] flex items-center justify-center shrink-0 text-[10px] font-semibold text-[#94A3B8]">
                            {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                        </div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 text-left min-w-0"
                                >
                                    <p className="text-xs font-medium text-[#F8FAFC] truncate">{user?.name ?? 'Admin'}</p>
                                    <p className="text-[10px] text-[#475569] truncate">{user?.email ?? ''}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Top header */}
                <header className="h-14 flex items-center gap-3 px-4 border-b border-[#1E293B] bg-[#020617]/80 backdrop-blur-md shrink-0 z-30">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
                    >
                        <Menu className="w-4 h-4" />
                    </button>

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
                        <Link href="/admin" className="text-[#475569] hover:text-[#94A3B8] transition-colors shrink-0">
                            Admin
                        </Link>
                        {breadcrumbs?.map((crumb, i) => (
                            <React.Fragment key={i}>
                                <span className="text-[#1E293B]">/</span>
                                {crumb.href ? (
                                    <Link href={crumb.href} className="text-[#475569] hover:text-[#94A3B8] transition-colors truncate">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-[#F8FAFC] font-medium truncate">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                        {title && !breadcrumbs && (
                            <>
                                <span className="text-[#1E293B]">/</span>
                                <span className="text-[#F8FAFC] font-medium truncate">{title}</span>
                            </>
                        )}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md bg-[#0F172A] border border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#94A3B8] transition-all duration-150 text-xs cursor-pointer"
                        >
                            <Search className="w-3 h-3" />
                            <span>Search</span>
                            <kbd className="ml-2 text-[10px] bg-[#1E293B] px-1 rounded">⌘K</kbd>
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-md text-[#475569] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors relative cursor-pointer">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto" id="main-content">
                    {children}
                </main>
            </div>

            {/* Search modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-4 h-12 border-b border-[#1E293B]">
                                <Search className="w-4 h-4 text-[#475569] shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search pages, users, projects..."
                                    className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none"
                                />
                                <button onClick={() => setSearchOpen(false)} className="text-[#475569] hover:text-[#94A3B8] cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2">
                                {NAV_GROUPS.flatMap(g => g.items).map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSearchOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
                                    >
                                        <item.icon className="w-4 h-4 text-[#475569]" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-[#1E293B] flex items-center gap-4 text-[10px] text-[#334155]">
                                <span><kbd className="bg-[#1E293B] px-1 rounded">↑↓</kbd> navigate</span>
                                <span><kbd className="bg-[#1E293B] px-1 rounded">↵</kbd> open</span>
                                <span><kbd className="bg-[#1E293B] px-1 rounded">esc</kbd> close</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
