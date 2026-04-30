import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rover Setup', href: '/rover/setup' },
];

export default function RoverSetup() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        stream_url: '',
        ip_address: '',
        stream_port: '8081',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/rover');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rover Setup" />
            <div className="mx-auto w-full max-w-2xl space-y-6 p-4">
                <Heading
                    title="Set Up Your Rover"
                    description="Register your Raspberry Pi rover to start controlling it from the dashboard."
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Rover Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="My Rover"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="A short description of your rover"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="ip_address">
                                Pi IP Address{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="ip_address"
                                value={data.ip_address}
                                onChange={(e) =>
                                    setData('ip_address', e.target.value)
                                }
                                placeholder="192.168.1.50"
                            />
                            <InputError message={errors.ip_address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stream_port">Stream Port</Label>
                            <Input
                                id="stream_port"
                                type="number"
                                value={data.stream_port}
                                onChange={(e) =>
                                    setData('stream_port', e.target.value)
                                }
                                placeholder="8081"
                            />
                            <InputError message={errors.stream_port} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="stream_url">
                            YouTube Stream URL{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="stream_url"
                            value={data.stream_url}
                            onChange={(e) =>
                                setData('stream_url', e.target.value)
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <InputError message={errors.stream_url} />
                        <p className="text-xs text-muted-foreground">
                            The YouTube Live watch URL or your channel URL.
                        </p>
                    </div>

                    <Button disabled={processing}>Create Rover</Button>
                </form>
            </div>
        </AppLayout>
    );
}
