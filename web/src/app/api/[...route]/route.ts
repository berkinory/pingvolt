import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { polarRoutes } from './polar';
import { websiteRoutes } from './website';
import { createNextRouteHandler } from '@openpanel/nextjs/server';

export const dynamic = 'force-dynamic';

const app = new Hono().basePath('/api');

const openPanelHandler = createNextRouteHandler({
    apiUrl: 'https://op.mirac.dev/api',
});

app.post('/op/*', async (c) => {
    const response = await openPanelHandler(c.req.raw);
    return response;
});

app.route('/', polarRoutes);
app.route('/', websiteRoutes);

export const GET = handle(app);
export const POST = handle(app);
