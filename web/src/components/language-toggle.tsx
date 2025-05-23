'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { useIsMobile } from '@/components/hooks/use-mobile';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LOCALE_LABELS: Record<string, string> = {
    en: 'English',
};

export function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useIsMobile();

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" aria-label="Change language">
                    <div className="flex items-center gap-1">
                        <Languages className="h-[1.2rem] w-[1.2rem]" />
                        {!isMobile && (
                            <span className="text-sm font-medium">
                                {LOCALE_LABELS[locale]}
                            </span>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {routing.locales.map((l) => (
                    <DropdownMenuItem
                        key={l}
                        onMouseDown={() => handleLocaleChange(l)}
                        className="cursor-pointer"
                    >
                        {LOCALE_LABELS[l]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
