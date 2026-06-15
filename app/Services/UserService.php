<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\UserServiceInterface;
use App\DTOs\UserDTO;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService implements UserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    public function findById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->paginate($perPage, $filters);
    }

    public function create(UserDTO $dto): User
    {
        $user = $this->userRepository->create(array_merge($dto->toArray(), [
            'password' => Hash::make($dto->password ?? str()->random(16)),
        ]));

        $user->assignRole($dto->role->value);

        return $user;
    }

    public function update(User $user, UserDTO $dto): User
    {
        $data = $dto->toArray();

        if ($dto->password) {
            $data['password'] = Hash::make($dto->password);
        }

        return $this->userRepository->update($user, $data);
    }

    public function delete(User $user): bool
    {
        return $this->userRepository->delete($user);
    }

    public function assignRole(User $user, string $role): void
    {
        $user->syncRoles([$role]);
    }

    public function syncPermissions(User $user, array $permissions): void
    {
        $user->syncPermissions($permissions);
    }
}
