<?php

namespace App\Policies;

use App\Models\Rover;
use App\Models\User;

class RoverPolicy
{
    public function view(User $user, Rover $rover): bool
    {
        return $user->id === $rover->user_id;
    }

    public function update(User $user, Rover $rover): bool
    {
        return $user->id === $rover->user_id;
    }

    public function delete(User $user, Rover $rover): bool
    {
        return $user->id === $rover->user_id;
    }
}
