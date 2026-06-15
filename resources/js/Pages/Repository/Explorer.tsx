import AnalyticsPanel from '@/Components/Repository/AnalyticsPanel';
import CodeViewer from '@/Components/Repository/CodeViewer';
import FileTree from '@/Components/Repository/FileTree';
import { cn } from '@/lib/utils';
import {
    type FileContent,
    type FileTreeNode,
    type RepositoryUpload,
    type SearchResult,
    type SharedProps,
} from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BarChart2,
    ChevronRight,
    Code2,
    File,
    Folder,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

type ActiveTab = 'code' | 'analytics';

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ path, repoName }: { path: string; repoName: string }) {
    const parts = path.split('/').filter(Boolean);
    return (
        <nav className="flex min-w-0 items-center gap-1 font-mono text-[12px] text-gray-500" aria-label="File path">
            <span className="shrink-0">{repoName}</span>
            {parts.map((part, i) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                    <ChevronRight size={11} className="shrink-0 text-gray-700" />
                    <span className={cn('min-w-0 truncate', i === parts.length - 1 ? 'text-gray-200 font-semibold' : '')}>
                        {part}
                    </span>
                </span>
            ))}
        </nav>
    );
}

// ─── Search panel ─────────────────────────────────────────────────────────────

interface SearchPanelProps {
    repositoryId: string;
    onSelect: (node: FileTreeNode) => void;
    onClose: () => void;
}

function SearchPanel({ repositoryId, onSelect, onClose }: SearchPanelProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-focus
    useState(() => { setTimeout(() => inputRef.current?.focus(), 50); });

    const handleChange = (q: string) => {
        setQuery(q);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!q.trim()) { setResults([]); return; }
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/repositories/${repositoryId}/search?q=${encodeURIComponent(q)}`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                const data = await res.json();
                setResults(data.results ?? []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 250);
    };

    return (
        <div className="flex flex-col gap-2.5">
            <div className="relative">
                <Search size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="Search files…"
                    className="w-full rounded-lg border border-white/8 bg-white/4 py-1.5 pr-3 pl-8 font-mono text-[12px] text-gray-200 placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
                />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-px pr-0.5">
                {loading && <p className="py-3 text-center text-[11px] text-gray-600">Searching…</p>}
                {!loading && query && !results.length && (
                    <p className="py-3 text-center text-[11px] text-gray-600">No results for "{query}"</p>
                )}
                {results.map(r => (
                    <button
                        key={r.path}
                        type="button"
                        onClick={() => { onSelect({ type: r.type, name: r.name, path: r.path, extension: r.extension ?? undefined, language: r.language ?? undefined }); onClose(); }}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                    >
                        {r.type === 'directory' ? <Folder size={12} className="shrink-0 text-sky-400" /> : <File size={12} className="shrink-0 text-gray-500" />}
                        <span className="min-w-0 flex-1 truncate font-mono">{r.name}</span>
                        <span className="shrink-0 max-w-25 truncate text-[10px] text-gray-700">{r.path}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
    repository: RepositoryUpload;
    selectedPath: string | null;
    onSelect: (node: FileTreeNode) => void;
    visible: boolean;
}

function Sidebar({ repository, selectedPath, onSelect, visible }: SidebarProps) {
    const [searching, setSearching] = useState(false);

    return (
        <aside
            className={cn(
                'flex flex-col border-r border-white/6 bg-[#0a0a0f] transition-all duration-300 overflow-hidden',
                visible ? 'w-72 min-w-[288px]' : 'w-0 min-w-0',
            )}
            aria-label="File tree"
        >
            {visible && (
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-white/6 px-3 py-3 gap-2">
                        <span className="min-w-0 truncate font-mono text-[12px] font-semibold text-gray-300">
                            {repository.name}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSearching(s => !s)}
                            className={cn('shrink-0 rounded-md p-1.5 transition-colors cursor-pointer', searching ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}
                            aria-label="Search files"
                        >
                            <Search size={13} />
                        </button>
                    </div>
                    {searching && (
                        <div className="border-b border-white/6 p-3">
                            <SearchPanel repositoryId={repository.id} onSelect={onSelect} onClose={() => setSearching(false)} />
                        </div>
                    )}
                    <div className="flex items-center gap-3 border-b border-white/5 px-3 py-1.5 text-[10px] text-gray-600">
                        <span>{repository.file_count} files</span>
                        <span>·</span>
                        <span>{repository.size_for_humans}</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <FileTree tree={repository.file_tree} selectedPath={selectedPath} onSelect={onSelect} />
                    </div>
                </div>
            )}
        </aside>
    );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, hasAnalytics }: { active: ActiveTab; onChange: (t: ActiveTab) => void; hasAnalytics: boolean }) {
    const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { id: 'code',      label: 'Code',      icon: <Code2 size={13} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={13} /> },
    ];

    return (
        <div className="flex items-center gap-1 rounded-md border border-white/7 bg-white/3 p-0.5">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-150 cursor-pointer',
                        active === tab.id
                            ? 'bg-white/8 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-300',
                    )}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'analytics' && hasAnalytics && (
                        <span className="size-1.5 rounded-full bg-green-400" />
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps extends SharedProps {
    repository: RepositoryUpload;
}

export default function ExplorerPage() {
    const { repository } = usePage<PageProps>().props;

    const [activeTab, setActiveTab] = useState<ActiveTab>('code');
    const [selectedNode, setSelectedNode] = useState<FileTreeNode | null>(null);
    const [fileContent, setFileContent] = useState<FileContent | null>(null);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const abortRef = useRef<AbortController | null>(null);

    const fetchFile = useCallback(async (node: FileTreeNode) => {
        if (node.type === 'directory') return;
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setActiveTab('code');
        setSelectedNode(node);
        setFileLoading(true);
        setFileError(null);
        setFileContent(null);

        try {
            const res = await fetch(
                `/repositories/${repository.id}/file?path=${encodeURIComponent(node.path)}`,
                { signal: abortRef.current.signal, headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } },
            );
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Failed to load file.');
            setFileContent(await res.json() as FileContent);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setFileError(err instanceof Error ? err.message : 'Failed to load file.');
        } finally {
            setFileLoading(false);
        }
    }, [repository.id]);

    const handleSelect = useCallback((node: FileTreeNode) => {
        if (node.type === 'file') fetchFile(node);
    }, [fetchFile]);

    // Called from TopFilesTable inside AnalyticsPanel
    const handleAnalyticsFileSelect = useCallback((node: FileTreeNode) => {
        fetchFile(node);
    }, [fetchFile]);

    const isFailed = repository.status === 'failed';

    return (
        <div className="flex h-screen flex-col bg-[#020203] text-gray-300 overflow-hidden">
            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-60 -left-60 h-150 w-150 rounded-full bg-purple-600/8 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-100 w-100 rounded-full bg-blue-600/6 blur-[120px]" />
            </div>

            {/* Top bar */}
            <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-white/6 bg-[#0a0a0f]/80 px-4 py-2.5 backdrop-blur-md">
                <button
                    type="button"
                    onClick={() => router.visit('/repositories')}
                    className="flex items-center gap-1.5 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/6 hover:text-gray-300 cursor-pointer"
                    aria-label="Back to repositories"
                >
                    <ArrowLeft size={14} />
                </button>

                <div className="h-4 w-px bg-white/8" />

                <button
                    type="button"
                    onClick={() => setSidebarVisible(v => !v)}
                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/6 hover:text-gray-300 cursor-pointer"
                    aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                >
                    {sidebarVisible ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                </button>

                {/* Breadcrumb */}
                <div className="min-w-0 flex-1">
                    {activeTab === 'code' && selectedNode ? (
                        <Breadcrumb path={selectedNode.path} repoName={repository.name} />
                    ) : (
                        <span className="font-mono text-[12px] text-gray-400">{repository.name}</span>
                    )}
                </div>

                {/* Tab switcher */}
                <TabBar active={activeTab} onChange={setActiveTab} hasAnalytics={repository.has_analytics} />

                {/* Language label */}
                {activeTab === 'code' && fileContent?.is_text && fileContent?.language && (
                    <span className="shrink-0 font-mono text-[10px] text-gray-600 hidden sm:block">{fileContent.language}</span>
                )}
            </header>

            {/* Body */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                {/* Sidebar — only shown in Code tab */}
                {activeTab === 'code' && (
                    <Sidebar
                        repository={repository}
                        selectedPath={selectedNode?.path ?? null}
                        onSelect={handleSelect}
                        visible={sidebarVisible}
                    />
                )}

                {/* Main panel */}
                <main className="min-w-0 flex-1 overflow-hidden bg-[#0d1117]">
                    {/* ── Analytics tab ── */}
                    {activeTab === 'analytics' && (
                        <AnalyticsPanel
                            repositoryId={repository.id}
                            initialAnalytics={repository.analytics}
                            hasAnalytics={repository.has_analytics}
                            onFileSelect={handleAnalyticsFileSelect}
                        />
                    )}

                    {/* ── Code tab ── */}
                    {activeTab === 'code' && (
                        isFailed ? (
                            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                                <AlertCircle size={36} className="text-red-400" />
                                <p className="text-sm font-semibold text-gray-300">Repository processing failed</p>
                                {repository.error_message && (
                                    <p className="max-w-md text-xs text-gray-600">{repository.error_message}</p>
                                )}
                            </div>
                        ) : fileError ? (
                            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                                <AlertCircle size={36} className="text-red-400" />
                                <p className="text-sm text-gray-400">{fileError}</p>
                                <button
                                    type="button"
                                    onClick={() => selectedNode && fetchFile(selectedNode)}
                                    className="rounded-md border border-white/8 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/4 cursor-pointer transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <CodeViewer
                                    fileName={selectedNode?.name ?? ''}
                                    fileContent={fileContent}
                                    isLoading={fileLoading}
                                />
                            </div>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}
