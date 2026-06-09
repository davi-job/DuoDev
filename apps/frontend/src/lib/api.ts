import type {
  GamificationNotification,
  LearningTrailContentResponse,
  LearningTrailSummary,
  UserProfile,
  SeasonLeaderboardHistoryResponse,
  RankingUserDetail,
  WeeklyLeaderboardResponse,
  WeeklyRewardHistoryEntry,
} from '../components/interfaces/interfaces'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8010'

function getToken(): string {
  return localStorage.getItem('access_token') ?? ''
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

// ── Trilhas ──
export async function fetchTrilhas() {
  const res = await fetch(`${API_URL}/trilhas`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar trilhas')
  return res.json()
}

export async function fetchLearningTrails(): Promise<LearningTrailSummary[]> {
  const res = await fetch(`${API_URL}/learning/trails`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar trilhas publicadas')
  return res.json()
}

export async function fetchLearningTrail(trailId: string): Promise<LearningTrailSummary> {
  const res = await fetch(`${API_URL}/learning/trails/${trailId}`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar detalhes da trilha')
  return res.json()
}

export async function fetchLearningTrailContent(trailId: string): Promise<LearningTrailContentResponse> {
  const res = await fetch(`${API_URL}/learning/trails/${trailId}/content`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar conteúdo da trilha')
  return res.json()
}

// ── Progresso do usuário nas trilhas ──
export async function fetchMeuProgresso() {
  const res = await fetch(`${API_URL}/usuario-trilhas/meu-progresso`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar progresso')
  return res.json()
}

export async function startTrail(trailId: string) {
  const res = await fetch(`${API_URL}/usuario-trilhas/${trailId}/iniciar`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Erro ao iniciar trilha')
  return res.json()
}

export async function completeLesson(trailId: string, lessonId: string) {
  const res = await fetch(`${API_URL}/usuario-trilhas/${trailId}/aulas/${lessonId}/concluir`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Erro ao concluir aula')
  return res.json()
}

export async function completeChallenge(trailId: string, challengeId: string) {
  const res = await fetch(`${API_URL}/usuario-trilhas/${trailId}/desafios/${challengeId}/concluir`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Erro ao concluir desafio')
  return res.json()
}

export async function submitTrailQuiz(
  trailId: string,
  data: { questionIds: string[]; correctAnswers: number; incorrectAnswers: number },
) {
  const res = await fetch(`${API_URL}/usuario-trilhas/${trailId}/quiz/finalizar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao salvar resultado do quiz')
  return res.json()
}

// ── Blog ──
export async function fetchBlog() {
  const res = await fetch(`${API_URL}/blog`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar blog')
  return res.json()
}

// ── Streak ──
export async function fetchStreakStats() {
  const res = await fetch(`${API_URL}/streak/stats`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar streak')
  return res.json()
}

export async function fetchStreakLogs() {
  const res = await fetch(`${API_URL}/streak`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar logs de streak')
  return res.json()
}

export async function registrarStreakHoje() {
  const res = await fetch(`${API_URL}/streak/registrar-hoje`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Erro ao registrar streak')
  return res.json()
}

// ── Usuário / Perfil ──
export async function fetchMeuPerfil(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar perfil')
  return res.json()
}

export async function updateMeuPerfil(data: { name: string; email: string }) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao atualizar perfil')
  }
  return res.json()
}

export async function updateMinhaSenha(data: { senhaAtual: string; novaSenha: string }) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao alterar senha')
  }
  return res.json()
}

export async function updateUserPreferences(data: {
  language?: string
  interests?: string[]
  interestReason?: string
  onboardingCompleted?: boolean
}) {
  const res = await fetch(`${API_URL}/users/me/preferences`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao atualizar preferências do usuário')
  }
  return res.json()
}

export async function completeOnboarding() {
  const res = await fetch(`${API_URL}/users/me/onboarding/complete`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao concluir onboarding')
  }
  return res.json()
}

export async function fetchWeeklyLeaderboard(): Promise<WeeklyLeaderboardResponse> {
  const res = await fetch(`${API_URL}/users/leaderboard/weekly`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar ranking semanal')
  return res.json()
}

export async function fetchWeeklyRewardHistory(): Promise<WeeklyRewardHistoryEntry[]> {
  const res = await fetch(`${API_URL}/users/rewards/weekly`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar histórico de recompensas semanais')
  return res.json()
}

export async function fetchSeasonLeaderboardHistory(): Promise<SeasonLeaderboardHistoryResponse> {
  const res = await fetch(`${API_URL}/users/leaderboard/seasons`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar histórico sazonal do ranking')
  return res.json()
}

export async function fetchRankingUserDetail(userId: string): Promise<RankingUserDetail> {
  const res = await fetch(`${API_URL}/users/public/${userId}/gamification`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar detalhes do usuário')
  return res.json()
}

export async function fetchNotifications(): Promise<{ unreadCount: number; items: GamificationNotification[] }> {
  const res = await fetch(`${API_URL}/users/notifications`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar notificações')
  return res.json()
}

export async function markNotificationAsRead(notificationId: string) {
  const res = await fetch(`${API_URL}/users/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Erro ao marcar notificação como lida')
  return res.json()
}

export async function fetchStreakFreezeState(): Promise<{
  balance: number
  config: { enabled: boolean; maxGapDays: number; initialCharges: number }
  recent: Array<{ id: string; delta: number; source: string; reason: string | null; createdAt: string }>
}> {
  const res = await fetch(`${API_URL}/users/streak-freeze`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar proteções de streak')
  return res.json()
}

export async function fetchMyCosmetics() {
  const res = await fetch(`${API_URL}/users/cosmetics`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar inventário de cosméticos')
  return res.json()
}

export async function equipCosmetic(cosmeticItemId: string) {
  const res = await fetch(`${API_URL}/users/cosmetics/equip`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ cosmeticItemId }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao equipar cosmético')
  }
  return res.json()
}

export async function unequipCosmetic(cosmeticItemId: string) {
  const res = await fetch(`${API_URL}/users/cosmetics/unequip`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ cosmeticItemId }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao desequipar cosmético')
  }
  return res.json()
}

export async function claimMission(missionId: string) {
  const res = await fetch(`${API_URL}/users/missions/${missionId}/claim`, {
    method: 'PATCH',
    headers: headers(),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao resgatar missão')
  }
  return res.json()
}
