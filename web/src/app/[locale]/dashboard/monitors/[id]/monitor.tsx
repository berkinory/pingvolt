'use client';

import { useParams } from 'next/navigation';
import { Link } from '@/components/Link';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useWebsiteHistory } from '@/lib/query/api-queries';
import { cn } from '@/lib/utils';
import { MonitorStatus } from './monitor-status';
import { useState } from 'react';
import { toast } from 'sonner';

export function Monitor() {
    const params = useParams();
    const websiteId = typeof params.id === 'string' ? Number(params.id) : null;
    const { data, isLoading, refetch, isFetching } =
        useWebsiteHistory(websiteId);
    const t = useTranslations('MonitorDetail');
    const [isRateLimited, setIsRateLimited] = useState(false);

    const handleToggleActive = () => {
        // TODO
    };

    const handleRefresh = () => {
        if (isRateLimited) return;

        refetch()
            .then(() => {
                toast.success(t('refreshed'));
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
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-10" />
                    </div>
                </div>
                <MonitorStatus isLoading={true} />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-8">Monitor not found</div>;
    }

    const { website } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        asChild
                    >
                        <Link href="/dashboard/monitors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onMouseDown={handleRefresh}
                        disabled={isFetching || isRateLimited}
                        className="h-8 px-2"
                    >
                        <RefreshCw
                            className={cn(
                                'h-4 w-4',
                                isFetching && 'animate-spin'
                            )}
                        />
                    </Button>
                    <Switch
                        id="monitor-active"
                        checked={website.isActive}
                        onCheckedChange={handleToggleActive}
                        className={cn(
                            'data-[state=checked]:bg-green-500',
                            'data-[state=unchecked]:bg-gray-300'
                        )}
                    />
                </div>
            </div>
            <MonitorStatus website={website} />
        </div>
    );
}
