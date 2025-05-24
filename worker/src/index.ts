import { createDbConnection } from './db';
import { type Website, websites } from './schema';
import { and, sql } from 'drizzle-orm';

export interface Env {
    DATABASE_URL: string;
    UPTIME_QUEUE: Queue;
    UPTIME_RESULTS: KVNamespace;
}

function chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
}

interface UptimeCheckMessage {
    websites: {
        id: number;
        url: string;
        mail: string | null;
        mailNotification: boolean;
    }[];
    timestamp: string;
}

const STRINGS = {
    CHECK_PREFIX: 'checks:',
    USER_AGENTS: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3 Pingvolt Uptime',
    ],
    ERROR_TIMEOUT: 'Worker timeout reached - forcing completion',
    ERROR_KV_STORE: 'Error storing results in KV:',
    ERROR_BATCH: 'Error processing batch:',
    ERROR_WORKER: 'Error in Dispatcher Worker:',
};

function getRandomUserAgent(): string {
    const agents = STRINGS.USER_AGENTS;
    return agents[Math.floor(Math.random() * agents.length)];
}

const ERROR_CODES = {
    UNKNOWN: -1,
    TIMEOUT: -2,
    DNS_ERROR: -3,
    CONNECTION_REFUSED: -4,
    TLS_ERROR: -5,
    NETWORK_ERROR: -6,
    FETCH_ABORT: -7,
    TOO_MANY_REDIRECTS: -8,
    INVALID_REDIRECT_LOCATION: -9,
    UNSUPPORTED_PROTOCOL: -10,
};

function shouldRetry(status: number): boolean {
    return [
        ERROR_CODES.TIMEOUT,
        ERROR_CODES.DNS_ERROR,
        ERROR_CODES.CONNECTION_REFUSED,
        ERROR_CODES.TLS_ERROR,
        ERROR_CODES.NETWORK_ERROR,
        ERROR_CODES.FETCH_ABORT,
        ERROR_CODES.UNKNOWN,
    ].includes(status);
}

async function scheduledFunction(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
): Promise<void> {
    const dbConnection = createDbConnection(env.DATABASE_URL);
    const db = dbConnection.db;
    const startTime = Date.now();

    try {
        const eligibleWebsites = await db
            .select()
            .from(websites)
            .where(
                and(
                    sql`${websites.isActive} = true`,
                    sql`${websites.updatedAt} <= NOW() - (interval '1 minute' * ${websites.interval}) + interval '40 seconds'`
                )
            )
            .orderBy(websites.updatedAt);

        const websitesToCheck = eligibleWebsites.map((website: Website) => ({
            id: website.id,
            url: website.url,
            mail: website.mail,
            mailNotification: website.mailNotification,
        }));

        if (websitesToCheck.length === 0) {
            ctx.waitUntil(
                Promise.all([
                    dbConnection.close(),
                    Promise.resolve(console.log('No websites to check'))
                ])
            );
            return;
        }

        const batches = chunk(websitesToCheck, 5);
        const timestamp = new Date().toISOString();

        const queuePromises = batches.map(async (batch, index) => {
            const message: UptimeCheckMessage = {
                websites: batch,
                timestamp,
            };

            try {
                await env.UPTIME_QUEUE.send(message);
                return true;
            } catch (error) {
                console.error(`Failed to send batch ${index + 1}:`, error);
                return false;
            }
        });

        const results = await Promise.all(queuePromises);
        
        ctx.waitUntil(
            Promise.all([
                dbConnection.close(),
                Promise.resolve().then(() => {
                    const executionTime = Date.now() - startTime;
                    const successCount = results.filter(Boolean).length;
                    console.log(`Scheduler completed: ${successCount}/${results.length} batches sent in ${executionTime}ms`);
                }),
            ])
        );

    } catch (error) {
        console.error(STRINGS.ERROR_WORKER, error);
        
        ctx.waitUntil(dbConnection.close());
    }
}

async function performCheck(url: string): Promise<number> {
    let currentUrl = url;
    let redirects = 0;
    const timeoutMs = 15000;
    const signal = AbortSignal.timeout(timeoutMs);

    while (redirects < 8) {
        const response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'User-Agent': getRandomUserAgent(),
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
            },
            signal,
        });

        const code = response.status;
        if (![301, 302, 303, 307, 308].includes(code)) return code;

        const location = response.headers.get('location');
        if (!location) return ERROR_CODES.INVALID_REDIRECT_LOCATION;

        try {
            currentUrl = new URL(location, currentUrl).toString();
        } catch (_) {
            return ERROR_CODES.INVALID_REDIRECT_LOCATION;
        }

        redirects++;
    }

    return redirects >= 7
        ? ERROR_CODES.TOO_MANY_REDIRECTS
        : ERROR_CODES.UNKNOWN;
}

async function runCheckWithRetry(url: string): Promise<number> {
    let status: number;

    try {
        status = await performCheck(url);
    } catch (error) {
        status = parseErrorCode(error);
    }

    if (status !== 200 && shouldRetry(status)) {
        await new Promise((res) => setTimeout(res, 5000));

        try {
            status = await performCheck(url);
        } catch (error) {
            status = parseErrorCode(error);
        }
    }

    return status;
}

function parseErrorCode(error: unknown): number {
    if (error instanceof DOMException && error.name === 'AbortError')
        return ERROR_CODES.TIMEOUT;
    if (error instanceof TypeError) {
        const msg = error.message.toLowerCase();
        if (msg.includes('dns')) return ERROR_CODES.DNS_ERROR;
        if (msg.includes('connection refused') || msg.includes('econnrefused'))
            return ERROR_CODES.CONNECTION_REFUSED;
        if (
            msg.includes('ssl') ||
            msg.includes('certificate') ||
            msg.includes('tls')
        )
            return ERROR_CODES.TLS_ERROR;
        if (msg.includes('network') || msg.includes('fetch'))
            return ERROR_CODES.NETWORK_ERROR;
        if (msg.includes('unsupported protocol'))
            return ERROR_CODES.UNSUPPORTED_PROTOCOL;
    }
    return ERROR_CODES.UNKNOWN;
}

async function queue(
    batch: MessageBatch<unknown>,
    env: Env,
    ctx: ExecutionContext
): Promise<void> {
    const startTime = Date.now();
    const workerTimeout = setTimeout(() => {
        console.error(STRINGS.ERROR_TIMEOUT);
    }, 40000);

    const processedMessages: { success: number; failed: number } = { success: 0, failed: 0 };

    for (const message of batch.messages) {
        try {
            const { websites, timestamp } = message.body as UptimeCheckMessage;
            const results = await Promise.all(
                websites.map(async (website) => {
                    const checkStartTime = Date.now();
                    const status = await runCheckWithRetry(website.url);
                    const latency = Date.now() - checkStartTime;
                    const responseTimestamp = new Date().toISOString();

                    return {
                        id: website.id,
                        url: website.url,
                        mail: website.mail,
                        mailNotification: website.mailNotification,
                        status,
                        latency,
                        timestamp: responseTimestamp,
                    };
                })
            );

            if (results.length > 0) {
                const key = `${STRINGS.CHECK_PREFIX}${timestamp}:${crypto.randomUUID()}`;
                await env.UPTIME_RESULTS.put(key, JSON.stringify(results), {
                    expirationTtl: 300,
                });
            }

            message.ack();
            processedMessages.success++;
        } catch (err) {
            console.error(STRINGS.ERROR_BATCH, err);
            message.retry();
            processedMessages.failed++;
        }
    }

    clearTimeout(workerTimeout);
    
    ctx.waitUntil(
        Promise.resolve().then(() => {
            const executionTime = Date.now() - startTime;
            console.log(
                `Queue worker completed: ${processedMessages.success} successful, ${processedMessages.failed} failed, ${batch.messages.length} total in ${executionTime}ms`
            );
        })
    );
}

export default {
    async scheduled(
        controller: ScheduledController,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        return scheduledFunction(controller, env, ctx);
    },

    async queue(
        batch: MessageBatch<unknown>,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        return queue(batch, env, ctx);
    },
} satisfies ExportedHandler<Env>;
