import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { websites, history } from '@/db/schema';
import { createResponse, withRateLimit, withAuth } from './utils';

export const websiteRoutes = new Hono();

websiteRoutes.get(
    '/websites',
    withRateLimit(
        withAuth(async (_c, user) => {
            try {
                const userWebsites = await db
                    .select()
                    .from(websites)
                    .where(eq(websites.userId, user.id));

                return createResponse(true, userWebsites);
            } catch (error) {
                return createResponse(
                    false,
                    `Server error: ${error as string}`
                );
            }
        })
    )
);

websiteRoutes.get(
    '/history/:id',
    withRateLimit(
        withAuth(async (c, user) => {
            try {
                const id = Number(c.req.param('id'));
                if (Number.isNaN(id))
                    return createResponse(false, 'Invalid website ID');

                const website = await db
                    .select()
                    .from(websites)
                    .where(eq(websites.id, id))
                    .then((res) => res[0]);

                if (!website || website.userId !== user.id) {
                    return createResponse(
                        false,
                        'Unauthorized or Website not found'
                    );
                }

                const websiteHistory = await db
                    .select()
                    .from(history)
                    .where(eq(history.websiteId, id));

                return createResponse(true, {
                    website,
                    history: websiteHistory,
                });
            } catch (error) {
                return createResponse(
                    false,
                    `Server error: ${error as string}`
                );
            }
        })
    )
);
