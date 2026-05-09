export type StatusCategoria = 'publicado' | 'rascunho' | 'revisao' | 'arquivado';

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
