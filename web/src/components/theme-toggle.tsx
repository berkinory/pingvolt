'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme, useThemeActions } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const currentTheme = useTheme();
    const { setTheme } = useThemeActions();

    const toggleTheme = () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onMouseDown={toggleTheme}
            aria-label="Toggle theme"
            className="relative grid place-items-center"
        >
            <div className="relative h-[1.2rem] w-[1.2rem] grid place-items-center">
                <Moon
                    className={cn(
                        'absolute transition-transform duration-200 animate-in',
                        currentTheme === 'dark'
                            ? 'rotate-0 scale-100'
                            : 'rotate-45 scale-0'
                    )}
                />
                <Sun
                    className={cn(
                        'absolute transition-transform duration-200 animate-in',
                        currentTheme === 'dark'
                            ? '-rotate-45 scale-0'
                            : 'rotate-0 scale-100'
                    )}
                />
            </div>
        </Button>
    );
}
