import { http } from './client';
import type { GamificationOverview, GamificationRecord } from '../types';

export type GamificationResource =
    | 'configs'
    | 'xp-rules'
    | 'achievements'
    | 'cosmetics'
    | 'missions'
    | 'seasons'
    | 'reward-tiers'
    | 'adaptive-rules';

export const gamificacaoApi = {
    overview: () => http.get<GamificationOverview>('/gamification/overview'),
    bootstrap: () => http.post<GamificationOverview>('/gamification/bootstrap', {}),
    create: (resource: GamificationResource, body: Record<string, unknown>) =>
        http.post<GamificationRecord>(`/gamification/${resource}`, body),
    update: (resource: GamificationResource, id: string, body: Record<string, unknown>) =>
        http.patch<GamificationRecord>(`/gamification/${resource}/${id}`, body),
    remove: (resource: GamificationResource, id: string) =>
        http.delete(`/gamification/${resource}/${id}`),
};
