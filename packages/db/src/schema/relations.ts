import { relations } from 'drizzle-orm';
import { users } from './users';
import { userInterests } from './user-interests';
import { userLanguages } from './user-languages';
import { userTrails } from './user-trails';
import { streakLogs } from './streak-logs';
import { blogPosts } from './blog-posts';
import { trails } from './trails';

export const usersRelations = relations(users, ({ many }) => ({
    interests: many(userInterests),
    languages: many(userLanguages),
    trails: many(userTrails),
    streakLogs: many(streakLogs),
    blogPosts: many(blogPosts),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
    user: one(users, { fields: [userInterests.userId], references: [users.id] }),
}));

export const userLanguagesRelations = relations(userLanguages, ({ one }) => ({
    user: one(users, { fields: [userLanguages.userId], references: [users.id] }),
}));

export const trailsRelations = relations(trails, ({ many }) => ({
    userTrails: many(userTrails),
}));

export const userTrailsRelations = relations(userTrails, ({ one }) => ({
    user: one(users, { fields: [userTrails.userId], references: [users.id] }),
    trail: one(trails, { fields: [userTrails.trailId], references: [trails.id] }),
}));

export const streakLogsRelations = relations(streakLogs, ({ one }) => ({
    user: one(users, { fields: [streakLogs.userId], references: [users.id] }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
    author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));
