import { Radio } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Radio className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate font-serif text-base font-normal leading-tight tracking-tight">
                    Rover
                </span>
                <span className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Dashboard
                </span>
            </div>
        </>
    );
}
