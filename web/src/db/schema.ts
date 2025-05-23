import {
    pgTable,
    serial,
    text,
    timestamp,
    boolean,
    index,
    uniqueIndex,
    smallint,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const websites = pgTable(
    'websites',
    {
        id: serial('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        mail: text('mail'),
        mailNotification: boolean('mail_notification').notNull().default(false),
        url: text('url').notNull(),
        interval: smallint('interval').notNull().default(3),
        updatedAt: timestamp('updated_at', { precision: 0 })
            .notNull()
            .defaultNow(),
        status: boolean('status'),
        isActive: boolean('is_active').notNull().default(true),
    },
    (table) => ({
        userIdIdx: index('user_id_idx').on(table.userId),
        checkDueIdx: index('check_due_idx').on(
            table.isActive,
            table.updatedAt,
            table.interval
        ),
        uniqueUserUrlIdx: uniqueIndex('unique_user_url_idx').on(
            table.userId,
            table.url
        ),
    })
);

export const history = pgTable(
    'history',
    {
        id: serial('id').primaryKey(),
        websiteId: smallint('website_id')
            .notNull()
            .references(() => websites.id, { onDelete: 'cascade' }),
        timestamp: timestamp('timestamp', { precision: 0 })
            .notNull()
            .defaultNow(),
        status: smallint('status'),
        latency: smallint('latency'),
    },
    (table) => ({
        websiteIdIdx: index('website_id_idx').on(table.websiteId),
    })
);

export type Website = typeof websites.$inferSelect;
export type NewWebsite = typeof websites.$inferInsert;

export type History = typeof history.$inferSelect;
export type NewHistory = typeof history.$inferInsert;
