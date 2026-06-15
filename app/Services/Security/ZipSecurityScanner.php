<?php

namespace App\Services\Security;

use Illuminate\Http\UploadedFile;
use ZipArchive;

/**
 * Scans a ZIP archive for security threats before extraction:
 *   - Zip-bomb detection (compression ratio)
 *   - Path traversal entries
 *   - Dangerous file types inside the archive
 *   - Excessive file count / nested archives
 */
class ZipSecurityScanner
{
    private const MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024; // 500 MB uncompressed limit
    private const MAX_COMPRESSION_RATIO  = 50;                 // Flag if any entry > 50× ratio
    private const MAX_FILE_COUNT         = 10_000;
    private const MAX_SINGLE_FILE_BYTES  = 50 * 1024 * 1024;  // 50 MB per entry uncompressed

    // Extensions that must never appear inside a user-uploaded ZIP
    private const BLOCKED_INNER_EXTENSIONS = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
        'asp', 'aspx', 'asa', 'cer',
        'jsp', 'jspx',
        'exe', 'com', 'dll', 'so', 'dylib',
        'sh', 'bash', 'zsh', 'csh', 'fish',
        'bat', 'cmd', 'vbs', 'ps1', 'psm1',
        'htaccess', 'htpasswd',
    ];

    /**
     * Scan the uploaded file before it is stored/extracted.
     * Throws \InvalidArgumentException describing the threat found.
     */
    public function scan(UploadedFile $file): void
    {
        $path = $file->getPathname();

        $zip = new ZipArchive();
        $result = $zip->open($path);

        if ($result !== true) {
            throw new \InvalidArgumentException('Cannot open ZIP archive for security scan (code: ' . $result . ').');
        }

        $fileCount         = $zip->numFiles;
        $totalUncompressed = 0;

        if ($fileCount > self::MAX_FILE_COUNT) {
            $zip->close();
            throw new \InvalidArgumentException(
                "ZIP archive contains too many files ({$fileCount} > " . self::MAX_FILE_COUNT . ').'
            );
        }

        for ($i = 0; $i < $fileCount; $i++) {
            $stat = $zip->statIndex($i);
            if ($stat === false) continue;

            $name             = $stat['name'];
            $compressedSize   = $stat['comp_size'];
            $uncompressedSize = $stat['size'];

            // Path traversal check
            if ($this->hasPathTraversal($name)) {
                $zip->close();
                throw new \InvalidArgumentException("ZIP entry contains path traversal: {$name}");
            }

            // Null byte in filename
            if (str_contains($name, "\0")) {
                $zip->close();
                throw new \InvalidArgumentException('ZIP entry contains null byte in filename.');
            }

            // Blocked extension inside archive
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (in_array($ext, self::BLOCKED_INNER_EXTENSIONS, true)) {
                $zip->close();
                throw new \InvalidArgumentException(
                    "ZIP archive contains a blocked file type (.{$ext}): {$name}"
                );
            }

            // Nested ZIP/archive detection (allow .zip for multi-part projects, but flag embedded .tar.gz etc.)
            if (in_array($ext, ['tar', 'gz', 'bz2', 'rar', '7z'], true)) {
                $zip->close();
                throw new \InvalidArgumentException(
                    "ZIP archive contains a nested archive which is not allowed: {$name}"
                );
            }

            // Zip bomb: single entry uncompressed size
            if ($uncompressedSize > self::MAX_SINGLE_FILE_BYTES) {
                $zip->close();
                throw new \InvalidArgumentException(
                    sprintf(
                        'ZIP entry "%s" is too large when uncompressed (%s MB).',
                        $name,
                        round($uncompressedSize / 1024 / 1024, 2)
                    )
                );
            }

            // Zip bomb: suspicious compression ratio
            if ($compressedSize > 0 && ($uncompressedSize / $compressedSize) > self::MAX_COMPRESSION_RATIO) {
                $zip->close();
                throw new \InvalidArgumentException(
                    sprintf(
                        'ZIP entry "%s" has a suspicious compression ratio (%d×) — possible zip bomb.',
                        $name,
                        round($uncompressedSize / $compressedSize)
                    )
                );
            }

            $totalUncompressed += $uncompressedSize;

            // Running total zip bomb check
            if ($totalUncompressed > self::MAX_UNCOMPRESSED_BYTES) {
                $zip->close();
                throw new \InvalidArgumentException(
                    sprintf(
                        'ZIP archive total uncompressed size (%s MB) exceeds the %s MB limit.',
                        round($totalUncompressed / 1024 / 1024, 2),
                        self::MAX_UNCOMPRESSED_BYTES / 1024 / 1024
                    )
                );
            }
        }

        $zip->close();
    }

    private function hasPathTraversal(string $name): bool
    {
        // Normalise separators and check for .. segments
        $normalised = str_replace('\\', '/', $name);
        if (str_starts_with($normalised, '/')) return true;
        foreach (explode('/', $normalised) as $segment) {
            if ($segment === '..') return true;
        }
        return false;
    }
}
