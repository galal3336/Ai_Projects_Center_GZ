import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SharedProps, StarToggleResponse } from '@/types';

interface Props {
    projectId: string;
    initialCount: number;
    initialStarred?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export default function StarButton({
    projectId,
    initialCount,
    initialStarred = false,
    size = 'md',
    showCount = true,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [starred, setStarred] = useState(initialStarred);
    const [count, setCount] = useState(initialCount);
    const [pending, setPending] = useState(false);
    const [burst, setBurst] = useState(false);

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
    const padding  = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-1.5';

    const toggle = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        if (pending) return;

        setPending(true);
        const next = !starred;

        // Optimistic
        setStarred(next);
        setCount(c => c + (next ? 1 : -1));
        if (next) setBurst(true);

        fetch(`/projects/${projectId}/star`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
            .then(r => r.json() as Promise<StarToggleResponse>)
            .then(data => {
                setStarred(data.starred);
                setCount(data.stars_count);
            })
            .catch(() => {
                // Rollback on failure
                setStarred(!next);
                setCount(c => c + (next ? -1 : 1));
            })
            .finally(() => {
                setPending(false);
                setTimeout(() => setBurst(false), 600);
            });
    };

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.88 }}
            className={`
                relative inline-flex items-center gap-1.5 rounded-full border font-medium
                transition-all duration-200 select-none cursor-pointer
                ${padding} ${textSize}
                ${starred
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-400'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-amber-300 hover:text-amber-600 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-amber-700 dark:hover:text-amber-400'
                }
                ${pending ? 'opacity-70' : ''}
            `}
            title={starred ? 'Unstar project' : 'Star project'}
            disabled={pending}
        >
            <AnimatePresence mode="wait">
                {burst && (
                    <motion.span
                        key="burst"
                        className="absolute inset-0 rounded-full bg-amber-400/20"
                        initial={{ scale: 0.6, opacity: 0.8 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </AnimatePresence>

            <motion.span
                animate={starred ? { rotate: [0, -20, 15, 0], scale: [1, 1.3, 0.9, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
                <Star
                    size={iconSize}
                    className={starred ? 'fill-amber-500 stroke-amber-500' : 'stroke-current'}
                />
            </motion.span>

            {showCount && (
                <span className="tabular-nums">{formatCount(count)}</span>
            )}
        </motion.button>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}
