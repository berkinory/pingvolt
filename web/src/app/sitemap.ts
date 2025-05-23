import type { MetadataRoute } from 'next';
import { seoConfig, getLocaleUrl } from '@/components/seo/seo.config';

const routes = [
    {
        path: '/',
        priority: 1.0,
        changeFrequency: 'weekly' as const,
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = routes.flatMap((route) =>
        seoConfig.site.locales.map((locale) => ({
            url: getLocaleUrl(locale, route.path),
            lastModified: new Date(),
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        }))
    );

    return [...staticRoutes];
}
