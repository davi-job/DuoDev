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

// ── Progresso do usuário nas trilhas ──
export async function fetchMeuProgresso() {
  const res = await fetch(`${API_URL}/usuario-trilhas/meu-progresso`, { headers: headers() })
  if (!res.ok) throw new Error('Erro ao buscar progresso')
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
export async function fetchMeuPerfil() {
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
