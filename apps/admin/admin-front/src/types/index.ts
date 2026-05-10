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

export const STATUS_CONFIG: Record<
    StatusCategoria,
    { label: string; cor: 'verde' | 'amarelo' | 'vermelho' | 'azul' }
> = {
    publicado: { label: 'Publicado', cor: 'verde' },
    rascunho: { label: 'Rascunho', cor: 'amarelo' },
    revisao: { label: 'Revisão', cor: 'vermelho' },
    arquivado: { label: 'Arquivado', cor: 'azul' },
};
