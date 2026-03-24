import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Battery,
    Camera,
    Gamepad2,
    MapPin,
    MessageCircle,
    Radio,
    Shield,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Rover Dashboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* Navigation */}
                <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                                <Radio className="size-5 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">
                                Rover Dashboard
                            </span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ArrowRight className="ml-1 size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                    <div className="absolute top-20 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 text-center lg:pt-32 lg:pb-32">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                            </span>
                            Real-time rover control and monitoring
                        </div>

                        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Command your rover
                            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                from anywhere
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                            A web dashboard for controlling and monitoring your
                            Raspberry Pi rover. Live camera feed, real-time
                            telemetry, directional controls, and team chat — all
                            in one place.
                        </p>

                        <div className="mt-10 flex items-center justify-center gap-4">
                            {auth.user ? (
                                <Button size="lg" asChild>
                                    <Link href={dashboard()}>
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Button size="lg" asChild>
                                            <Link href={register()}>
                                                Get Started
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="border-t border-border/40 bg-muted/30">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Everything you need to operate
                            </h2>
                            <p className="mt-3 text-muted-foreground">
                                Full-featured rover operations dashboard with
                                real-time capabilities.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={
                                    <Gamepad2 className="size-5 text-blue-500" />
                                }
                                title="Directional Control"
                                description="D-pad with keyboard shortcuts (WASD + arrow keys). Adjustable speed control with real-time command feedback."
                            />
                            <FeatureCard
                                icon={
                                    <Camera className="size-5 text-purple-500" />
                                }
                                title="Live Camera Feed"
                                description="MJPEG stream from the Pi camera module, proxied through the server for remote access from any network."
                            />
                            <FeatureCard
                                icon={
                                    <Activity className="size-5 text-green-500" />
                                }
                                title="Real-time Telemetry"
                                description="GPS coordinates, battery level, temperature sensors, and accelerometer data streamed via WebSocket."
                            />
                            <FeatureCard
                                icon={
                                    <Battery className="size-5 text-yellow-500" />
                                }
                                title="Battery Monitoring"
                                description="Live voltage and percentage display with color-coded warnings and charging status indicators."
                            />
                            <FeatureCard
                                icon={
                                    <MessageCircle className="size-5 text-cyan-500" />
                                }
                                title="Team Chat"
                                description="Built-in real-time messaging for team coordination during rover operations and missions."
                            />
                            <FeatureCard
                                icon={
                                    <Shield className="size-5 text-orange-500" />
                                }
                                title="Secure API"
                                description="Token-based authentication for Pi communication. Generate and manage API tokens from the dashboard."
                            />
                        </div>
                    </div>
                </section>

                {/* Architecture Section */}
                <section className="border-t border-border/40">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Built for remote operations
                                </h2>
                                <p className="mt-4 text-muted-foreground">
                                    Your rover can be anywhere — different
                                    network, different country. The server
                                    proxies all communication so you just need a
                                    browser.
                                </p>
                                <ul className="mt-8 space-y-4">
                                    <ArchItem
                                        icon={
                                            <Radio className="size-4 text-primary" />
                                        }
                                        text="WebSocket real-time updates via Laravel Reverb"
                                    />
                                    <ArchItem
                                        icon={
                                            <MapPin className="size-4 text-primary" />
                                        }
                                        text="GPS tracking with satellite count and heading"
                                    />
                                    <ArchItem
                                        icon={
                                            <Zap className="size-4 text-primary" />
                                        }
                                        text="Commands delivered in under 100ms via polling"
                                    />
                                    <ArchItem
                                        icon={
                                            <Camera className="size-4 text-primary" />
                                        }
                                        text="Camera stream proxied through server for NAT traversal"
                                    />
                                </ul>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/50 p-8">
                                <pre className="text-sm leading-relaxed text-muted-foreground">
                                    <code>{`┌─────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │ WebSocket + HTTP
       │
┌──────▼───────┐
│    Server    │
│  (Laravel)   │
│  + Reverb    │
└──────┬───────┘
       │ REST API
       │
┌──────▼───────┐
│ Raspberry Pi │
│  + Camera    │
│  + Arduino   │
└──────┬───────┘
       │ Serial
       │
┌──────▼───────┐
│   Arduino    │
│  DC Motors   │
└──────────────┘`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/40 bg-muted/30">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Radio className="size-4" />
                            Rover Dashboard
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Built with Laravel, React &amp; Reverb
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
                {icon}
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function ArchItem({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <li className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                {icon}
            </div>
            <span className="text-sm">{text}</span>
        </li>
    );
}
