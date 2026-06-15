import { usePage, router } from '@inertiajs/react';
import type { SharedProps, Locale } from '@/types';

export function useLocale() {
    const { locale } = usePage<SharedProps>().props;

    const isRtl = locale === 'ar';

    const switchLocale = (newLocale: Locale) => {
        router.get(route('locale.switch', { locale: newLocale }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return { locale, isRtl, switchLocale };
}
