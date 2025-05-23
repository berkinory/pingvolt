/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://openpanel.dev/op1.js unpkg.com/react-scan/dist/auto.global.js;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  connect-src 'self' https://op.mirac.dev;
  media-src 'self';
  worker-src 'self' blob:;
  img-src 'self' https://lh3.googleusercontent.com data:;
`;

const nextConfig = {
    devIndicators: false,
    reactStrictMode: true,
    compress: true,
    compiler: {
        removeConsole: {
            exclude: ['error', 'warn'],
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    poweredByHeader: false,
    images: {
        unoptimized: true,
    },
    headers: async () => {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: ContentSecurityPolicy.replace(
                            /\s{2,}/g,
                            ' '
                        ).trim(),
                    },
                ],
            },
        ];
    },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
