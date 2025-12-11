// Normalize API URL defensively to avoid malformed hosts (e.g., ...railway.appapi)
const rawApiEnv = import.meta.env.VITE_API_URL || ''

// Fix common typo where "api" is concatenated to the host without a slash
const sanitizedEnv = rawApiEnv.replace(/(\.app)api\b/i, '$1')

let normalized = ''
try {
  // Ensure it parses as a URL; add protocol if missing
  const candidate = sanitizedEnv.includes('://') ? sanitizedEnv : `https://${sanitizedEnv}`
  const parsed = new URL(candidate)

  // Strip trailing slash and trailing /api path segment if present
  const cleanPath = parsed.pathname.replace(/\/$/, '').replace(/\/api$/i, '')
  normalized = `${parsed.protocol}//${parsed.host}${cleanPath}`
} catch (_e) {
  // Fallback to original sanitized env minus trailing slash and /api
  normalized = sanitizedEnv.replace(/\/$/, '').replace(/\/api$/i, '')
}

const API_URL = normalized ? `${normalized}/api/v1` : '/api/v1'

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const api = {
  auth: {
    me: async (token: string) => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
    login: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Login failed')
      return res.json()
    },
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Registration failed')
      return res.json()
    },
    count: async () => {
      const res = await fetch(`${API_URL}/auth/count`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch user count')
      return res.json()
    },
  },
  challenges: {
    list: async (token: string) => {
      const res = await fetch(`${API_URL}/challenges/`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch challenges')
      return res.json()
    },
    categories: async (token: string) => {
      const res = await fetch(`${API_URL}/challenges/categories`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    },
    count: async () => {
      const res = await fetch(`${API_URL}/challenges/count`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to fetch challenge count')
      return res.json()
    },
    getSolves: async (token: string, challengeId: string) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}/solves`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch solves')
      return res.json()
    },
  },
  scoreboard: {
    get: async (token?: string) => {
      const res = await fetch(`${API_URL}/scoreboard/`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch scoreboard')
      return res.json()
    },
  },
  teams: {
    me: async (token: string) => {
      const res = await fetch(`${API_URL}/teams/me`, {
        headers: getHeaders(token),
      })
      if (res.status === 404) return null
      if (!res.ok) throw new Error('Failed to fetch team')
      return res.json()
    },
    create: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/teams/`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create team')
      return res.json()
    },
    join: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to join team')
      return res.json()
    },
    leave: async (token: string) => {
      const res = await fetch(`${API_URL}/teams/leave`, {
        method: 'POST',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to leave team')
      return res.json()
    },
    delete: async (token: string) => {
      const res = await fetch(`${API_URL}/teams/`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to delete team')
      return res.json()
    },
  },
}
