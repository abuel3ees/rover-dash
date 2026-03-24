import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Download, Zap, Wifi, Terminal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

interface Step {
    number: number;
    title: string;
    description: string;
    details: string[];
    icon: React.ReactNode;
}

const steps: Step[] = [
    {
        number: 1,
        title: 'Get Raspberry Pi OS',
        description: 'Download and install the OS',
        icon: <Download className="size-5" />,
        details: [
            'Visit raspberrypi.org/software',
            'Download Raspberry Pi Imager',
            'Select Raspberry Pi 4/5 model',
            'Choose Raspberry Pi OS Lite (64-bit)',
            'Select your SD card (min 32GB)',
            'Write the image to SD card',
        ],
    },
    {
        number: 2,
        title: 'Power & Connect',
        description: 'Setup hardware connections',
        icon: <Zap className="size-5" />,
        details: [
            'Insert SD card into Raspberry Pi',
            'Connect USB-C power cable',
            'Connect Ethernet or WiFi',
            'Connect HDMI to monitor (optional)',
            'Connect keyboard & mouse (optional)',
            'Wait 2-3 minutes for first boot',
        ],
    },
    {
        number: 3,
        title: 'Network Setup',
        description: 'Configure network and find your Pi',
        icon: <Wifi className="size-5" />,
        details: [
            'Find Pi IP address: ping raspberrypi.local',
            'Or check your router for connected devices',
            'SSH into Pi: ssh pi@raspberrypi.local',
            'Default password: raspberry',
            'Run: sudo raspi-config',
            'Go to System > Hostname (set to "rover-01")',
        ],
    },
    {
        number: 4,
        title: 'System Updates',
        description: 'Update software packages',
        icon: <RotateCcw className="size-5" />,
        details: [
            'sudo apt update',
            'sudo apt upgrade -y',
            'sudo apt install -y git python3-pip',
            'sudo apt install -y libatlas-base-dev',
            'Reboot: sudo reboot',
        ],
    },
    {
        number: 5,
        title: 'Clone Repository',
        description: 'Get the rover control software',
        icon: <Terminal className="size-5" />,
        details: [
            'mkdir ~/rover && cd ~/rover',
            'git clone https://github.com/abuel3ees/rover-pi-client.git',
            'cd rover-pi-client',
            'python3 -m venv venv',
            'source venv/bin/activate',
            'pip install -r requirements.txt',
        ],
    },
    {
        number: 6,
        title: 'Configure Remote Dashboard',
        description: 'Setup connection to your web dashboard',
        icon: <Terminal className="size-5" />,
        details: [
            'Copy config template: cp config.example.py config.py',
            'Edit: nano config.py',
            'Set ROVER_NAME=rover-01',
            'Set DASHBOARD_URL=http://your-domain.com (or IP:port)',
            'Generate API token from dashboard settings',
            'Set API_TOKEN in config.py',
            'Save and exit (Ctrl+X, Y, Enter)',
        ],
    },
    {
        number: 7,
        title: 'Start Rover Client',
        description: 'Launch the rover and verify connection',
        icon: <Terminal className="size-5" />,
        details: [
            'python3 main.py',
            'Wait for "Connected to server" message',
            'Open your web dashboard and verify rover appears online',
            'Test controls: move forward/backward/left/right',
            'To run as service: sudo systemctl enable rover',
        ],
    },
];

function StepCard({ step, isExpanded, onToggle }: { step: Step; isExpanded: boolean; onToggle: () => void }) {
    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        {step.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">
                            Step {step.number}: {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="size-5 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronDown className="size-5 text-muted-foreground shrink-0" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                    <ul className="space-y-3">
                        {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className="leading-relaxed font-mono text-xs bg-background/50 px-2 py-1 rounded">{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function SetupPage() {
    const [expandedStep, setExpandedStep] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Rover Setup Guide</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Complete step-by-step instructions to set up your Raspberry Pi rover and connect it to the dashboard.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-12">
                    {steps.map((step) => (
                        <StepCard
                            key={step.number}
                            step={step}
                            isExpanded={expandedStep === step.number - 1}
                            onToggle={() => setExpandedStep(expandedStep === step.number - 1 ? null : step.number - 1)}
                        />
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
                    <p className="text-muted-foreground mb-6">
                        If you encounter any issues during setup, check the documentation or reach out to support.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="default" asChild>
                            <a href="https://github.com/abuel3ees/rover-pi-client" target="_blank" rel="noopener noreferrer">
                                GitHub Repository
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={dashboard()}>Back to Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
