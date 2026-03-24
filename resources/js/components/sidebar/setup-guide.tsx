import { ChevronDown, ChevronUp, Download, Zap, Wifi, Terminal, RotateCcw } from 'lucide-react';
import { useState } from 'react';

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
        icon: <Download className="size-4" />,
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
        icon: <Zap className="size-4" />,
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
        description: 'Configure WiFi & hostname',
        icon: <Wifi className="size-4" />,
        details: [
            'Find Pi IP address: ping raspberrypi.local',
            'Or check your router for connected devices',
            'SSH into Pi: ssh pi@raspberrypi.local',
            'Default password: raspberry',
            'Run: sudo raspi-config',
            'Go to System > Hostname (set to "rover-01")',
            'Go to Localisation > WiFi country',
        ],
    },
    {
        number: 4,
        title: 'System Updates',
        description: 'Update software packages',
        icon: <RotateCcw className="size-4" />,
        details: [
            'sudo apt update',
            'sudo apt upgrade -y',
            'sudo apt install -y git python3-pip',
            'sudo apt install -y libatlas-base-dev',
            'sudo apt install -y libjasper-dev',
            'Reboot: sudo reboot',
        ],
    },
    {
        number: 5,
        title: 'Clone Repository',
        description: 'Get the rover control software',
        icon: <Terminal className="size-4" />,
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
        title: 'Configure Rover',
        description: 'Setup rover connection details',
        icon: <Terminal className="size-4" />,
        details: [
            'Copy config template: cp config.example.py config.py',
            'Edit: nano config.py',
            'Set ROVER_NAME=rover-01',
            'Set API_URL=http://your-server-ip:8000/api',
            'Set API_TOKEN from dashboard settings',
            'Save and exit (Ctrl+X, Y, Enter)',
        ],
    },
    {
        number: 7,
        title: 'Start Service',
        description: 'Run the rover control daemon',
        icon: <Zap className="size-4" />,
        details: [
            'cd ~/rover/rover-pi-client',
            'source venv/bin/activate',
            'python3 main.py',
            'Watch for "Connected to server" message',
            'Check dashboard for rover status',
            'To run as service: sudo systemctl enable rover',
        ],
    },
    {
        number: 8,
        title: 'Test & Monitor',
        description: 'Verify everything is working',
        icon: <Terminal className="size-4" />,
        details: [
            'Open Rover Dashboard in browser',
            'Select your rover from the list',
            'Check telemetry data streaming',
            'Test a simple movement command',
            'Monitor system stats in real-time',
            'Check logs: journalctl -u rover -f',
        ],
    },
];

function StepCard({ step, isExpanded, onToggle }: { step: Step; isExpanded: boolean; onToggle: () => void }) {
    return (
        <div className="overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm shrink-0 mt-0.5">
                    {step.number}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? (
                        <ChevronUp className="size-4" />
                    ) : (
                        <ChevronDown className="size-4" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-border/30 px-4 py-3 bg-muted/20">
                    <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                            <li key={idx} className="flex gap-2 text-xs text-muted-foreground">
                                <span className="text-primary/60 font-mono shrink-0">→</span>
                                <span className="font-mono leading-relaxed">{detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function SetupGuide() {
    const [expandedStep, setExpandedStep] = useState<number | null>(1);

    return (
        <div className="space-y-3">
            <div className="space-y-1 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">Setup Guide</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Step-by-step Raspberry Pi setup for rover control
                </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {steps.map((step) => (
                    <StepCard
                        key={step.number}
                        step={step}
                        isExpanded={expandedStep === step.number}
                        onToggle={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                    />
                ))}
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-semibold">💡 Pro Tip</p>
                <p>Automate deployment with: bash setup.sh from the repository</p>
            </div>
        </div>
    );
}
