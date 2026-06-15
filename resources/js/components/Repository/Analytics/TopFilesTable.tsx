import { cn } from '@/lib/utils';
import type { TopFile } from '@/types';
import { FileCode } from 'lucide-react';

const LANG_COLORS: Record<string, string> = {
    TypeScript:  '#3178C6',
    JavaScript:  '#F1E05A',
    Python:      '#3572A5',
    PHP:         '#4F5D95',
    Ruby:        '#701516',
    Java:        '#B07219',
    Go:          '#00ADD8',
    Rust:        '#DEA584',
    'C++':       '#F34B7D',
    'C#':        '#178600',
    HTML:        '#E34C26',
    CSS:         '#563D7C',
    SCSS:        '#C6538C',
    Vue:         '#41B883',
    Svelte:      '#FF3E00',
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface TopFilesTableProps {
    files: TopFile[];
    onSelect?: (path: string) => void;
}

export default function TopFilesTable({ files, onSelect }: TopFilesTableProps) {
    if (!files.length) {
        return <p className="py-10 text-center text-sm text-gray-600">No file data</p>;
    }

    const maxLines = files[0]?.lines ?? 1;

    return (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
            <table className="w-full text-[12px]">
                <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-500">File</th>
                        <th className="px-4 py-2.5 text-right font-medium text-gray-500">Lines</th>
                        <th className="px-4 py-2.5 text-right font-medium text-gray-500 hidden sm:table-cell">Size</th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-500 hidden md:table-cell">Language</th>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-500 hidden lg:table-cell">Bar</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, i) => {
                        const barPct = Math.max(2, (file.lines / maxLines) * 100);
                        const color  = LANG_COLORS[file.language] ?? '#6B7280';
                        return (
                            <tr
                                key={file.path}
                                onClick={() => onSelect?.(file.path)}
                                className={cn(
                                    'border-b border-white/[0.04] transition-colors duration-150',
                                    onSelect ? 'cursor-pointer hover:bg-white/[0.03]' : '',
                                    i % 2 === 0 ? '' : 'bg-white/[0.01]',
                                )}
                            >
                                <td className="px-4 py-2.5 font-mono text-gray-600">{i + 1}</td>
                                <td className="px-4 py-2.5 max-w-[200px]">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <FileCode size={12} className="shrink-0 text-gray-600" />
                                        <span className="truncate font-mono text-gray-300" title={file.path}>
                                            {file.path.split('/').pop()}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 truncate font-mono text-[10px] text-gray-700 pl-4" title={file.path}>
                                        {file.path}
                                    </p>
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-gray-300">
                                    {file.lines.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-gray-500 hidden sm:table-cell">
                                    {formatBytes(file.bytes)}
                                </td>
                                <td className="px-4 py-2.5 hidden md:table-cell">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-gray-400">{file.language}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 hidden lg:table-cell w-28">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${barPct}%`, backgroundColor: color }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
