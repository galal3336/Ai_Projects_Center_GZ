import React from 'react';
import { useLocale } from '@/hooks/useLocale';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { isRtl, locale } = useLocale();

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-muted/40 px-4"
            dir={isRtl ? 'rtl' : 'ltr'}
            lang={locale}
        >
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title ?? 'AIKFS'}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
