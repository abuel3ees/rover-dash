import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface HealthCheckResult {
    status: 'ok' | 'error';
    url?: string;
    http_status?: number;
    content_type?: string;
    message?: string;
}

export function StreamHealthCheck() {
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<HealthCheckResult | null>(null);

    const checkHealth = async () => {
        setChecking(true);
        setResult(null);

        try {
            const response = await fetch('/rover/stream/health');
            const data = (await response.json()) as HealthCheckResult;
            setResult(data);
        } catch {
            setResult({
                status: 'error',
                message: 'Failed to reach health check endpoint',
            });
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Stream Connection Health</h3>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={checkHealth}
                    disabled={checking}
                >
                    <RefreshCw className={`size-3.5 ${checking ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {checking && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Checking stream connection...
                </div>
            )}

            {result && !checking && (
                <div
                    className={`flex items-start gap-3 rounded-md p-3 ${
                        result.status === 'ok'
                            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                            : 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                    }`}
                >
                    {result.status === 'ok' ? (
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="size-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                            result.status === 'ok'
                                ? 'text-green-900 dark:text-green-200'
                                : 'text-orange-900 dark:text-orange-200'
                        }`}>
                            {result.status === 'ok' ? 'Stream Connected' : 'Stream Unavailable'}
                        </p>
                        {result.url && (
                            <p className="text-xs text-muted-foreground mt-1 break-all font-mono">
                                {result.url}
                            </p>
                        )}
                        {result.http_status && (
                            <p className="text-xs text-muted-foreground mt-1">
                                HTTP Status: {result.http_status}
                            </p>
                        )}
                        {result.message && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {result.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {result?.status === 'ok'
                    ? '✓ Your camera stream is reachable and responding'
                    : result?.status === 'error'
                      ? '✗ Cannot connect to camera stream. Check: 1) Stream URL is correct 2) Pi camera server is running 3) Network is accessible'
                      : 'Testing connection...'}
            </p>
        </div>
    );
}
