import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { auth } from '@/lib/auth';

import type { User } from '@/db/auth-schema';
import type { Context, Env, Schema } from 'hono';

let ratelimit: Ratelimit | null = null;

export function createResponse<T>(ok: true, data: T): Response;
export function createResponse(
    ok: false,
    error: string,
    message?: string
): Response;
export function createResponse<T>(
    ok: boolean,
    dataOrError: T | string,
    message?: string
): Response {
    if (ok) {
        return Response.json({
            success: true,
            data: dataOrError,
        });
    }
    return Response.json({
        success: false,
        error: dataOrError,
        message,
    });
}

export function withRateLimit(
    handler: (c: Context<Env, string, Schema>) => Promise<Response>
) {
    return async (c: Context<Env, string, Schema>) => {
        if (process.env.OSS_ENABLED === '1') {
            return handler(c);
        }

        if (!ratelimit) {
            ratelimit = new Ratelimit({
                redis: Redis.fromEnv(),
                limiter: Ratelimit.slidingWindow(25, '60 s'),
            });
        }

        const ip = c.req.raw.headers.get('x-forwarded-for') || 'api';
        const { success, limit, reset, remaining } = await ratelimit.limit(ip);

        c.header('X-RateLimit-Limit', limit.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', reset.toString());

        if (!success) {
            return createResponse(
                false,
                'Too many requests',
                'Please try again later.'
            );
        }

        return handler(c);
    };
}

export function withAuth(
    handler: (c: Context<Env, string, Schema>, user: User) => Promise<Response>
) {
    return async (c: Context<Env, string, Schema>) => {
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });
        if (!session?.user) {
            return createResponse(
                false,
                'Unauthorized',
                'You do not have access to this resource.'
            );
        }

        return handler(c, session.user as unknown as User);
    };
}
