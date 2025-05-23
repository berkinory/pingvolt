import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Subscription Success - PingVolt',
    description: 'Your subscription has been successfully activated',
};

export default function SubscriptionSuccessPage() {
    const t = useTranslations('Payment.Successful');
    return (
        <div className="container max-w-3xl py-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    {t('Title')}
                </h1>
                <p className="text-muted-foreground max-w-md">
                    {t('Description')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-center">
                        {t('BenefitTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span>
                                <span className="font-medium">
                                    {t('Benefit1')}
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span>
                                <span className="font-medium">
                                    {t('Benefit2')}
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span>
                                <span className="font-medium">
                                    {t('Benefit3')}
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <span>
                                <span className="font-medium">
                                    {t('Benefit4')}
                                </span>
                            </span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/monitors">
                            {t('GetStarted')}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
                <p>{t('Need-help')}</p>
            </div>
        </div>
    );
}
