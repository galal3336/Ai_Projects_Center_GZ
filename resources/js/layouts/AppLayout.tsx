import React from 'react';
import { useLocale } from '@/hooks/useLocale';
import type { SharedProps } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
    const { isRtl, locale } = useLocale();

    return (
        <div
            className="min-h-screen bg-background font-sans antialiased"
            dir={isRtl ? 'rtl' : 'ltr'}
            lang={locale}
        >
            {children}
        </div>
    );
}
