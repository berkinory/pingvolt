'use client';

import { useTranslations } from 'next-intl';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/client';
import { useSubscription } from '@/lib/query/api-queries';

export function BillingSection() {
    const t = useTranslations('Billing');
    const locale = useLocale();
    const { data, isLoading, error } = useSubscription();

    if (isLoading) {
        return <BillingSkeletonLoader />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <p className="text-destructive">{t('Error')}</p>
                <Button
                    variant="outline"
                    onMouseDown={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    const isActive = data?.active || false;
    const expiresAt = data?.expiresAt ? new Date(data.expiresAt) : null;

    const handleCheckout = async () => {
        try {
            await authClient.checkout({
                products: ['c6cf1605-07b5-4659-97eb-0490e8802a80', '4aa492c7-65db-4a8a-b36f-bca29a74b5ef'],
            });
        } catch (error) {
            console.error('Checkout failed:', error);
        }
    };

    const handlePortal = async () => {
        try {
            await authClient.customer.portal();
        } catch (error) {
            console.error('Portal access failed:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {t('Title')}
                </h1>
            </div>

            <div className="grid gap-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{t('Status')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <Badge
                                    variant={isActive ? 'default' : 'outline'}
                                >
                                    {isActive
                                        ? t('PremiumTitle')
                                        : t('FreeTitle')}
                                </Badge>
                                {expiresAt && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t('ExpiresOn')}{' '}
                                        {new Intl.DateTimeFormat(locale).format(
                                            expiresAt
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {!isActive && (
                                    <Button onMouseDown={handleCheckout}>
                                        {t('UpgradeNow')}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onMouseDown={handlePortal}
                                >
                                    {t('ManageSubscription')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>{t('FreeTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
                                    <span>{t('Free1')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
                                    <span>{t('Free2')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
                                    <span>{t('Free3')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
                                    <span>{t('Free4')}</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>{t('PremiumTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                    <span>{t('Premium1')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                    <span>{t('Premium2')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                    <span>{t('Premium3')}</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                    <span>{t('Premium4')}</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BillingSkeletonLoader() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
            </div>

            <div className="grid gap-6">
                <Card className="w-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <Skeleton className="h-6 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="w-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
