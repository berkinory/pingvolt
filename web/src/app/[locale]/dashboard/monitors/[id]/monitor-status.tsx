'use client';

import { useTranslations } from 'next-intl';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

type MonitorStatus = boolean | null;

interface StatusIndicatorProps {
    status: MonitorStatus;
}

interface MonitorStatusProps {
    website?: {
        status: MonitorStatus;
        updatedAt: string;
        isActive: boolean;
    };
    isLoading?: boolean;
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

export function MonitorStatus({
    website,
    isLoading = false,
}: MonitorStatusProps) {
    const t = useTranslations('MonitorDetail');

    if (isLoading || !website) {
        return <StatusCardSkeleton />;
    }

    const lastCheckTime = website.updatedAt;

    const minutesSinceUpdate = Math.floor(
        differenceInMinutes(new Date(), new Date(lastCheckTime))
    );

    const timeDisplay =
        minutesSinceUpdate === 0 || minutesSinceUpdate === 1
            ? t('just-now')
            : formatDistanceToNow(new Date(lastCheckTime), {
                  addSuffix: true,
              });

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6">
                            <StatusIndicator status={website.status} />
                        </div>
                        <div>
                            <div className="font-medium">
                                {t('website-status')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {website.status === null
                                    ? t('status-waiting')
                                    : website.status
                                      ? t('status-up')
                                      : t('status-down')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <div>
                            <div className="font-medium">{t('last-check')}</div>
                            <div className="text-sm text-muted-foreground">
                                {timeDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusCardSkeleton() {
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
