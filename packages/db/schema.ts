import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const tabelaCategorias = pgTable('categoria', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nome: varchar({ length: 255 }).notNull(),
    descricao: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 15 }).notNull().default('rascunho'),
});

export const tabelaTrilhas = pgTable('trilha', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    id_categoria: integer()
        .notNull()
        .references(() => tabelaCategorias.id),
    nome: varchar({ length: 255 }).notNull(),
    descricao: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 15 }).notNull().default('rascunho'),
});
