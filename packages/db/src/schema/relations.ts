import { relations } from 'drizzle-orm';
import { users } from './users';
import { legacyUsers } from './legacy-user';
import { userInterests } from './user-interests';
import { userLanguages } from './user-languages';
import { userTrails } from './user-trails';
import { streakLogs } from './streak-logs';
import { blogPosts } from './blog-posts';
import { trails } from './trails';
import { categories } from './categories';
import { lessons } from './lessons';
import { questions } from './questions';
import { challenges } from './challenges';

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

export const categoriesRelations = relations(categories, ({ many }) => ({
    trails: many(trails),
}));

export const trailsRelations = relations(trails, ({ one, many }) => ({
    category: one(categories, { fields: [trails.categoryId], references: [categories.id] }),
    userTrails: many(userTrails),
    lessons: many(lessons),
    questions: many(questions),
    challenges: many(challenges),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
    trail: one(trails, { fields: [lessons.trailId], references: [trails.id] }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
    trail: one(trails, { fields: [questions.trailId], references: [trails.id] }),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
    trail: one(trails, { fields: [challenges.trailId], references: [trails.id] }),
}));

export const userTrailsRelations = relations(userTrails, ({ one }) => ({
    user: one(legacyUsers, { fields: [userTrails.userId], references: [legacyUsers.id] }),
    trail: one(trails, { fields: [userTrails.trailId], references: [trails.id] }),
}));

export const streakLogsRelations = relations(streakLogs, ({ one }) => ({
    user: one(legacyUsers, { fields: [streakLogs.userId], references: [legacyUsers.id] }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
    author: one(legacyUsers, { fields: [blogPosts.authorId], references: [legacyUsers.id] }),
}));
