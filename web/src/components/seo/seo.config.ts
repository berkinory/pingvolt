type LocaleMetadata = {
    title: string;
    description: string;
    keywords: string[];
};

type LocaleMetadataMap = {
    [locale: string]: LocaleMetadata;
};

export const seoConfig = {
    site: {
        name: 'Pingvolt',
        url: process.env.NEXT_PUBLIC_URL,
        defaultLocale: 'en',
        locales: ['en'],
        publisher: 'berkinory',
        author: {
            name: 'berkinory',
            url: 'mirac.dev',
        },
    },

    localeMetadata: {
        en: {
            title: 'Pingvolt | Modern Website Uptime & API Monitoring',
            description:
                'Monitor your websites & API endpoints with Pingvolt. Real-time alerts, uptime tracking, performance monitoring, downtime notifications.',
            keywords: [
                'uptime',
                'monitor',
                'heartbeat',
                'track',
                'ping',
                'alert',
                'monitoring',
                'website monitoring',
                'api monitoring',
                'downtime alerts',
                'performance monitoring',
            ],
        },
    } as LocaleMetadataMap,

    openGraph: {
        images: [
            {
                url: '/og.webp',
                width: 1200,
                height: 630,
                alt: 'Pingvolt',
            },
        ],
        type: 'website',
        siteName: 'Pingvolt',
    },

    twitter: {
        card: 'summary_large_image',
        site: '@berkinory',
        creator: '@berkinory',
    },

    verifications: {
        google: '',
    },
};

export function getSiteUrl(path = ''): string {
    return `${seoConfig.site.url}${path}`;
}

export function getLocaleUrl(locale: string, path = ''): string {
    const localePath =
        locale !== seoConfig.site.defaultLocale ? `/${locale}` : '';
    const pathSegment =
        path && path !== '/'
            ? `${path.startsWith('/') ? path : `/${path}`}`
            : '';
    return `${seoConfig.site.url}${localePath}${pathSegment}`;
}

export function getLocaleMetadata(locale: string) {
    const defaultLocale = seoConfig.site.defaultLocale;
    const metadata =
        seoConfig.localeMetadata[locale] ||
        seoConfig.localeMetadata[defaultLocale];

    return {
        title: metadata?.title || seoConfig.site.name,
        description: metadata?.description || '',
        keywords: metadata?.keywords || [],
    };
}

export function getGoogleVerification() {
    return seoConfig.verifications.google || null;
}

export function getStaticOpenGraph(locale: string) {
    return {
        ...seoConfig.openGraph,
        locale,
        twitter: seoConfig.twitter,
    };
}

export function getTwitterCard() {
    return seoConfig.twitter;
}

export type SeoConfig = typeof seoConfig;
