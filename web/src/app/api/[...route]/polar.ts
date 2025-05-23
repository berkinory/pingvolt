import { Hono } from 'hono';
import { Checkout, CustomerPortal, Webhooks } from '@polar-sh/hono';
import { Polar } from '@polar-sh/sdk';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { user as userTable } from '@/db/auth-schema';
import { createResponse, withAuth, withRateLimit } from './utils';

export const polarRoutes = new Hono();

function isOss() {
    return process.env.OSS_ENABLED === '1';
}

const server = 'production';

let polar: Polar | null = null;
if (!isOss()) {
    polar = new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        server: server,
    });
}

polarRoutes.get(
    '/checkout',
    withRateLimit(
        withAuth(async (c, _user) => {
            if (isOss()) {
                return createResponse(false, 'Payments are disabled in OSS');
            }

            const handler = Checkout({
                accessToken: process.env.POLAR_ACCESS_TOKEN!,
                successUrl: 'https://pingvolt.com/dashboard/success',
                server: server,
            });

            return handler(c);
        })
    )
);

polarRoutes.get(
    '/portal',
    withRateLimit(
        withAuth(async (c, user) => {
            if (isOss()) {
                return createResponse(false, 'Payments are disabled in OSS');
            }

            const handler = CustomerPortal({
                accessToken: process.env.POLAR_ACCESS_TOKEN!,
                server: server,
                getCustomerId: async () => {
                    try {
                        if (!polar)
                            throw new Error('Polar client not initialized');
                        const customer = await polar.customers.getExternal({
                            externalId: user.id,
                        });

                        return customer.id;
                    } catch (error) {
                        throw new Error(
                            `Customer not found: ${error as string}`
                        );
                    }
                },
            });

            return handler(c);
        })
    )
);

polarRoutes.post(
    '/webhook/polar',
    Webhooks({
        webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
        onSubscriptionUpdated: async (payload) => {
            const { currentPeriodEnd, customer } = payload.data;

            if (!customer?.externalId) {
                return;
            }

            await db
                .update(userTable)
                .set({
                    subscriptionExpiresAt: currentPeriodEnd
                        ? new Date(currentPeriodEnd)
                        : null,
                })
                .where(eq(userTable.id, customer.externalId));
        },
    })
);

polarRoutes.get(
    '/subscription',
    withRateLimit(
        withAuth(async (_c, user) => {
            try {
                if (isOss()) {
                    return createResponse(true, {
                        userId: user.id,
                        active: true,
                        expiresAt: '2099-12-30T00:00:00.000Z',
                    });
                }

                const currentUser = await db
                    .select()
                    .from(userTable)
                    .where(eq(userTable.id, user.id))
                    .then((res) => res[0]);

                if (!currentUser) {
                    return createResponse(false, 'User not found');
                }

                const now = new Date();
                const expiresAt = currentUser.subscriptionExpiresAt
                    ? new Date(currentUser.subscriptionExpiresAt)
                    : null;
                const userId = currentUser.id;
                const isActive = !!expiresAt && expiresAt > now;

                return createResponse(true, {
                    userId: userId,
                    active: isActive,
                    expiresAt: isActive ? expiresAt.toISOString() : null,
                });
            } catch (err) {
                return createResponse(
                    false,
                    'Server error',
                    (err as Error).message
                );
            }
        })
    )
);
