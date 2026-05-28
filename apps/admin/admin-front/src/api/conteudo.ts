import { http } from './client';
import type {
    ItemConteudo,
    Aula,
    Questao,
    Desafio,
    CreateAulaDto,
    CreateQuestaoDto,
    CreateDesafioDto,
    ReorderItemDto,
} from '../types';

type UpdateAulaDto = Partial<Omit<CreateAulaDto, 'trailId' | 'order'>>;
type UpdateQuestaoDto = Partial<Omit<CreateQuestaoDto, 'trailId' | 'order'>>;
type UpdateDesafioDto = Partial<Omit<CreateDesafioDto, 'trailId' | 'order'>>;

export const conteudoApi = {
    listar: (trailId: string) =>
        http.get<ItemConteudo[]>(`/content/${trailId}`),

    reordenar: (trailId: string, items: ReorderItemDto[]) =>
        http.patch<ItemConteudo[]>(`/content/${trailId}/reorder`, { items }),

    criarAula: (dto: CreateAulaDto) =>
        http.post<Aula>('/content/lessons', dto),
    atualizarAula: (id: string, dto: UpdateAulaDto) =>
        http.patch<Aula>(`/content/lessons/${id}`, dto),
    removerAula: (id: string) =>
        http.delete(`/content/lessons/${id}`),

    criarQuestao: (dto: CreateQuestaoDto) =>
        http.post<Questao>('/content/questions', dto),
    atualizarQuestao: (id: string, dto: UpdateQuestaoDto) =>
        http.patch<Questao>(`/content/questions/${id}`, dto),
    removerQuestao: (id: string) =>
        http.delete(`/content/questions/${id}`),

    criarDesafio: (dto: CreateDesafioDto) =>
        http.post<Desafio>('/content/challenges', dto),
    atualizarDesafio: (id: string, dto: UpdateDesafioDto) =>
        http.patch<Desafio>(`/content/challenges/${id}`, dto),
    removerDesafio: (id: string) =>
        http.delete(`/content/challenges/${id}`),
};
