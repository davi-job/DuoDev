export type StatusCategoria = 'publicado' | 'rascunho' | 'revisao' | 'arquivado';
export type StatusTrilha = 'publicado' | 'rascunho' | 'revisao' | 'arquivado';
export type NivelTrilha = 'iniciante' | 'intermediário' | 'avançado';

export interface Categoria {
    id: string;
    name: string;
    description: string | null;
    status: StatusCategoria;
    icon: string | null;
    thumbColor: string;
    duration: string | null;
    totalHours: number | null;
    totalTrails: number;
    totalLessons: number;
    totalQuestions: number;
    totalChallenges: number;
    createdAt: string;
    updatedAt: string;
}

export interface Trilha {
    id: string;
    categoryId: string;
    name: string;
    level: string;
    description: string;
    thumbColor: string;
    duration: string | null;
    totalHours: number | null;
    year: number | null;
    status: StatusTrilha;
    totalLessons: number;
    totalQuestions: number;
    totalChallenges: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTrilhaDto {
    categoryId: string;
    name: string;
    level: string;
    description: string;
    thumbColor: string;
    duration?: string;
    totalHours?: number;
    year?: number;
    status?: StatusTrilha;
}

export interface UpdateTrilhaDto extends Partial<Omit<CreateTrilhaDto, 'categoryId'>> {}

export interface CreateCategoriaDto {
    name: string;
    description?: string;
    status?: StatusCategoria;
    icon?: string;
    thumbColor: string;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {}

export type TipoConteudo = 'aula' | 'questao' | 'desafio';

export interface LessonElement {
    id: string;
    type: 'texto' | 'imagem';
    content: string;
    order: number;
}
export type StatusConteudo = 'publicado' | 'rascunho' | 'arquivado';

export interface Alternative {
    id: string;
    text: string;
}

export interface Aula {
    id: string;
    trailId: string;
    order: number;
    title: string;
    elements: LessonElement[];
    status: StatusConteudo;
    createdAt: string;
    updatedAt: string;
    type: 'aula';
}

export interface Questao {
    id: string;
    trailId: string;
    order: number;
    title: string;
    description: string | null;
    alternatives: Alternative[];
    answer: string;
    status: StatusConteudo;
    createdAt: string;
    updatedAt: string;
    type: 'questao';
}

export interface Desafio {
    id: string;
    trailId: string;
    order: number;
    title: string;
    description: string | null;
    instructions: string | null;
    status: StatusConteudo;
    createdAt: string;
    updatedAt: string;
    type: 'desafio';
}

export type ItemConteudo = Aula | Questao | Desafio;

export interface CreateAulaDto {
    trailId: string;
    order: number;
    title: string;
    elements: LessonElement[];
    status?: StatusConteudo;
}

export interface CreateQuestaoDto {
    trailId: string;
    order: number;
    title: string;
    description?: string;
    alternatives: Alternative[];
    answer: string;
    status?: StatusConteudo;
}

export interface CreateDesafioDto {
    trailId: string;
    order: number;
    title: string;
    description?: string;
    instructions?: string;
    status?: StatusConteudo;
}

export interface ReorderItemDto {
    id: string;
    type: TipoConteudo;
    order: number;
}

export interface DashboardTotais {
    categorias: number;
    trilhas: number;
    aulas: number;
    questoes: number;
    desafios: number;
}

export interface StatusCount {
    publicado: number;
    rascunho: number;
    revisao: number;
    arquivado: number;
}

export interface CategoriaDashboard {
    id: string;
    nome: string;
    thumbColor: string;
    icon: string | null;
    totalTrilhas: number;
    totalConteudo: number;
    trilhasPorStatus: StatusCount;
    conteudoPorStatus: StatusCount;
}

export interface UltimoConteudoItem {
    id: string;
    title: string;
    tipo: TipoConteudo;
    status: string;
    created_at: string;
    trail_name: string;
}

export interface TrilhaRankingItem {
    id: string;
    nome: string;
    categoria_nome: string | null;
    thumb_color: string;
    total_usuarios: number;
    progresso_medio: number;
}

export interface TrilhasRankingResponse {
    data: TrilhaRankingItem[];
    pagina: number;
    porPagina: number;
    total: number;
    totalPaginas: number;
}

export interface DashboardData {
    totais: DashboardTotais;
    categoriasPorStatus: StatusCount;
    trilhasPorStatus: StatusCount;
    conteudoPorStatus: StatusCount;
    trilhasPorCategoria: CategoriaDashboard[];
    ultimoConteudo: UltimoConteudoItem[];
}

export const STATUS_CONFIG: Record<
    StatusCategoria,
    { label: string; cor: 'verde' | 'amarelo' | 'vermelho' | 'azul' }
> = {
    publicado: { label: 'Publicado', cor: 'verde' },
    rascunho: { label: 'Rascunho', cor: 'amarelo' },
    revisao: { label: 'Revisão', cor: 'vermelho' },
    arquivado: { label: 'Arquivado', cor: 'azul' },
};
