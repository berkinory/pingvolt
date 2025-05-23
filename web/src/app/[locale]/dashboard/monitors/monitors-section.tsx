'use client';

import { Clock, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useWebsites } from '@/lib/query/api-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type MonitorStatus = boolean | null;

interface StatusIndicatorProps {
    status: MonitorStatus;
}

interface MonitorInfoProps {
    intervalMinutes: number;
    lastUpdateTime: string;
    layout?: 'horizontal' | 'vertical';
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
    const statusColors = {
        up: 'bg-green-500',
        down: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    const getStatusColor = () => {
        if (status === true) return statusColors.up;
        if (status === false) return statusColors.down;
        return statusColors.warning;
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            <div
                className={cn(
                    'h-3 w-3 rounded-full transition-colors flex-shrink-0',
                    getStatusColor()
                )}
                aria-label={`Status: ${status === true ? 'Up' : status === false ? 'Down' : 'Warning'}`}
            />
            {status !== null && (
                <motion.div
                    className={cn(
                        'absolute rounded-full opacity-75',
                        status === true ? 'border-green-500' : 'border-red-500',
                        'border-2'
                    )}
                    initial={{ width: '100%', height: '100%', opacity: 0.5 }}
                    animate={{
                        width: ['100%', '150%', '100%'],
                        height: ['100%', '150%', '100%'],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </div>
    );
};

const MonitorInfo = ({
    intervalMinutes,
    lastUpdateTime,
    layout = 'vertical',
}: MonitorInfoProps) => {
    const t = useTranslations('Monitors');

    const minutesSinceUpdate = Math.floor(
        differenceInMinutes(new Date(), new Date(lastUpdateTime))
    );

    const timeDisplay =
        minutesSinceUpdate === 0 || minutesSinceUpdate === 1
            ? t('just-now')
            : formatDistanceToNow(new Date(lastUpdateTime), {
                  addSuffix: true,
              });

    if (layout === 'horizontal') {
        return (
            <div className="grid grid-cols-2 w-full gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>
                        {t('every-x-minutes', { minutes: intervalMinutes })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>{timeDisplay}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-1 text-left">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>
                    {t('every-x-minutes', { minutes: intervalMinutes })}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>{timeDisplay}</span>
            </div>
        </div>
    );
};

const truncateUrl = (url: string, maxLength = 30) => {
    if (url.length <= maxLength) return url;
    return `${url.substring(0, maxLength)}...`;
};

export function MonitorsSection() {
    const {
        data: websites,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useWebsites();
    const t = useTranslations('Monitors');
    const [isRateLimited, setIsRateLimited] = useState(false);
    const router = useRouter();

    const handleRowClick = (_id: number) => {
        router.push(`/dashboard/monitors/${_id}`);
    };

    const handleRefresh = () => {
        if (isRateLimited) return;

        refetch()
            .then(() => {
                toast.success(t('monitors-refreshed'));
            })
            .catch(() => {
                toast.error(t('refresh-error'));
            });

        setIsRateLimited(true);
        setTimeout(() => {
            setIsRateLimited(false);
        }, 10000);
    };

    if (isLoading) {
        return <MonitorsLoadingSkeleton />;
    }

    if (isError || !websites) {
        return (
            <div className="p-4 text-center text-red-500">
                {t('error-loading')}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                    {t('active-monitors')}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onMouseDown={handleRefresh}
                    disabled={isFetching || isRateLimited}
                    className="h-8 px-2"
                >
                    <RefreshCw
                        className={cn(
                            'h-4 w-4 mr-2',
                            isFetching && 'animate-spin'
                        )}
                    />
                    {t('refresh')}
                </Button>
            </div>
            {websites.length === 0 ? (
                <div className="rounded-md border p-4 text-center text-muted-foreground">
                    {t('no-monitors')}
                </div>
            ) : (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableBody>
                            {websites.map((website) => (
                                <TableRow
                                    key={website.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleRowClick(website.id)}
                                >
                                    <TableCell className="px-2 py-4 align-top md:px-4 md:align-middle">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-4 h-4">
                                                    <StatusIndicator
                                                        status={website.status}
                                                    />
                                                </div>
                                                <span
                                                    className="font-normal"
                                                    title={website.url}
                                                >
                                                    {truncateUrl(website.url)}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-4 text-sm text-muted-foreground md:hidden">
                                                <MonitorInfo
                                                    intervalMinutes={
                                                        website.interval
                                                    }
                                                    lastUpdateTime={
                                                        website.updatedAt
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="hidden px-2 py-4 align-middle text-sm text-muted-foreground md:table-cell md:px-4">
                                        <MonitorInfo
                                            intervalMinutes={website.interval}
                                            lastUpdateTime={website.updatedAt}
                                            layout="horizontal"
                                        />
                                    </TableCell>

                                    <TableCell className="w-10 px-2 py-4 text-right align-middle md:px-4">
                                        <div className="text-muted-foreground">
                                            <ChevronRight className="inline-block h-5 w-5 flex-shrink-0" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

function MonitorsLoadingSkeleton() {
    const t = useTranslations('Monitors');

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
                {t('active-monitors')}
            </h2>
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableBody>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell className="px-2 py-4 align-top md:px-4 md:align-middle">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center justify-center w-4 h-4">
                                                <Skeleton className="h-3 w-3 rounded-full flex-shrink-0" />
                                            </div>
                                            <Skeleton className="h-5 w-48" />
                                        </div>
                                        <div className="flex items-start gap-4 md:hidden">
                                            <Skeleton className="h-10 w-32" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden px-2 py-4 align-middle text-sm text-muted-foreground md:table-cell md:px-4">
                                    <div className="grid grid-cols-2 w-full gap-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="w-10 px-2 py-4 text-right align-middle md:px-4">
                                    <Skeleton className="ml-auto h-5 w-5 flex-shrink-0" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
