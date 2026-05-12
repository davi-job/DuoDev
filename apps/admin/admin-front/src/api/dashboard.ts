import { http } from './client';
import type { DashboardData } from '../types';

export const dashboardApi = {
    buscar: () => http.get<DashboardData>('/dashboard'),
};
