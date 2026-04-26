import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const blogPosts = pgTable('blog_post', {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    tag: varchar('tag', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    thumbColor: varchar('thumb_color', { length: 50 }).notNull(),
    publishedAt: timestamp('published_at'),
});
