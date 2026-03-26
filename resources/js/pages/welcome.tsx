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
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* Masthead Navigation */}
                <header className="border-b border-border bg-background">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Radio className="size-4 text-primary" />
                            <span className="font-serif text-base font-normal tracking-tight">
                                Rover Dashboard
                            </span>
                        </div>
                        <nav className="flex items-center gap-1">
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

                {/* Hero */}
                <section className="border-b border-border">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-32">
                        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Real-time rover control &amp; monitoring
                        </p>

                        <h1 className="max-w-3xl font-serif text-5xl font-normal leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                            Command your rover
                            <span className="block italic text-primary">
                                from anywhere.
                            </span>
                        </h1>

                        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
                            A web dashboard for controlling and monitoring your
                            Raspberry Pi rover. Live camera feed, real-time
                            telemetry, directional controls, and team chat — all
                            in one place.
                        </p>

                        <div className="mt-10 flex items-center gap-3">
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
                <section className="border-b border-border">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
                        <div className="mb-12 grid lg:grid-cols-3 lg:gap-16">
                            <div className="lg:col-span-1">
                                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    Capabilities
                                </p>
                                <h2 className="font-serif text-3xl font-normal leading-tight">
                                    Everything you need to operate
                                </h2>
                            </div>
                            <p className="mt-4 self-end text-sm leading-relaxed text-muted-foreground lg:col-span-2 lg:mt-0">
                                Full-featured rover operations dashboard with
                                real-time capabilities built for remote
                                missions.
                            </p>
                        </div>

                        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<Gamepad2 className="size-4" />}
                                title="Directional Control"
                                description="D-pad with keyboard shortcuts (WASD + arrow keys). Adjustable speed control with real-time command feedback."
                            />
                            <FeatureCard
                                icon={<Camera className="size-4" />}
                                title="Live Camera Feed"
                                description="MJPEG stream from the Pi camera module, proxied through the server for remote access from any network."
                            />
                            <FeatureCard
                                icon={<Activity className="size-4" />}
                                title="Real-time Telemetry"
                                description="GPS coordinates, battery level, temperature sensors, and accelerometer data streamed via WebSocket."
                            />
                            <FeatureCard
                                icon={<Battery className="size-4" />}
                                title="Battery Monitoring"
                                description="Live voltage and percentage display with color-coded warnings and charging status indicators."
                            />
                            <FeatureCard
                                icon={<MessageCircle className="size-4" />}
                                title="Team Chat"
                                description="Built-in real-time messaging for team coordination during rover operations and missions."
                            />
                            <FeatureCard
                                icon={<Shield className="size-4" />}
                                title="Secure API"
                                description="Token-based authentication for Pi communication. Generate and manage API tokens from the dashboard."
                            />
                        </div>
                    </div>
                </section>

                {/* Architecture Section */}
                <section className="border-b border-border">
                    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
                        <div className="grid items-start gap-12 lg:grid-cols-2">
                            <div>
                                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    Architecture
                                </p>
                                <h2 className="font-serif text-3xl font-normal leading-tight">
                                    Built for remote operations
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                    Your rover can be anywhere — different
                                    network, different country. The server
                                    proxies all communication so you just need a
                                    browser.
                                </p>
                                <ul className="mt-8 space-y-0 divide-y divide-border border-t border-border">
                                    <ArchItem
                                        icon={<Radio className="size-3.5 text-primary" />}
                                        text="WebSocket real-time updates via Laravel Reverb"
                                    />
                                    <ArchItem
                                        icon={<MapPin className="size-3.5 text-primary" />}
                                        text="GPS tracking with satellite count and heading"
                                    />
                                    <ArchItem
                                        icon={<Zap className="size-3.5 text-primary" />}
                                        text="Commands delivered in under 100ms via polling"
                                    />
                                    <ArchItem
                                        icon={<Camera className="size-3.5 text-primary" />}
                                        text="Camera stream proxied through server for NAT traversal"
                                    />
                                </ul>
                            </div>
                            <div className="border border-border bg-muted/50 p-8">
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
                <footer className="border-t border-border">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Radio className="size-3.5" />
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
        <div className="group bg-card p-6 transition-colors hover:bg-accent/30">
            <div className="mb-4 text-muted-foreground">{icon}</div>
            <h3 className="font-sans text-sm font-semibold tracking-wide">
                {title}
            </h3>
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
        <li className="flex items-center gap-3 py-3">
            {icon}
            <span className="text-sm">{text}</span>
        </li>
    );
}
