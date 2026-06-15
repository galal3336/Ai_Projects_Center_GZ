import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SharedProps, FollowToggleResponse } from '@/types';

interface Props {
    projectId: string;
    initialCount: number;
    initialFollowing?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export default function FollowButton({
    projectId,
    initialCount,
    initialFollowing = false,
    size = 'md',
    showCount = true,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [following, setFollowing] = useState(initialFollowing);
    const [count, setCount] = useState(initialCount);
    const [pending, setPending] = useState(false);

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
        const next = !following;
        setFollowing(next);
        setCount(c => c + (next ? 1 : -1));

        fetch(`/projects/${projectId}/follow`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
            .then(r => r.json() as Promise<FollowToggleResponse>)
            .then(data => {
                setFollowing(data.following);
                setCount(data.followers_count);
            })
            .catch(() => {
                setFollowing(!next);
                setCount(c => c + (next ? -1 : 1));
            })
            .finally(() => setPending(false));
    };

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.88 }}
            className={`
                inline-flex items-center gap-1.5 rounded-full border font-medium
                transition-all duration-200 select-none cursor-pointer
                ${padding} ${textSize}
                ${following
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-400'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300 hover:text-emerald-600 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-emerald-700 dark:hover:text-emerald-400'
                }
                ${pending ? 'opacity-70' : ''}
            `}
            title={following ? 'Unfollow project' : 'Follow project'}
            disabled={pending}
        >
            {following ? <BellOff size={iconSize} /> : <Bell size={iconSize} />}
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
