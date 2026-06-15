<?php

namespace App\Services\Repository;

use App\Enums\RepositoryStatus;
use App\Models\RepositoryUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;


class RepositoryService
{
    public function __construct(private readonly CodeAnalyticsService $analytics) {}
    private const MAX_ZIP_BYTES    = 100 * 1024 * 1024; // 100 MB
    private const MAX_FILE_BYTES   = 5 * 1024 * 1024;   // 5 MB per file (for reading)
    private const DISK              = 'local';
    private const BASE_DIR          = 'repositories';

    // Extensions we display as text/code
    private const TEXT_EXTENSIONS = [
        'php', 'js', 'ts', 'tsx', 'jsx', 'vue', 'html', 'htm', 'css', 'scss', 'sass',
        'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bash',
        'zsh', 'fish', 'ps1', 'bat', 'cmd', 'py', 'rb', 'java', 'kt', 'swift',
        'go', 'rs', 'c', 'cpp', 'h', 'hpp', 'cs', 'fs', 'fsx', 'scala', 'r',
        'sql', 'md', 'mdx', 'txt', 'log', 'csv', 'tf', 'hcl', 'dockerfile',
        'gitignore', 'gitattributes', 'editorconfig', 'eslintrc', 'prettierrc',
        'babelrc', 'makefile', 'rakefile', 'gemfile', 'lock', 'gradle', 'properties',
        'conf', 'config', 'nginx', 'htaccess', 'svg', 'graphql', 'gql', 'prisma',
        'dart', 'lua', 'ex', 'exs', 'erl', 'hs', 'elm', 'clj', 'cljs',
    ];

    public function storeZip(UploadedFile $file, int $userId, string $name): RepositoryUpload
    {
        $this->validateZip($file);

        $uploadId    = (string) Str::uuid();
        $zipFilename = $uploadId . '.zip';
        $zipPath     = self::BASE_DIR . '/' . $uploadId . '/' . $zipFilename;
        $extractPath = self::BASE_DIR . '/' . $uploadId . '/extracted';

        Storage::disk(self::DISK)->putFileAs(
            self::BASE_DIR . '/' . $uploadId,
            $file,
            $zipFilename
        );

        $upload = RepositoryUpload::create([
            'id'                => $uploadId,
            'user_id'           => $userId,
            'name'              => $name,
            'original_filename' => $file->getClientOriginalName(),
            'disk'              => self::DISK,
            'zip_path'          => $zipPath,
            'extract_path'      => $extractPath,
            'zip_size_bytes'    => $file->getSize(),
            'status'            => RepositoryStatus::Processing,
        ]);

        $this->extract($upload);

        return $upload->fresh();
    }

    public function extract(RepositoryUpload $upload): void
    {
        try {
            $zipAbsPath     = Storage::disk(self::DISK)->path($upload->zip_path);
            $extractAbsPath = Storage::disk(self::DISK)->path($upload->extract_path);

            $zip = new ZipArchive();
            if ($zip->open($zipAbsPath) !== true) {
                throw new \RuntimeException('Cannot open ZIP archive.');
            }

            // Security: reject entries with path traversal
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if ($this->hasPathTraversal($name)) {
                    $zip->close();
                    throw new \RuntimeException("Unsafe path in archive: {$name}");
                }
            }

            $zip->extractTo($extractAbsPath);
            $zip->close();

            $tree      = $this->buildTree($extractAbsPath, $extractAbsPath);
            $fileCount = $this->countFiles($tree);

            $upload->update([
                'status'     => RepositoryStatus::Ready,
                'file_tree'  => $tree,
                'file_count' => $fileCount,
            ]);

            // Run code analytics immediately after successful extraction
            try {
                $this->analytics->analyse($upload);
            } catch (\Throwable $analyticsException) {
                // Analytics failure must not mark the repository as failed
                \Illuminate\Support\Facades\Log::warning(
                    'Code analytics failed for repository ' . $upload->id . ': ' . $analyticsException->getMessage()
                );
            }
        } catch (\Throwable $e) {
            $upload->update([
                'status'        => RepositoryStatus::Failed,
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    public function getFileContent(RepositoryUpload $upload, string $relativePath): array
    {
        $this->ensureReady($upload);
        $this->validateRelativePath($relativePath);

        $extractAbsPath = Storage::disk(self::DISK)->path($upload->extract_path);
        $absPath        = $extractAbsPath . DIRECTORY_SEPARATOR . $relativePath;
        $realExtract    = realpath($extractAbsPath);
        $realFile       = realpath($absPath);

        if ($realFile === false || $realExtract === false) {
            throw new \RuntimeException('File not found.');
        }

        if (! str_starts_with($realFile, $realExtract . DIRECTORY_SEPARATOR)) {
            throw new \RuntimeException('Access denied.');
        }

        if (! is_file($realFile)) {
            throw new \RuntimeException('Not a file.');
        }

        $size = filesize($realFile);
        if ($size > self::MAX_FILE_BYTES) {
            return [
                'content'   => null,
                'too_large' => true,
                'size'      => $size,
                'extension' => pathinfo($realFile, PATHINFO_EXTENSION),
                'is_text'   => false,
            ];
        }

        $ext    = strtolower(pathinfo($realFile, PATHINFO_EXTENSION));
        $isText = $this->isTextExtension($ext) && $this->isReadableText($realFile);

        return [
            'content'   => $isText ? file_get_contents($realFile) : null,
            'too_large' => false,
            'size'      => $size,
            'extension' => $ext,
            'is_text'   => $isText,
            'language'  => $this->mapExtensionToLanguage($ext),
        ];
    }

    public function searchFiles(RepositoryUpload $upload, string $query): array
    {
        $this->ensureReady($upload);

        $results = [];
        $this->walkTree($upload->file_tree ?? [], '', $query, $results);

        return array_slice($results, 0, 100);
    }

    public function deleteUpload(RepositoryUpload $upload): void
    {
        $dir = self::BASE_DIR . '/' . $upload->id;
        Storage::disk(self::DISK)->deleteDirectory($dir);
        $upload->delete();
    }

    // ─── Private helpers ──────────────────────────────────────────────

    private function validateZip(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_ZIP_BYTES) {
            throw new \InvalidArgumentException('ZIP file exceeds 100 MB limit.');
        }

        $mime = $file->getMimeType();
        $ext  = strtolower($file->getClientOriginalExtension());

        if ($ext !== 'zip' && ! in_array($mime, ['application/zip', 'application/x-zip-compressed'])) {
            throw new \InvalidArgumentException('Only ZIP files are accepted.');
        }
    }

    private function buildTree(string $dir, string $root): array
    {
        $items = [];
        $entries = scandir($dir);

        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;

            $fullPath = $dir . DIRECTORY_SEPARATOR . $entry;
            $relative = ltrim(str_replace($root, '', $fullPath), DIRECTORY_SEPARATOR . '/\\');

            if (is_dir($fullPath)) {
                $items[] = [
                    'type'     => 'directory',
                    'name'     => $entry,
                    'path'     => $relative,
                    'children' => $this->buildTree($fullPath, $root),
                ];
            } else {
                $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
                $items[] = [
                    'type'      => 'file',
                    'name'      => $entry,
                    'path'      => $relative,
                    'size'      => filesize($fullPath),
                    'extension' => $ext,
                    'language'  => $this->mapExtensionToLanguage($ext),
                ];
            }
        }

        // Directories first, then files, both alphabetically
        usort($items, function ($a, $b) {
            if ($a['type'] !== $b['type']) {
                return $a['type'] === 'directory' ? -1 : 1;
            }
            return strcasecmp($a['name'], $b['name']);
        });

        return $items;
    }

    private function countFiles(array $tree): int
    {
        $count = 0;
        foreach ($tree as $node) {
            if ($node['type'] === 'file') {
                $count++;
            } else {
                $count += $this->countFiles($node['children'] ?? []);
            }
        }
        return $count;
    }

    private function walkTree(array $tree, string $prefix, string $query, array &$results): void
    {
        $q = strtolower($query);
        foreach ($tree as $node) {
            if (str_contains(strtolower($node['name']), $q)) {
                $results[] = [
                    'type'      => $node['type'],
                    'name'      => $node['name'],
                    'path'      => $node['path'],
                    'extension' => $node['extension'] ?? null,
                    'language'  => $node['language'] ?? null,
                ];
            }
            if ($node['type'] === 'directory' && ! empty($node['children'])) {
                $this->walkTree($node['children'], $node['path'], $query, $results);
            }
        }
    }

    private function hasPathTraversal(string $name): bool
    {
        return str_contains($name, '..') || str_starts_with($name, '/') || str_contains($name, "\0");
    }

    private function validateRelativePath(string $path): void
    {
        if ($this->hasPathTraversal($path)) {
            throw new \RuntimeException('Invalid path.');
        }
    }

    private function isTextExtension(string $ext): bool
    {
        return in_array($ext, self::TEXT_EXTENSIONS, true)
            || $ext === ''  // files with no extension (Makefile, Dockerfile, etc.)
            ;
    }

    private function isReadableText(string $path): bool
    {
        // Sample first 8 KB to detect binary content
        $handle = fopen($path, 'rb');
        if (! $handle) return false;
        $sample = fread($handle, 8192);
        fclose($handle);

        // If >30% non-printable bytes → binary
        $nonPrintable = preg_match_all('/[^\x09\x0A\x0D\x20-\x7E\x80-\xFF]/', $sample);
        return ($nonPrintable / max(strlen($sample), 1)) < 0.30;
    }

    private function ensureReady(RepositoryUpload $upload): void
    {
        if (! $upload->isReady()) {
            throw new \RuntimeException('Repository is not ready.');
        }
    }

    private function mapExtensionToLanguage(string $ext): string
    {
        return match ($ext) {
            'js', 'jsx', 'mjs', 'cjs' => 'javascript',
            'ts', 'tsx'                => 'typescript',
            'php'                      => 'php',
            'py'                       => 'python',
            'rb'                       => 'ruby',
            'java'                     => 'java',
            'kt', 'kts'               => 'kotlin',
            'swift'                    => 'swift',
            'go'                       => 'go',
            'rs'                       => 'rust',
            'c', 'h'                   => 'c',
            'cpp', 'cc', 'cxx', 'hpp' => 'cpp',
            'cs'                       => 'csharp',
            'html', 'htm'             => 'html',
            'css'                      => 'css',
            'scss', 'sass'            => 'scss',
            'less'                     => 'less',
            'json'                     => 'json',
            'xml'                      => 'xml',
            'yaml', 'yml'             => 'yaml',
            'toml'                     => 'toml',
            'sql'                      => 'sql',
            'sh', 'bash', 'zsh'       => 'bash',
            'ps1'                      => 'powershell',
            'md', 'mdx'               => 'markdown',
            'vue'                      => 'vue',
            'svelte'                   => 'svelte',
            'graphql', 'gql'          => 'graphql',
            'dart'                     => 'dart',
            'lua'                      => 'lua',
            'r'                        => 'r',
            'tf', 'hcl'               => 'hcl',
            'dockerfile'               => 'dockerfile',
            'svg'                      => 'xml',
            default                    => 'plaintext',
        };
    }
}
