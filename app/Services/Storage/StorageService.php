<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    private const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

    public function storeAvatar(UploadedFile $file, int $userId): string
    {
        return $this->store($file, "avatars/{$userId}", 'public');
    }

    public function storeProjectFile(UploadedFile $file, int $projectId): string
    {
        return $this->store($file, "projects/{$projectId}", 'public');
    }

    public function storeDocument(UploadedFile $file, string $context = 'general'): string
    {
        return $this->store($file, "documents/{$context}", 'public');
    }

    public function delete(string $path, string $disk = 'public'): bool
    {
        return Storage::disk($disk)->delete($path);
    }

    public function url(string $path, string $disk = 'public'): string
    {
        return Storage::disk($disk)->url($path);
    }

    public function exists(string $path, string $disk = 'public'): bool
    {
        return Storage::disk($disk)->exists($path);
    }

    private function store(UploadedFile $file, string $directory, string $disk): string
    {
        $this->validateSize($file);

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($directory, $filename, ['disk' => $disk]);
    }

    private function validateSize(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            throw new \InvalidArgumentException(
                __('validation.max.file', ['max' => self::MAX_SIZE_BYTES / 1024 / 1024])
            );
        }
    }
}
