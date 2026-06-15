import React, { createContext, useContext, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NestedRecord = { [key: string]: string | NestedRecord };

interface I18nContextValue {
    locale: string;
    dir: 'ltr' | 'rtl';
    isRtl: boolean;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    tExists: (key: string) => boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const { locale, direction, translations } = usePage<{
        locale: string;
        direction: 'ltr' | 'rtl';
        translations: { ui: NestedRecord; messages: NestedRecord; auth: NestedRecord };
    }>().props as any;

    const value = useMemo<I18nContextValue>(() => {
        const dir = (direction ?? (locale === 'ar' ? 'rtl' : 'ltr')) as 'ltr' | 'rtl';

        function resolve(obj: NestedRecord, parts: string[]): string | NestedRecord | undefined {
            const [head, ...rest] = parts;
            const child = obj[head];
            if (child === undefined) return undefined;
            if (rest.length === 0) return child;
            if (typeof child === 'object') return resolve(child as NestedRecord, rest);
            return undefined;
        }

        function t(key: string, replacements?: Record<string, string | number>): string {
            // key format: "section.nested.leaf"  (searches translations.ui first, then messages, auth)
            const parts = key.split('.');
            const bags: NestedRecord[] = [
                translations?.ui ?? {},
                translations?.messages ?? {},
                translations?.auth ?? {},
            ];

            let result: string | undefined;
            for (const bag of bags) {
                const found = resolve(bag, parts);
                if (typeof found === 'string') {
                    result = found;
                    break;
                }
            }

            if (result === undefined) return key; // fallback: return the key itself

            if (replacements) {
                Object.entries(replacements).forEach(([ph, val]) => {
                    result = result!.replace(new RegExp(`:${ph}`, 'g'), String(val));
                });
            }

            return result;
        }

        function tExists(key: string): boolean {
            return t(key) !== key;
        }

        return { locale: locale ?? 'en', dir, isRtl: dir === 'rtl', t, tExists };
    }, [locale, direction, translations]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
    return ctx;
}

// ─── Convenience re-export of locale switcher URL helper ─────────────────────

export function localeSwitchUrl(locale: string): string {
    return `/locale/${locale}`;
}
