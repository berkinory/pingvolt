import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db/drizzle';
import * as schema from '@/db/auth-schema';
import { polar, portal, checkout, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';

let polarClient: Polar | null = null;
if (process.env.OSS_ENABLED !== '1') {
    polarClient = new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN,
        server: 'sandbox',
    });
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema,
    }),
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 10 * 60,
        },
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 60,
    },
    plugins: [
        ...(process.env.OSS_ENABLED !== '1' && polarClient
            ? [
                  polar({
                      client: polarClient,
                      createCustomerOnSignUp: true,
                      use: [
                        portal(),
                        checkout({
                            authenticatedUsersOnly: true,
                            successUrl: '/dashboard/success',
                        }),
                        webhooks({
                            secret: process.env.POLAR_WEBHOOK_SECRET!,
                        }),
                      ]
                  }),
              ]
            : []),
        nextCookies(),
    ],
});
