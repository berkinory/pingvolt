import './globals.css';
import { ThemeProvider } from '@/lib/theme';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { OpenPanelComponent } from '@openpanel/nextjs';
import { Toaster } from '@/components/ui/sonner';
import type React from 'react';

export const metadata: Metadata = {
    icons: {
        icon: '/favicon.ico',
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning className={GeistSans.className}>
            {process.env.NODE_ENV === 'development' && (
                <head>
                    <script
                        async
                        crossOrigin="anonymous"
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                    />
                </head>
            )}
            <body>
                <Toaster position="top-right" duration={4000} />
                {process.env.OSS_ENABLED === '0' && (
                    <OpenPanelComponent
                        clientId="9438a011-7847-4970-b752-5d24c0bccd02"
                        apiUrl="/api/op"
                        cdnUrl="/op1.js"
                        trackScreenViews={true}
                        trackOutgoingLinks={true}
                    />
                )}
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
