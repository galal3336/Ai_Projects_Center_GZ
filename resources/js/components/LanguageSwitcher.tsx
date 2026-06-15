import { router } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useI18n, localeSwitchUrl } from '@/i18n';

interface Props {
    /** Visual variant — 'minimal' for icon+code, 'full' for full label */
    variant?: 'minimal' | 'full';
    className?: string;
}

const LOCALES = [
    { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'Arabic',  nativeLabel: 'العربية', flag: '🇸🇦' },
] as const;

export default function LanguageSwitcher({ variant = 'minimal', className = '' }: Props) {
    const { locale, t } = useI18n();

    function switchLocale(code: string) {
        const csrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1] ?? '');
        const form = Object.assign(document.createElement('form'), { method: 'POST', action: localeSwitchUrl(code) });
        const token = Object.assign(document.createElement('input'), { type: 'hidden', name: '_token', value: csrf });
        form.appendChild(token);
        document.body.appendChild(form);
        form.submit();
    }

    const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0];
    const other   = LOCALES.find(l => l.code !== locale) ?? LOCALES[1];

    if (variant === 'minimal') {
        return (
            <button
                onClick={() => switchLocale(other.code)}
                title={t('common.language')}
                className={[
                    'flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5',
                    'px-3 py-1.5 text-[12px] font-semibold text-white/60',
                    'transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/90',
                    className,
                ].join(' ')}
                aria-label={`Switch to ${other.label}`}
            >
                <Globe className="h-3.5 w-3.5" />
                <span className="tracking-wide">{other.code.toUpperCase()}</span>
            </button>
        );
    }

    return (
        <div className={['relative group', className].join(' ')}>
            <button
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-medium text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/90"
                aria-haspopup="listbox"
                aria-label={t('common.language')}
            >
                <Globe className="h-4 w-4" />
                <span>{current.flag} {current.nativeLabel}</span>
            </button>

            <div
                role="listbox"
                aria-label={t('common.language')}
                className="absolute end-0 top-full z-50 mt-1.5 hidden min-w-[140px] overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl group-focus-within:block group-hover:block"
            >
                {LOCALES.map(l => (
                    <button
                        key={l.code}
                        role="option"
                        aria-selected={l.code === locale}
                        onClick={() => switchLocale(l.code)}
                        className={[
                            'flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors',
                            l.code === locale
                                ? 'bg-violet-600/20 font-semibold text-violet-300'
                                : 'text-white/55 hover:bg-white/5 hover:text-white/90',
                        ].join(' ')}
                    >
                        <span>{l.flag}</span>
                        <span>{l.nativeLabel}</span>
                        {l.code === locale && (
                            <span className="ms-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
