import { createDbConnection } from './db';
import { history, websites } from './schema';
import { sql } from 'drizzle-orm';

const STRINGS = {
    CHECK_PREFIX: 'checks:',
    ALERT_PREFIX: 'alert:',
    ERROR_DB:
        'Database operation failed, not deleting KV entries to prevent data loss:',
    ERROR_WORKER: 'Error in Aggregator Worker:',
    ERROR_TIMESTAMP: 'Invalid timestamp format:',
    ERROR_PARSING: 'Error parsing timestamp:',
    RESEND_API_URL: 'https://api.resend.com/emails',
};

const MAIL_FROM = 'Pingvolt Uptime <notifications@uptime.pingvolt.com>';

interface Env {
    DATABASE_URL: string;
    UPTIME_RESULTS: KVNamespace;
    RESEND_API_KEY: string;
}

interface CheckResult {
    id: number;
    url: string;
    mail: string | null;
    mailNotification: boolean;
    status: number | null;
    latency: number | null;

    timestamp: string;
}

function generateHtmlMail(url: string, timestamp: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Status Notification</title>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #FFFFFF; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
    h1 { font-size: 32px; color: #333; margin-bottom: 20px; }
    p { font-size: 16px; color: #555; line-height: 1.5; }
    .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #333333; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-size: 18px; }
    .footer { text-align: center; margin-top: 25px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
<div class="container">
  <h1 style="text-align: center;">Website Status Alert</h1>
  <p style="text-align: center;">We have detected that <strong>${url}</strong> is currently <span style="color: red; font-weight: bold;">unreachable</span> as of <strong>${timestamp}</strong>.</p>
  <p style="text-align: center;">If this notification does not concern you, feel free to disregard it.</p>
  <div style="text-align: center;">
    <a href="https://pingvolt.com/dashboard" class="button">View Uptime History</a>
  </div>
</div>
<div class="footer">
  &copy; 2025 Pingvolt. All rights reserved.
</div>
</body>
</html>
	`;
}

async function sendMail(
    env: Env,
    to: string,
    subject: string,
    text: string,
    html: string
): Promise<void> {
    try {
        const response = await fetch(STRINGS.RESEND_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: MAIL_FROM,
                to,
                subject,
                text,
                html,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to send email:', errorText);
        } else {
            console.log(`Email sent to ${to}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendMailsInBatches(
    env: Env,
    mailPayloads: { to: string; subject: string; text: string; html: string }[]
) {
    const BATCH_SIZE = 2;
    for (let i = 0; i < mailPayloads.length; i += BATCH_SIZE) {
        const batch = mailPayloads.slice(i, i + BATCH_SIZE);
        await Promise.all(
            batch.map((mail) =>
                sendMail(env, mail.to, mail.subject, mail.text, mail.html)
            )
        );
        await new Promise((res) => setTimeout(res, 1000));
    }
}

async function aggregateResults(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
): Promise<void> {
    try {
        const alertKeys = await env.UPTIME_RESULTS.list({
            prefix: STRINGS.ALERT_PREFIX,
        });
        for (const alertKey of alertKeys.keys) {
            const parts = alertKey.name.split(':');
            if (parts.length !== 3) continue;
            const websiteId = Number.parseInt(parts[1], 10);
            const alertTimestamp = Number.parseInt(parts[2], 10);
            if (Number.isNaN(websiteId) || Number.isNaN(alertTimestamp)) continue;

            if (Date.now() - alertTimestamp > 2 * 60 * 60 * 1000) {
                const websiteChecks = await env.UPTIME_RESULTS.list({
                    prefix: STRINGS.CHECK_PREFIX,
                });
                for (const checkKey of websiteChecks.keys) {
                    const checkResults = (await env.UPTIME_RESULTS.get(
                        checkKey.name,
                        'json'
                    )) as CheckResult[];
                    if (
                        checkResults.some(
                            (r) => r.id === websiteId && r.status === 200
                        )
                    ) {
                        await env.UPTIME_RESULTS.delete(alertKey.name);
                        console.log(`Deleted alert for website ${websiteId}`);
                        break;
                    }
                }
            }
        }

        const keys = await env.UPTIME_RESULTS.list({
            prefix: STRINGS.CHECK_PREFIX,
        });
        if (keys.keys.length === 0) return;

        const allResults: CheckResult[] = [];
        const processedKeys: string[] = [];
        const failedKeys: string[] = [];

        for (const key of keys.keys) {
            try {
                const results = (await env.UPTIME_RESULTS.get(
                    key.name,
                    'json'
                )) as CheckResult[];
                if (Array.isArray(results) && results.length > 0) {
                    allResults.push(...results);
                    processedKeys.push(key.name);
                } else failedKeys.push(key.name);
            } catch (_) {
                failedKeys.push(key.name);
            }
        }

        if (allResults.length === 0) return;

        const dbConnection = createDbConnection(env.DATABASE_URL);
        const db = dbConnection.db;
        try {
            const websiteIds = new Set<number>();
            const validWebsites = await db
                .select({ id: websites.id })
                .from(websites);
            for (const website of validWebsites) {
                websiteIds.add(website.id);
            }

            const validResults = allResults.filter((result) =>
                websiteIds.has(result.id)
            );

            const deletedWebsiteResults = allResults.filter(
                (result) => !websiteIds.has(result.id)
            );
            if (deletedWebsiteResults.length > 0) {
                console.log(
                    `Found ${deletedWebsiteResults.length} results for deleted websites, cleaning up KV entries`
                );

                const deletedWebsiteIds = new Set(
                    deletedWebsiteResults.map((r) => r.id)
                );
                for (const id of deletedWebsiteIds) {
                    const alertKeys = await env.UPTIME_RESULTS.list({
                        prefix: `${STRINGS.ALERT_PREFIX}${id}:`,
                    });
                    for (const key of alertKeys.keys) {
                        await env.UPTIME_RESULTS.delete(key.name);
                        console.log(`Deleted orphaned alert key: ${key.name}`);
                    }
                }
            }

            if (validResults.length === 0) {
                console.log(
                    'No valid website results to process after filtering'
                );
                for (const key of processedKeys) {
                    await env.UPTIME_RESULTS.delete(key);
                }
                return;
            }

            const historyEntries = validResults.map((result) => ({
                websiteId: result.id,
                timestamp: new Date(result.timestamp),
                status: result.status,
                latency: result.latency,
            }));
            await db.insert(history).values(historyEntries);

            const emailsToSend = [];

            for (const result of validResults) {
                if (
                    result.status !== 200 &&
                    result.mailNotification &&
                    result.mail
                ) {
                    const alertList = await env.UPTIME_RESULTS.list({
                        prefix: `${STRINGS.ALERT_PREFIX}${result.id}:`,
                    });
                    if (alertList.keys.length === 0) {
                        emailsToSend.push({
                            to: result.mail,
                            subject: 'Website is Down | Pingvolt',
                            text: `Pingvolt Monitor Alert: ${result.url} appears to be DOWN as of ${new Date().toISOString()}.`,
                            html: generateHtmlMail(
                                result.url,
                                new Date().toUTCString()
                            ),
                        });
                        const timestampNow = Date.now();
                        await env.UPTIME_RESULTS.put(
                            `${STRINGS.ALERT_PREFIX}${result.id}:${timestampNow}`,
                            '1'
                        );
                    }
                }
            }

            if (emailsToSend.length > 0) {
                await sendMailsInBatches(env, emailsToSend);
            }

            const latestTimestamps = new Map<number, Date>();
            const latestStatuses = new Map<number, number | null>();
            for (const entry of historyEntries) {
                const { websiteId, timestamp, status } = entry;
                if (
                    !latestTimestamps.has(websiteId) ||
                    timestamp > latestTimestamps.get(websiteId)!
                ) {
                    latestTimestamps.set(websiteId, timestamp);
                    latestStatuses.set(websiteId, status);
                }
            }

            if (latestTimestamps.size > 0) {
                const websiteIds = Array.from(latestTimestamps.keys());
                const timestampCases = websiteIds
                    .map(
                        (id) =>
                            `WHEN ${id} THEN '${latestTimestamps.get(id)!.toISOString().replace('T', ' ').substring(0, 19)}'::timestamp`
                    )
                    .join(' ');
                const statusCases = websiteIds
                    .map(
                        (id) =>
                            `WHEN ${id} THEN ${latestStatuses.get(id) === 200}`
                    )
                    .join(' ');
                await db.execute(sql`
					UPDATE websites
					SET updated_at = CASE id ${sql.raw(timestampCases)} END,
					status = CASE id ${sql.raw(statusCases)} END
					WHERE id IN (${sql.raw(websiteIds.join(','))})
				`);
            }

            if (processedKeys.length > 0) {
                await Promise.all(
                    processedKeys.map((key) => env.UPTIME_RESULTS.delete(key))
                );
            }
        } finally {
            await dbConnection.close();
        }
    } catch (error) {
        console.error(STRINGS.ERROR_WORKER, error);
    }
}

export default {
    async scheduled(
        controller: ScheduledController,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        return aggregateResults(controller, env, ctx);
    },
} satisfies ExportedHandler<Env>;
