import { http } from './client';
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export const categoriasApi = {
    listar: () => http.get<Categoria[]>('/categories'),
    buscar: (id: string) => http.get<Categoria>(`/categories/${id}`),
    criar: (dto: CreateCategoriaDto) => http.post<Categoria>('/categories', dto),
    atualizar: (id: string, dto: UpdateCategoriaDto) =>
        http.patch<Categoria>(`/categories/${id}`, dto),
    remover: (id: string) => http.delete(`/categories/${id}`),
};
