import { http } from './client';
import type { Trilha, CreateTrilhaDto, UpdateTrilhaDto } from '../types';

export const trilhasApi = {
    listar: (categoryId: string) => http.get<Trilha[]>(`/trails?categoryId=${categoryId}`),
    buscar: (id: string) => http.get<Trilha>(`/trails/${id}`),
    criar: (dto: CreateTrilhaDto) => http.post<Trilha>('/trails', dto),
    atualizar: (id: string, dto: UpdateTrilhaDto) =>
        http.patch<Trilha>(`/trails/${id}`, dto),
    remover: (id: string) => http.delete(`/trails/${id}`),
};
