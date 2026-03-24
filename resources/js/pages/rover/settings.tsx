import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Copy, Eye, EyeOff, Key, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Rover } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rover Settings', href: '/rover/settings' },
];

export default function RoverSettings({
    rover,
    hasToken,
}: {
    rover: Rover;
    hasToken: boolean;
}) {
    const { flash } = usePage<{ flash: { token?: string } }>().props;
    const [showToken, setShowToken] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            name: rover.name,
            description: rover.description ?? '',
            stream_url: rover.stream_url ?? '',
            ip_address: rover.ip_address ?? '',
            stream_port: String(rover.stream_port ?? '8081'),
        });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/rover');
    }

    function generateToken() {
        router.post('/rover/token');
    }

    function revokeToken() {
        router.delete('/rover/token');
    }

    function deleteRover() {
        router.delete('/rover');
    }

    function copyToken() {
        if (flash?.token) {
            navigator.clipboard.writeText(flash.token);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rover Settings" />
            <div className="mx-auto w-full max-w-2xl space-y-6 p-4">
                <Heading
                    title="Rover Settings"
                    description="Manage your rover configuration and API access."
                />

                {/* Rover Config Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>
                            Update your rover's connection details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Rover Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Description
                                </Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="ip_address">
                                        Pi IP Address
                                    </Label>
                                    <Input
                                        id="ip_address"
                                        value={data.ip_address}
                                        onChange={(e) =>
                                            setData(
                                                'ip_address',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="192.168.1.50"
                                    />
                                    <InputError message={errors.ip_address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="stream_port">
                                        Stream Port
                                    </Label>
                                    <Input
                                        id="stream_port"
                                        type="number"
                                        value={data.stream_port}
                                        onChange={(e) =>
                                            setData(
                                                'stream_port',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.stream_port} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stream_url">
                                    Camera Stream URL
                                </Label>
                                <Input
                                    id="stream_url"
                                    value={data.stream_url}
                                    onChange={(e) =>
                                        setData('stream_url', e.target.value)
                                    }
                                    placeholder="http://192.168.1.50:8081/stream.mjpg"
                                />
                                <InputError message={errors.stream_url} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save</Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        Saved
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* API Token Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="size-5" />
                            API Token
                        </CardTitle>
                        <CardDescription>
                            Generate an API token for your Raspberry Pi to
                            authenticate with the server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {flash?.token && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                                <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
                                    Token generated! Copy it now — it
                                    won't be shown again.
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 rounded bg-green-100 px-3 py-2 font-mono text-xs dark:bg-green-900">
                                        {showToken
                                            ? flash.token
                                            : '•'.repeat(40)}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowToken(!showToken)
                                        }
                                    >
                                        {showToken ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToken}
                                    >
                                        <Copy className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={generateToken}
                            >
                                <Key className="mr-1 size-4" />
                                {hasToken
                                    ? 'Regenerate Token'
                                    : 'Generate Token'}
                            </Button>
                            {hasToken && (
                                <Button
                                    variant="destructive"
                                    onClick={revokeToken}
                                >
                                    Revoke Token
                                </Button>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Use this token in your Pi script with the header:{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                                Authorization: Bearer {'<token>'}
                            </code>
                        </p>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Permanently delete this rover and all its data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-2">
                                <p className="text-sm">Are you sure?</p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteRover}
                                >
                                    Yes, delete rover
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowDeleteConfirm(false)
                                    }
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="mr-1 size-4" />
                                Delete Rover
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
