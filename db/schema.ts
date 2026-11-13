import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const store=sqliteTable('community_store',{id:text('id').primaryKey(),revision:integer('revision').notNull().default(0),payload:text('payload').notNull(),updatedAt:text('updated_at').notNull()});
export const chunks=sqliteTable('community_chunks',{id:integer('id').primaryKey(),payload:text('payload').notNull()});
