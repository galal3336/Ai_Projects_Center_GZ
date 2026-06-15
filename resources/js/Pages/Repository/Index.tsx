import { cn } from '@/lib/utils';
import { type RepositoryUpload, type SharedProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Files,
    Loader2,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ─── Glass card ───────────────────────────────────────────────────────────────

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md',
                className,
            )}
        >
            {children}
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RepositoryUpload['status'] }) {
    const map = {
        pending:    { label: 'Pending',    icon: Clock,         cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
        processing: { label: 'Processing', icon: Loader2,       cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20 [&>svg]:animate-spin' },
        ready:      { label: 'Ready',      icon: CheckCircle2,  cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
        failed:     { label: 'Failed',     icon: AlertCircle,   cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
    };
    const { label, icon: Icon, cls } = map[status] ?? map.pending;
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cls)}>
            <Icon size={11} />
            {label}
        </span>
    );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
    onUpload: (file: File, name: string) => void;
    isUploading: boolean;
    progress: number;
    error: string | null;
}

function UploadZone({ onUpload, isUploading, progress, error }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [name, setName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        setSelectedFile(file);
        if (!name) setName(file.name.replace(/\.zip$/i, ''));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.zip')) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !name.trim() || isUploading) return;
        onUpload(selectedFile, name.trim());
    };

    const clear = () => {
        setSelectedFile(null);
        setName('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <GlassCard className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-200">
                <Upload size={15} className="text-purple-400" />
                Upload Repository
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !selectedFile && inputRef.current?.click()}
                    className={cn(
                        'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
                        isDragging
                            ? 'border-purple-500/60 bg-purple-500/5'
                            : selectedFile
                                ? 'border-green-500/40 bg-green-500/5 cursor-default'
                                : 'border-white/[0.10] hover:border-purple-500/40 hover:bg-white/[0.02]',
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".zip,application/zip"
                        className="hidden"
                        onChange={handleInputChange}
                        disabled={isUploading}
                    />

                    {selectedFile ? (
                        <>
                            <CheckCircle2 size={28} className="text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-200">{selectedFile.name}</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clear(); }}
                                className="absolute top-2 right-2 rounded-md p-1 text-gray-500 hover:text-gray-300 cursor-pointer"
                                aria-label="Remove file"
                            >
                                <X size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="rounded-full border border-white/[0.08] bg-white/[0.04] p-3">
                                <Upload size={22} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-300">
                                    Drop ZIP here or{' '}
                                    <span className="text-purple-400 underline underline-offset-2">browse</span>
                                </p>
                                <p className="mt-1 text-xs text-gray-600">Max 100 MB · ZIP only</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Name input */}
                <div className="space-y-1.5">
                    <label htmlFor="repo-name" className="block text-xs font-medium text-gray-400">
                        Repository name <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="repo-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="my-awesome-project"
                        maxLength={120}
                        disabled={isUploading}
                        className={cn(
                            'w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm text-gray-200 placeholder-gray-600',
                            'outline-none transition-colors duration-150',
                            'focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30',
                            'disabled:opacity-50',
                        )}
                    />
                </div>

                {/* Progress */}
                {isUploading && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Uploading & extracting…</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!selectedFile || !name.trim() || isUploading}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                        'bg-gradient-to-r from-purple-600 to-blue-600',
                        'hover:from-purple-500 hover:to-blue-500',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                        'cursor-pointer text-white',
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            Processing…
                        </>
                    ) : (
                        <>
                            <Plus size={15} />
                            Upload Repository
                        </>
                    )}
                </button>
            </form>
        </GlassCard>
    );
}

// ─── Repository card ──────────────────────────────────────────────────────────

function RepositoryCard({
    upload,
    onDelete,
    onOpen,
}: {
    upload: RepositoryUpload;
    onDelete: (id: string) => void;
    onOpen: (id: string) => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete "${upload.name}"?`)) return;
        setDeleting(true);
        onDelete(upload.id);
    };

    return (
        <button
            type="button"
            onClick={() => upload.status === 'ready' && onOpen(upload.id)}
            disabled={upload.status !== 'ready'}
            className={cn(
                'group flex w-full items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left',
                'transition-all duration-200',
                upload.status === 'ready'
                    ? 'cursor-pointer hover:border-purple-500/30 hover:bg-white/[0.05]'
                    : 'cursor-default opacity-70',
            )}
        >
            {/* Icon */}
            <div className="mt-0.5 rounded-lg border border-white/[0.08] bg-white/[0.05] p-2.5">
                <Files size={18} className="text-purple-400" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-sm font-semibold text-gray-200">
                        {upload.name}
                    </span>
                    <StatusBadge status={upload.status} />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-gray-600">
                    {upload.original_filename}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                    <span>{upload.file_count} files</span>
                    <span>{upload.size_for_humans}</span>
                    <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                </div>
                {upload.error_message && (
                    <p className="mt-1.5 text-[11px] text-red-400/80">{upload.error_message}</p>
                )}
            </div>

            {/* Delete */}
            <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ml-2 rounded-md p-1.5 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                aria-label="Delete repository"
            >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps extends SharedProps {
    uploads: RepositoryUpload[];
}

export default function RepositoryIndexPage() {
    const { uploads } = usePage<PageProps>().props;
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleUpload = useCallback((file: File, name: string) => {
        setIsUploading(true);
        setProgress(0);
        setUploadError(null);

        const form = new FormData();
        form.append('zip', file);
        form.append('name', name);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/repositories/upload');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json');

        const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
        if (meta) xhr.setRequestHeader('X-CSRF-TOKEN', meta.content);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 85));
            }
        };

        xhr.onload = () => {
            setProgress(100);
            if (xhr.status === 201) {
                setTimeout(() => {
                    setIsUploading(false);
                    router.reload({ only: ['uploads'] });
                }, 400);
            } else {
                try {
                    const json = JSON.parse(xhr.responseText);
                    setUploadError(json.message ?? 'Upload failed.');
                } catch {
                    setUploadError('Upload failed. Please try again.');
                }
                setIsUploading(false);
            }
        };

        xhr.onerror = () => {
            setUploadError('Network error. Please try again.');
            setIsUploading(false);
        };

        xhr.send(form);
    }, []);

    const handleDelete = useCallback((id: string) => {
        router.delete(`/repositories/${id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['uploads'] }),
        });
    }, []);

    const handleOpen = useCallback((id: string) => {
        router.visit(`/repositories/${id}`);
    }, []);

    return (
        <div className="min-h-screen bg-[#020203]">
            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
                <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-12">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Repository Explorer
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload a ZIP archive and explore its source code with syntax highlighting.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Upload panel */}
                    <div className="lg:col-span-1">
                        <UploadZone
                            onUpload={handleUpload}
                            isUploading={isUploading}
                            progress={progress}
                            error={uploadError}
                        />
                    </div>

                    {/* Repository list */}
                    <div className="lg:col-span-2">
                        <GlassCard className="p-6">
                            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-200">
                                <Files size={15} className="text-blue-400" />
                                Your Repositories
                                {uploads.length > 0 && (
                                    <span className="ml-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-400">
                                        {uploads.length}
                                    </span>
                                )}
                            </h2>

                            {uploads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <div className="rounded-full border border-white/[0.06] bg-white/[0.03] p-4">
                                        <Files size={24} className="text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-500">No repositories yet</p>
                                    <p className="text-xs text-gray-700">Upload a ZIP to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {uploads.map((u) => (
                                        <RepositoryCard
                                            key={u.id}
                                            upload={u}
                                            onDelete={handleDelete}
                                            onOpen={handleOpen}
                                        />
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
