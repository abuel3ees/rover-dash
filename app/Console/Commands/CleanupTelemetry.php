<?php

namespace App\Console\Commands;

use App\Models\TelemetryData;
use Illuminate\Console\Command;

class CleanupTelemetry extends Command
{
    protected $signature = 'rovers:cleanup-telemetry {--days=30 : Number of days to retain}';

    protected $description = 'Delete telemetry data older than the specified number of days';

    public function handle(): void
    {
        $days = (int) $this->option('days');

        $deleted = TelemetryData::where('recorded_at', '<', now()->subDays($days))->delete();

        $this->info("Deleted {$deleted} telemetry records older than {$days} days.");
    }
}
