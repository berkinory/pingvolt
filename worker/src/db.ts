import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export function createDbConnection(connectionString: string) {
    const client = postgres(connectionString, {
        max: 3,
        fetch_types: false,
    });

    const db = drizzle(client, { schema });

    return {
        db,
        close: async () => {
            try {
                await client.end?.();
            } catch (_e) {
                console.log('Connection closed with cleanup');
            }
        },
    };
}
