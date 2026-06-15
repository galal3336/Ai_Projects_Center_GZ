import { usePage } from '@inertiajs/react';
import type { SharedProps, Locale } from '@/types';

export function useLocale() {
    const { locale } = usePage<SharedProps>().props;

    const isRtl = locale === 'ar';

    const switchLocale = (newLocale: Locale) => {
        const csrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1] ?? '');
        const form = Object.assign(document.createElement('form'), { method: 'POST', action: route('locale.switch', { locale: newLocale }) });
        const token = Object.assign(document.createElement('input'), { type: 'hidden', name: '_token', value: csrf });
        form.appendChild(token);
        document.body.appendChild(form);
        form.submit();
    };

    return { locale, isRtl, switchLocale };
}
