import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { SharedProps } from '@/types';

type FlashHandler = (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;

export function useFlash(handler: FlashHandler) {
    const { flash } = usePage<SharedProps>().props;

    useEffect(() => {
        if (flash.success) handler(flash.success, 'success');
        if (flash.error)   handler(flash.error, 'error');
        if (flash.warning) handler(flash.warning, 'warning');
        if (flash.info)    handler(flash.info, 'info');
    }, [flash]);
}
