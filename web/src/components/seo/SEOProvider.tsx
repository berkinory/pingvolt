'use client';

import { usePathname } from '@/i18n/navigation';
import { seoConfig, getLocaleUrl } from '@/components/seo/seo.config';
import { useEffect } from 'react';

interface SEOProviderProps {
    children: React.ReactNode;
    locale: string;
}

export default function SEOProvider({ children, locale }: SEOProviderProps) {
    const pathname = usePathname();
    const fullUrl = getLocaleUrl(locale, pathname);

    useEffect(() => {
        if (document?.documentElement) {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    return (
        <>
            <link rel="canonical" href={fullUrl} />

            {seoConfig.site.locales.length > 1 && (
                <>
                    {seoConfig.site.locales.map((loc) => (
                        <link
                            key={loc}
                            rel="alternate"
                            hrefLang={loc}
                            href={getLocaleUrl(loc, pathname)}
                        />
                    ))}
                    <link
                        rel="alternate"
                        hrefLang="x-default"
                        href={getLocaleUrl(
                            seoConfig.site.defaultLocale,
                            pathname
                        )}
                    />
                </>
            )}

            {children}
        </>
    );
}
