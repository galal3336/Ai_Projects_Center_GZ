import { cn } from '@/lib/utils';
import { type FileContent } from '@/types';
import { Check, Copy, Download, FileX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { codeToHtml } from 'shiki';

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable — graceful no-op
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                'border border-white/[0.08] cursor-pointer',
                copied
                    ? 'border-green-500/30 bg-green-500/10 text-green-400'
                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200',
            )}
            aria-label={copied ? 'Copied!' : 'Copy code'}
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

// ─── Line-numbered highlighted block ─────────────────────────────────────────

interface HighlightedCodeProps {
    code: string;
    language: string;
    fileName: string;
}

function HighlightedCode({ code, language, fileName }: HighlightedCodeProps) {
    const [html, setHtml] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const lines = code.split('\n');

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setHtml(null);

        codeToHtml(code, {
            lang: language === 'plaintext' ? 'text' : language,
            theme: 'github-dark-default',
        })
            .then((result) => {
                if (!cancelled) {
                    setHtml(result);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [code, language]);

    const lineCount = lines.length;
    const digitWidth = String(lineCount).length;

    return (
        <div className="relative overflow-auto font-mono text-[13px] leading-6">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-2">
                <span className="text-[11px] text-gray-500">
                    {lineCount.toLocaleString()} lines · {language}
                </span>
                <div className="flex items-center gap-2">
                    <CopyButton text={code} />
                </div>
            </div>

            {/* Code area */}
            <div className="flex min-h-0">
                {/* Line numbers */}
                <div
                    className="sticky left-0 z-[1] select-none border-r border-white/[0.05] bg-[#0d1117] px-3 py-4 text-right"
                    aria-hidden="true"
                    style={{ minWidth: `${digitWidth * 9 + 24}px` }}
                >
                    {lines.map((_, i) => (
                        <div key={i} className="text-gray-600 leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Highlighted code */}
                <div className="flex-1 overflow-x-auto py-4 pl-4 pr-6">
                    {isLoading ? (
                        <div className="space-y-1.5 pr-4">
                            {lines.slice(0, Math.min(lines.length, 40)).map((line, i) => (
                                <div
                                    key={i}
                                    className="h-[22px] animate-pulse rounded bg-white/[0.03]"
                                    style={{ width: `${Math.max(20, (line.length / 80) * 100)}%` }}
                                />
                            ))}
                        </div>
                    ) : html ? (
                        <div
                            className="shiki-wrapper [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!font-mono [&>pre]:leading-6"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    ) : (
                        <pre className="whitespace-pre text-gray-300">{code}</pre>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Binary / too-large placeholders ─────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

function BinaryPlaceholder({ size, extension }: { size: number; extension: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <FileX size={40} className="text-gray-600" />
            <p className="text-sm font-medium text-gray-400">Binary file</p>
            <p className="text-xs text-gray-600">
                .{extension} · {formatBytes(size)}
            </p>
        </div>
    );
}

function TooLargePlaceholder({ size }: { size: number }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Download size={40} className="text-gray-600" />
            <p className="text-sm font-medium text-gray-400">File too large to preview</p>
            <p className="text-xs text-gray-600">{formatBytes(size)}</p>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CodeViewerSkeleton() {
    return (
        <div className="animate-pulse space-y-3 p-6">
            {Array.from({ length: 18 }).map((_, i) => (
                <div
                    key={i}
                    className="h-[18px] rounded bg-white/[0.04]"
                    style={{ width: `${30 + Math.random() * 60}%` }}
                />
            ))}
        </div>
    );
}

// ─── CodeViewer ───────────────────────────────────────────────────────────────

interface CodeViewerProps {
    fileName: string;
    fileContent: FileContent | null;
    isLoading: boolean;
}

export default function CodeViewer({ fileName, fileContent, isLoading }: CodeViewerProps) {
    if (isLoading) return <CodeViewerSkeleton />;

    if (!fileContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
                <p className="text-sm text-gray-500">Select a file to view its contents</p>
            </div>
        );
    }

    if (fileContent.too_large) return <TooLargePlaceholder size={fileContent.size} />;
    if (!fileContent.is_text || fileContent.content === null) {
        return <BinaryPlaceholder size={fileContent.size} extension={fileContent.extension} />;
    }

    return (
        <HighlightedCode
            code={fileContent.content}
            language={fileContent.language ?? 'plaintext'}
            fileName={fileName}
        />
    );
}
