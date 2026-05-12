import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { categories, trails } from '@duodev/db';
import type { DB } from '@duodev/db';

const POR_PAGINA = 10;

@Injectable()
export class DashboardService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async getDashboard() {
        const totaisResult = await this.db.execute(sql`
            select
                (select count(*)::int from "categories") as categorias,
                (select count(*)::int from "trails")     as trilhas,
                (select count(*)::int from "lessons")    as aulas,
                (select count(*)::int from "questions")  as questoes,
                (select count(*)::int from "challenges") as desafios
        `);
        const totais = totaisResult.rows[0] as {
            categorias: number;
            trilhas: number;
            aulas: number;
            questoes: number;
            desafios: number;
        };

        const catStatusRows = await this.db
            .select({
                status: categories.status,
                total: sql<number>`count(*)`.mapWith(Number),
            })
            .from(categories)
            .groupBy(categories.status);

        const trailStatusRows = await this.db
            .select({
                status: trails.status,
                total: sql<number>`count(*)`.mapWith(Number),
            })
            .from(trails)
            .groupBy(trails.status);

        const conteudoStatusResult = await this.db.execute(sql`
            select status, count(*)::int as total
            from (
                select status from "lessons"
                union all
                select status from "questions"
                union all
                select status from "challenges"
            ) c
            group by status
        `);

        const trilhasPorCategoriaBase = await this.db
            .select({
                id: categories.id,
                nome: categories.name,
                thumbColor: categories.thumbColor,
                icon: categories.icon,
                totalTrilhas: sql<number>`(
                    select count(*) from "trails"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
                totalConteudo: sql<number>`(
                    select count(*) from "lessons"
                    inner join "trails" on "lessons"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                ) + (
                    select count(*) from "questions"
                    inner join "trails" on "questions"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                ) + (
                    select count(*) from "challenges"
                    inner join "trails" on "challenges"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
            })
            .from(categories)
            .orderBy(categories.name);

        const [trilhaStatusPorCatResult, conteudoStatusPorCatResult] = await Promise.all([
            this.db.execute(sql`
                select category_id, status, count(*)::int as total
                from "trails"
                group by category_id, status
            `),
            this.db.execute(sql`
                select t.category_id, c.status, count(*)::int as total
                from (
                    select trail_id, status from "lessons"
                    union all
                    select trail_id, status from "questions"
                    union all
                    select trail_id, status from "challenges"
                ) c
                inner join "trails" t on c.trail_id = t.id
                group by t.category_id, c.status
            `),
        ]);

        type StatusRow = { category_id: string; status: string; total: number };
        const emptyStatus = () => ({ publicado: 0, rascunho: 0, revisao: 0, arquivado: 0 });

        const buildStatusMap = (rows: StatusRow[]) => {
            const map: Record<string, Record<string, number>> = {};
            for (const r of rows) {
                if (!map[r.category_id]) map[r.category_id] = emptyStatus();
                map[r.category_id][r.status] = r.total;
            }
            return map;
        };

        const trilhaStatusMap = buildStatusMap(trilhaStatusPorCatResult.rows as StatusRow[]);
        const conteudoStatusMap = buildStatusMap(conteudoStatusPorCatResult.rows as StatusRow[]);

        const trilhasPorCategoria = trilhasPorCategoriaBase.map((cat) => ({
            ...cat,
            trilhasPorStatus: trilhaStatusMap[cat.id] ?? emptyStatus(),
            conteudoPorStatus: conteudoStatusMap[cat.id] ?? emptyStatus(),
        }));

        const ultimoConteudoResult = await this.db.execute(sql`
            select u.id, u.title, u.tipo, u.status, u.created_at, t.name as trail_name
            from (
                select id, title, 'aula' as tipo, status, created_at, trail_id
                from "lessons"
                union all
                select id, title, 'questao' as tipo, status, created_at, trail_id
                from "questions"
                union all
                select id, title, 'desafio' as tipo, status, created_at, trail_id
                from "challenges"
            ) u
            inner join "trails" t on u.trail_id = t.id
            order by u.created_at desc
            limit 10
        `);

        const toStatusObj = (rows: { status: string; total: number }[]) => {
            const obj: Record<string, number> = { publicado: 0, rascunho: 0, revisao: 0, arquivado: 0 };
            rows.forEach((r) => { obj[r.status] = r.total; });
            return obj;
        };

        return {
            totais,
            categoriasPorStatus: toStatusObj(catStatusRows),
            trilhasPorStatus: toStatusObj(trailStatusRows),
            conteudoPorStatus: toStatusObj(
                (conteudoStatusResult.rows as { status: string; total: number }[])
            ),
            trilhasPorCategoria,
            ultimoConteudo: ultimoConteudoResult.rows,
        };
    }

    async getTrilhasPorUsuarios(pagina: number, ordem: 'asc' | 'desc') {
        const offset = (pagina - 1) * POR_PAGINA;

        const [totalResult, rowsResult] = await Promise.all([
            this.db.execute(sql`
                select count(*)::int as total from "trails"
            `),
            ordem === 'asc'
                ? this.db.execute(sql`
                    select
                        t.id,
                        t.name as nome,
                        c.name as categoria_nome,
                        t.thumb_color,
                        count(ut.id)::int as total_usuarios,
                        coalesce(round(avg(ut.progress_pct))::int, 0) as progresso_medio
                    from "trails" t
                    left join "categories" c on t.category_id = c.id
                    left join "user_trail" ut on ut.trail_id = t.id
                    group by t.id, t.name, c.name, t.thumb_color
                    order by total_usuarios asc, t.name asc
                    limit ${POR_PAGINA} offset ${offset}
                `)
                : this.db.execute(sql`
                    select
                        t.id,
                        t.name as nome,
                        c.name as categoria_nome,
                        t.thumb_color,
                        count(ut.id)::int as total_usuarios,
                        coalesce(round(avg(ut.progress_pct))::int, 0) as progresso_medio
                    from "trails" t
                    left join "categories" c on t.category_id = c.id
                    left join "user_trail" ut on ut.trail_id = t.id
                    group by t.id, t.name, c.name, t.thumb_color
                    order by total_usuarios desc, t.name asc
                    limit ${POR_PAGINA} offset ${offset}
                `),
        ]);

        const total = (totalResult.rows[0] as { total: number }).total;

        return {
            data: rowsResult.rows as {
                id: string;
                nome: string;
                categoria_nome: string | null;
                thumb_color: string;
                total_usuarios: number;
                progresso_medio: number;
            }[],
            pagina,
            porPagina: POR_PAGINA,
            total,
            totalPaginas: Math.ceil(total / POR_PAGINA),
        };
    }
}
