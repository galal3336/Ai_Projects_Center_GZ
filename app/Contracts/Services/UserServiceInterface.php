<?php

namespace App\Contracts\Services;

use App\DTOs\UserDTO;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserServiceInterface
{
    public function findById(int $id): ?User;
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function create(UserDTO $dto): User;
    public function update(User $user, UserDTO $dto): User;
    public function delete(User $user): bool;
    public function assignRole(User $user, string $role): void;
    public function syncPermissions(User $user, array $permissions): void;
}
