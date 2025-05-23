import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/components/Link';
import StructuredData from '@/components/seo/StructuredData';
import { seoConfig } from '@/components/seo/seo.config';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';

export default async function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Landing');

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoConfig.site.name,
        url: seoConfig.site.url || 'http://localhost:3000',
        inLanguage: locale,
    };

    return (
        <>
            <StructuredData data={structuredData} />
            <div className="fixed top-4 right-4 flex gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
            <main className="min-h-screen flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h1 className="text-4xl font-bold mb-6">{t('Title')}</h1>
                    <p className="text-xl max-w-lg opacity-80 mb-8">
                        {t('Subtitle')}
                    </p>
                    <div className="flex gap-4">
                        <Link href="/auth" prefetch={false}>
                            <Button
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                                track={{ name: 'CTA' }}
                            >
                                {t('Get-started')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}
