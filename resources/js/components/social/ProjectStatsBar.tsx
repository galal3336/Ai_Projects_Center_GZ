import { Eye, Download } from 'lucide-react';
import type { Project } from '@/types';
import StarButton from './StarButton';
import BookmarkButton from './BookmarkButton';
import FollowButton from './FollowButton';

interface Props {
    project: Project;
    size?: 'sm' | 'md' | 'lg';
    showFollow?: boolean;
}

export default function ProjectStatsBar({ project, size = 'md', showFollow = true }: Props) {
    const iconSize = size === 'sm' ? 12 : 14;
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <StarButton
                projectId={project.id}
                initialCount={project.stars_count ?? 0}
                initialStarred={project.is_starred}
                size={size}
            />

            <BookmarkButton
                projectId={project.id}
                initialCount={project.bookmarks_count ?? 0}
                initialBookmarked={project.is_bookmarked}
                size={size}
            />

            {showFollow && (
                <FollowButton
                    projectId={project.id}
                    initialCount={project.followers_count ?? 0}
                    initialFollowing={project.is_following}
                    size={size}
                />
            )}

            <span className={`inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 ${textSize}`}>
                <Eye size={iconSize} />
                <span className="tabular-nums">{formatCount(project.views_count ?? 0)}</span>
            </span>

            {(project.downloads_count ?? 0) > 0 && (
                <span className={`inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 ${textSize}`}>
                    <Download size={iconSize} />
                    <span className="tabular-nums">{formatCount(project.downloads_count ?? 0)}</span>
                </span>
            )}
        </div>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}
