<?php

namespace App\Console\Commands;

use App\Models\Command;
use Illuminate\Console\Command as BaseCommand;

class ExpireStaleCommands extends BaseCommand
{
    protected $signature = 'rovers:expire-commands {--seconds=60 : Expire commands older than this many seconds}';

    protected $description = 'Expire stale pending or sent commands';

    public function handle(): void
    {
        $seconds = (int) $this->option('seconds');

        $expired = Command::whereIn('status', ['pending', 'sent'])
            ->where('created_at', '<', now()->subSeconds($seconds))
            ->update(['status' => 'expired']);

        $this->info("Expired {$expired} stale commands.");
    }
}
