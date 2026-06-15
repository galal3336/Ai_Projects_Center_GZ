<?php

namespace App\Services\Security;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Validates uploaded files against MIME magic bytes, dangerous extension
 * blocklists, and filename sanitization to prevent upload-based attacks.
 */
class FileUploadSecurityService
{
    // Extensions that are never safe to serve, regardless of MIME type claim
    private const BLOCKED_EXTENSIONS = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar',
        'asp', 'aspx', 'asa', 'cer', 'asax',
        'jsp', 'jspx', 'jsw', 'jsv', 'jspf',
        'sh', 'bash', 'zsh', 'csh', 'ksh', 'fish',
        'py', 'rb', 'pl', 'cgi', 'exe', 'com', 'bat', 'cmd', 'vbs', 'vba',
        'ps1', 'psm1', 'psd1',
        'htaccess', 'htpasswd', 'ini', 'config', 'conf',
        'xml',  // allows SVG bypass
    ];

    // Magic bytes → MIME
    private const MAGIC_MAP = [
        "\x89PNG\r\n\x1A\n"          => 'image/png',
        "\xFF\xD8\xFF"               => 'image/jpeg',
        "GIF87a"                     => 'image/gif',
        "GIF89a"                     => 'image/gif',
        "RIFF"                       => 'image/webp',   // webp starts RIFF....WEBP
        "\x00\x00\x01\x00"          => 'image/x-icon',
        "PK\x03\x04"                => 'application/zip',
        "%PDF-"                      => 'application/pdf',
        "<svg"                       => 'image/svg+xml',
        "<?xml"                      => 'image/svg+xml',
    ];

    /**
     * Full security validation for an image upload.
     * Throws \InvalidArgumentException on failure.
     */
    public function validateImage(UploadedFile $file, int $maxKb = 2048): void
    {
        $this->assertMaxSize($file, $maxKb);
        $this->assertExtensionNotBlocked($file);
        $this->assertMagicBytesMatch($file, ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/x-icon']);
        $this->assertNoEmbeddedPhp($file);
    }

    /**
     * Full security validation for a ZIP upload.
     * Throws \InvalidArgumentException on failure.
     */
    public function validateZip(UploadedFile $file, int $maxMb = 100): void
    {
        $this->assertMaxSize($file, $maxMb * 1024);
        $this->assertMagicBytesMatch($file, ['application/zip']);
    }

    /**
     * Full security validation for an SVG or branding asset.
     * SVG is sanitized separately — here we just check it's actually an image.
     */
    public function validateBrandingAsset(UploadedFile $file, int $maxKb = 2048): void
    {
        $this->assertMaxSize($file, $maxKb);
        $this->assertExtensionNotBlocked($file);

        $ext = strtolower($file->getClientOriginalExtension());

        $allowed = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'];
        if (! in_array($ext, $allowed, true)) {
            throw new \InvalidArgumentException("File type .{$ext} is not allowed for branding assets.");
        }

        if ($ext === 'svg') {
            $this->assertSvgSafe($file);
        } else {
            $this->assertMagicBytesMatch($file, ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/x-icon']);
        }
    }

    /**
     * Returns a safe, unique filename preserving the original extension.
     */
    public function sanitizeFilename(UploadedFile $file): string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        return Str::uuid()->toString() . ($ext ? '.' . $ext : '');
    }

    // ─── Private validators ───────────────────────────────────────────

    private function assertMaxSize(UploadedFile $file, int $maxKb): void
    {
        if ($file->getSize() > $maxKb * 1024) {
            throw new \InvalidArgumentException("File exceeds the maximum allowed size of {$maxKb} KB.");
        }
    }

    private function assertExtensionNotBlocked(UploadedFile $file): void
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if (in_array($ext, self::BLOCKED_EXTENSIONS, true)) {
            throw new \InvalidArgumentException("Files with extension .{$ext} are not allowed.");
        }
    }

    private function assertMagicBytesMatch(UploadedFile $file, array $allowedMimes): void
    {
        $handle = fopen($file->getPathname(), 'rb');
        if (! $handle) {
            throw new \InvalidArgumentException('Cannot read uploaded file.');
        }
        $header = fread($handle, 16);
        fclose($handle);

        $detected = null;
        foreach (self::MAGIC_MAP as $magic => $mime) {
            if (str_starts_with($header, $magic)) {
                $detected = $mime;
                break;
            }
        }

        // WEBP: RIFF....WEBP
        if ($detected === 'image/webp' && ! str_contains(substr($header, 0, 12), 'WEBP')) {
            $detected = null;
        }

        if ($detected === null || ! in_array($detected, $allowedMimes, true)) {
            $claim = $file->getMimeType();
            throw new \InvalidArgumentException(
                "File content does not match an allowed type. Detected: {$detected}, Claimed: {$claim}."
            );
        }
    }

    private function assertNoEmbeddedPhp(UploadedFile $file): void
    {
        // Read first 64 KB and scan for PHP opening tags
        $handle = fopen($file->getPathname(), 'rb');
        if (! $handle) return;
        $content = fread($handle, 65536);
        fclose($handle);

        if (preg_match('/<\?php|<\?=/i', $content)) {
            throw new \InvalidArgumentException('File contains embedded PHP code and cannot be uploaded.');
        }
    }

    private function assertSvgSafe(UploadedFile $file): void
    {
        $content = file_get_contents($file->getPathname());
        if ($content === false) {
            throw new \InvalidArgumentException('Cannot read SVG file.');
        }

        // Block script tags, event handlers, and external resource references
        $dangerous = [
            '/<script/i',
            '/on\w+\s*=/i',           // onclick=, onload=, etc.
            '/<iframe/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/data:text\/html/i',
            '/<use\s[^>]*href\s*=\s*["\']https?:/i',  // external use references
            '/<!ENTITY/i',                               // XXE
        ];

        foreach ($dangerous as $pattern) {
            if (preg_match($pattern, $content)) {
                throw new \InvalidArgumentException('SVG file contains unsafe content.');
            }
        }
    }
}
