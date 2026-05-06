const API_URL = 'http://localhost:3000'

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
