import { http } from './client';

export interface ImportResultado {
    criados: { categorias: number; trilhas: number; aulas: number; questoes: number; desafios: number };
    pulados: { categorias: number };
}

export const exportImportApi = {
    exportar: () => http.get<unknown>('/export'),
    importar: (data: { categories: unknown[] }) => http.post<ImportResultado>('/import', data),
};
