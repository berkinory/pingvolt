import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import {
    seoConfig,
    getLocaleMetadata,
    getStaticOpenGraph,
    getGoogleVerification,
    getTwitterCard,
} from '@/components/seo/seo.config';
import SEOProvider from '@/components/seo/SEOProvider';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const { locale } = resolvedParams;
    const validLocale = hasLocale(routing.locales, locale)
        ? locale
        : seoConfig.site.defaultLocale;
    const { title, description, keywords } = getLocaleMetadata(validLocale);
    const openGraph = getStaticOpenGraph(validLocale);
    const googleVerification = getGoogleVerification();
    const twitterCard = getTwitterCard();

    return {
        metadataBase: new URL(seoConfig.site.url || 'http://localhost:3000'),
        title,
        description,
        keywords: keywords.join(', '),
        openGraph: { ...openGraph, title, description, locale: validLocale },
        twitter: {
            ...twitterCard,
            title,
            description,
            images: openGraph.images,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-video-preview': -1,
                'max-snippet': -1,
            },
        },
        ...(googleVerification && {
            verification: { google: googleVerification },
        }),
        html: { lang: validLocale },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const { locale } = resolvedParams;
    if (!hasLocale(routing.locales, locale)) notFound();

    return (
        <NextIntlClientProvider>
            <SEOProvider locale={locale}>{children}</SEOProvider>
        </NextIntlClientProvider>
    );
}
