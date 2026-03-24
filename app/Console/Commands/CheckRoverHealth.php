<?php

namespace App\Console\Commands;

use App\Events\RoverStatusChanged;
use App\Models\Rover;
use Illuminate\Console\Command;

class CheckRoverHealth extends Command
{
    protected $signature = 'rovers:check-health';

    protected $description = 'Mark stale rovers as offline';

    public function handle(): void
    {
        $staleRovers = Rover::where('status', 'online')
            ->where('last_seen_at', '<', now()->subSeconds(30))
            ->get();

        foreach ($staleRovers as $rover) {
            $rover->update(['status' => 'offline']);
            broadcast(new RoverStatusChanged($rover));
            $this->info("Marked rover '{$rover->name}' as offline.");
        }

        if ($staleRovers->isEmpty()) {
            $this->info('All rovers healthy.');
        }
    }
}
