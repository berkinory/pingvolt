import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localeDetection: true,
    localePrefix: 'never',
});

const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.includes(route)
    );

    if (isProtectedRoute) {
        const sessionCookie = getSessionCookie(request);

        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*|not-found).*)'],
};
