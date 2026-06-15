import { cn } from '@/lib/utils';
import { type FileTreeNode } from '@/types';
import {
    ChevronDown,
    ChevronRight,
    File,
    FileCode,
    FileImage,
    FileJson,
    FileText,
    Folder,
    FolderOpen,
} from 'lucide-react';
import { useState } from 'react';

// ─── File-icon mapping ────────────────────────────────────────────────────────

function FileIcon({ extension, className }: { extension?: string; className?: string }) {
    const cls = cn('shrink-0', className);
    switch (extension) {
        case 'json':
            return <FileJson className={cls} />;
        case 'md':
        case 'mdx':
        case 'txt':
            return <FileText className={cls} />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
            return <FileImage className={cls} />;
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
        case 'php':
        case 'py':
        case 'rb':
        case 'go':
        case 'rs':
        case 'java':
        case 'cs':
        case 'cpp':
        case 'c':
        case 'html':
        case 'css':
        case 'vue':
        case 'svelte':
            return <FileCode className={cls} />;
        default:
            return <File className={cls} />;
    }
}

// ─── Language badge colors ────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
    typescript: '#3178C6',
    javascript: '#F7DF1E',
    python:     '#3776AB',
    php:        '#777BB4',
    ruby:       '#CC342D',
    go:         '#00ADD8',
    rust:       '#CE422B',
    java:       '#ED8B00',
    kotlin:     '#7F52FF',
    swift:      '#FA7343',
    csharp:     '#68217A',
    cpp:        '#00589D',
    c:          '#555555',
    html:       '#E34F26',
    css:        '#1572B6',
    scss:       '#CF649A',
    vue:        '#42B883',
    svelte:     '#FF3E00',
    json:       '#292929',
    markdown:   '#083FA1',
    sql:        '#CC2927',
    bash:       '#4EAA25',
    dart:       '#0175C2',
};

// ─── Tree node ────────────────────────────────────────────────────────────────

interface TreeNodeProps {
    node: FileTreeNode;
    depth: number;
    selectedPath: string | null;
    onSelect: (node: FileTreeNode) => void;
    defaultExpanded?: boolean;
}

function TreeNode({ node, depth, selectedPath, onSelect, defaultExpanded = false }: TreeNodeProps) {
    const [expanded, setExpanded] = useState(defaultExpanded || depth === 0);
    const isSelected = selectedPath === node.path;
    const isDir = node.type === 'directory';
    const indent = depth * 14;

    const handleClick = () => {
        if (isDir) {
            setExpanded((e) => !e);
        } else {
            onSelect(node);
        }
    };

    const langColor = node.language ? (LANG_COLORS[node.language] ?? '#6B7280') : '#6B7280';

    return (
        <div>
            <button
                type="button"
                onClick={handleClick}
                className={cn(
                    'group flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-all duration-150',
                    'cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/60',
                    isSelected
                        ? 'bg-white/[0.08] text-white'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200',
                )}
                style={{ paddingLeft: `${indent + 8}px` }}
                aria-expanded={isDir ? expanded : undefined}
            >
                {/* Chevron for directories */}
                {isDir ? (
                    <span className="text-gray-500 transition-transform duration-150">
                        {expanded ? (
                            <ChevronDown size={13} />
                        ) : (
                            <ChevronRight size={13} />
                        )}
                    </span>
                ) : (
                    <span className="w-[13px] shrink-0" />
                )}

                {/* Icon */}
                {isDir ? (
                    expanded ? (
                        <FolderOpen size={14} className="shrink-0 text-sky-400" />
                    ) : (
                        <Folder size={14} className="shrink-0 text-sky-400/70" />
                    )
                ) : (
                    <FileIcon
                        extension={node.extension}
                        className="size-[14px] text-gray-500 group-hover:text-gray-400"
                    />
                )}

                {/* Name */}
                <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] leading-5">
                    {node.name}
                </span>

                {/* Language dot for files */}
                {!isDir && node.language && node.language !== 'plaintext' && (
                    <span
                        className="ml-auto size-2 shrink-0 rounded-full opacity-60"
                        style={{ backgroundColor: langColor }}
                        title={node.language}
                    />
                )}
            </button>

            {/* Children */}
            {isDir && expanded && node.children && node.children.length > 0 && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}

            {/* Empty directory */}
            {isDir && expanded && (!node.children || node.children.length === 0) && (
                <p
                    className="py-1 font-mono text-[11px] italic text-gray-600"
                    style={{ paddingLeft: `${indent + 36}px` }}
                >
                    empty
                </p>
            )}
        </div>
    );
}

// ─── FileTree ─────────────────────────────────────────────────────────────────

interface FileTreeProps {
    tree: FileTreeNode[];
    selectedPath: string | null;
    onSelect: (node: FileTreeNode) => void;
}

export default function FileTree({ tree, selectedPath, onSelect }: FileTreeProps) {
    if (tree.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Folder size={32} className="text-gray-600" />
                <p className="text-sm text-gray-500">No files found</p>
            </div>
        );
    }

    return (
        <div className="select-none py-1">
            {tree.map((node) => (
                <TreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    defaultExpanded
                />
            ))}
        </div>
    );
}
