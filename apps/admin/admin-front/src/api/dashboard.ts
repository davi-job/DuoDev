import { http } from './client';
import type { DashboardData, TrilhasRankingResponse } from '../types';

export const dashboardApi = {
    buscar: () => http.get<DashboardData>('/dashboard'),
    trilhasPorUsuarios: (pagina: number, ordem: 'asc' | 'desc') =>
        http.get<TrilhasRankingResponse>(`/dashboard/trilhas-por-usuarios?pagina=${pagina}&ordem=${ordem}`),
};
