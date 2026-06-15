<?php

namespace App\DTOs;

use App\Enums\UserRole;
use App\Enums\UserStatus;

final class UserDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly ?string $username = null,
        public readonly ?string $password = null,
        public readonly UserRole $role = UserRole::Student,
        public readonly UserStatus $status = UserStatus::Pending,
        public readonly string $locale = 'en',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name:     $data['name'],
            email:    $data['email'],
            username: $data['username'] ?? null,
            password: $data['password'] ?? null,
            role:     UserRole::from($data['role'] ?? UserRole::Student->value),
            status:   UserStatus::from($data['status'] ?? UserStatus::Pending->value),
            locale:   $data['locale'] ?? 'en',
        );
    }

    public function toArray(): array
    {
        return [
            'name'     => $this->name,
            'email'    => $this->email,
            'username' => $this->username,
            'status'   => $this->status->value,
            'locale'   => $this->locale,
        ];
    }
}
