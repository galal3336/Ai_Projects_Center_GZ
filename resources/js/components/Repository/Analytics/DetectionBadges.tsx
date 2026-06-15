import type { FrameworkDetection, LibraryDetection } from '@/types';
import { BookOpen, Box, Layers } from 'lucide-react';

const LANG_COLORS: Record<string, string> = {
    PHP:         '#4F5D95',
    JavaScript:  '#F1E05A',
    TypeScript:  '#3178C6',
    Python:      '#3572A5',
    Ruby:        '#701516',
    Java:        '#B07219',
    Kotlin:      '#A97BFF',
    Go:          '#00ADD8',
    Rust:        '#DEA584',
    'C#':        '#178600',
    Dart:        '#00B4AB',
};

function LanguageDot({ language }: { language: string }) {
    const color = LANG_COLORS[language] ?? '#6B7280';
    return (
        <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            title={language}
        />
    );
}

interface DetectionBadgesProps {
    frameworks: FrameworkDetection[];
    libraries: LibraryDetection[];
}

export default function DetectionBadges({ frameworks, libraries }: DetectionBadgesProps) {
    return (
        <div className="space-y-6">
            {/* Frameworks */}
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Frameworks</h3>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-gray-500">
                        {frameworks.length}
                    </span>
                </div>
                {frameworks.length === 0 ? (
                    <p className="text-[12px] text-gray-700">None detected</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {frameworks.map(fw => (
                            <div
                                key={fw.name}
                                className="flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5"
                            >
                                <LanguageDot language={fw.language} />
                                <span className="text-[12px] font-medium text-gray-300">{fw.name}</span>
                                <span className="text-[10px] text-gray-600">{fw.language}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Libraries */}
            <section>
                <div className="mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-400" />
                    <h3 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Libraries & Tools</h3>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-gray-500">
                        {libraries.length}
                    </span>
                </div>
                {libraries.length === 0 ? (
                    <p className="text-[12px] text-gray-700">None detected</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {libraries.map(lib => (
                            <div
                                key={lib.name}
                                className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1"
                            >
                                <Box size={10} className="text-gray-600" />
                                <span className="text-[11px] text-gray-400">{lib.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
