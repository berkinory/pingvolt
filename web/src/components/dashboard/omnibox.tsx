'use client';

import * as React from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/Link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
    createSidebarData,
    type NavItem,
} from '@/components/dashboard/app-sidebar';

interface OmniboxProps {
    className?: string;
}

type SearchItem = {
    title: string;
    url: string;
    icon: React.ElementType;
    description?: string;
    keywords?: string[];
};

const getSearchItems = (
    t: ReturnType<typeof useTranslations>
): SearchItem[] => {
    const sidebarData = createSidebarData(t);
    const navItems: SearchItem[] = [];

    for (const item of sidebarData.navMain) {
        navItems.push({
            ...item,
            description: item.title,
        });
    }

    for (const item of sidebarData.navSecondary) {
        navItems.push({
            ...item,
            description: item.title,
        });
    }

    return navItems;
};

export function Omnibox({ className }: OmniboxProps) {
    const t = useTranslations('Navigation');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const searchItems = React.useMemo(() => getSearchItems(t), [t]);

    const filteredResults = React.useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase().trim();

        return searchItems.filter((item) => {
            if (item.title.toLowerCase().includes(query)) return true;

            if (item.description?.toLowerCase().includes(query)) return true;

            if (
                item.keywords?.some((keyword) =>
                    keyword.toLowerCase().includes(query)
                )
            )
                return true;

            return false;
        });
    }, [searchItems, searchQuery]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                if (isOpen) {
                    setSearchQuery('');
                }
            }

            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleTriggerButtonMouseDown = React.useCallback(() => {
        setIsOpen(true);
    }, []);

    const staticSearchIconElement = React.useMemo(() => {
        return (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
            </div>
        );
    }, []);

    const omniboxFooterElement = React.useMemo(() => {
        return (
            <div className="p-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <Command className="h-3 w-3" />
                        <span>+</span>
                        <span>K</span>
                        <span>{t('To-toggle-search')}</span>
                    </div>
                    <div>
                        <span>ESC {t('Esc-to-close')}</span>
                    </div>
                </div>
            </div>
        );
    }, [t]);

    const triggerButtonElement = React.useMemo(() => {
        return (
            <Button
                variant="outline"
                size="default"
                className={cn(
                    'hidden md:flex items-center gap-2 justify-between w-full bg-background/60 border-muted-foreground/20 hover:bg-accent hover:text-accent-foreground',
                    className
                )}
                onMouseDown={handleTriggerButtonMouseDown}
            >
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>{t('Search')}</span>
                </div>
                <div className="flex items-center gap-1 border rounded px-1.5 py-0.5 text-xs bg-muted">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                </div>
            </Button>
        );
    }, [className, t, handleTriggerButtonMouseDown]);

    return (
        <>
            {triggerButtonElement}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <motion.div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onMouseDown={() => {
                                setIsOpen(false);
                                setSearchQuery('');
                            }}
                        />

                        <motion.div
                            className="relative z-50 w-full max-w-lg rounded-lg border bg-card shadow-lg"
                            initial={{ opacity: 0, y: -20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.96 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300,
                            }}
                        >
                            <div className="relative">
                                {staticSearchIconElement}
                                <Input
                                    ref={searchInputRef}
                                    type="search"
                                    placeholder={t('Search')}
                                    className="h-12 pl-9 pr-4 w-full bg-transparent rounded-t-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-0 border-b"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    maxLength={20}
                                />
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {filteredResults.length > 0 ? (
                                        <motion.div
                                            key="results"
                                            className="text-sm space-y-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {filteredResults.map(
                                                (item, index) => (
                                                    <motion.div
                                                        key={item.title}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                            delay: index * 0.1,
                                                        }}
                                                    >
                                                        <Link
                                                            href={item.url}
                                                            className="flex items-start gap-2 p-3 hover:bg-muted rounded-md"
                                                            onMouseDown={() => {
                                                                setIsOpen(
                                                                    false
                                                                );
                                                                setSearchQuery(
                                                                    ''
                                                                );
                                                            }}
                                                        >
                                                            <div className="mt-0.5 bg-muted rounded">
                                                                <item.icon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {item.title}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                )
                                            )}
                                        </motion.div>
                                    ) : searchQuery ? (
                                        <motion.div
                                            key="no-results"
                                            className="p-4 text-sm text-muted-foreground text-center"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {t('No-results-found-for')} "
                                            {searchQuery}"
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            className="p-4 text-sm text-muted-foreground text-center"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {t(
                                                'Type-to-search-across-the-pages'
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {omniboxFooterElement}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
