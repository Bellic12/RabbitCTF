// Robust URL handling:
// 1. Strip trailing slash
// 2. Ensure it ends with /api/v1 (avoiding double /api/v1 if already present)
const envUrl = import.meta.env.VITE_API_URL || ''
const baseUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
const API_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`

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
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMessage = Array.isArray(errData.detail) 
          ? errData.detail.map((e: any) => e.msg).join(', ') 
          : (errData.detail || 'Login failed')
        throw new Error(errorMessage)
      }
      return res.json()
    },
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMessage = Array.isArray(errData.detail) 
          ? errData.detail.map((e: any) => e.msg).join(', ') 
          : (errData.detail || 'Registration failed')
        throw new Error(errorMessage)
      }
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
    categories: async (token: string, includeHidden: boolean = false) => {
      const query = includeHidden ? '?include_hidden=true' : ''
      const res = await fetch(`${API_URL}/challenges/categories${query}`, {
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
    getSolves: async (token: string, challengeId: number) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}/solves`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch solves')
      return res.json()
    },
    submit: async (token: string, challengeId: number, flag: string) => {
      const res = await fetch(`${API_URL}/submissions/submit`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ challenge_id: challengeId, submitted_flag: flag }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.detail || 'Submission failed')
      }
      return res.json()
    },
    start: async (token: string, challengeId: number) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}/start`, {
        method: 'POST',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to start challenge')
      return res.json()
    },
    stop: async (token: string, challengeId: number) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}/stop`, {
        method: 'POST',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to stop challenge')
      return res.json()
    },
    admin: {
      list: async (token: string) => {
        const res = await fetch(`${API_URL}/challenges/admin/all`, {
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to fetch admin challenges')
        return res.json()
      },
      get: async (token: string, id: number) => {
        const res = await fetch(`${API_URL}/challenges/admin/${id}`, {
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to fetch challenge')
        return res.json()
      },
      create: async (token: string, data: any) => {
        const res = await fetch(`${API_URL}/challenges/admin/create`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create challenge')
        return res.json()
      },
      update: async (token: string, id: number, data: any) => {
        const res = await fetch(`${API_URL}/challenges/admin/${id}`, {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update challenge')
        return res.json()
      },
      delete: async (token: string, id: number) => {
        const res = await fetch(`${API_URL}/challenges/admin/${id}`, {
          method: 'DELETE',
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to delete challenge')
        return res.json()
      },
      uploadFile: async (token: string, challengeId: number, file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${API_URL}/challenges/admin/${challengeId}/files`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload file')
        return res.json()
      },
      uploadFiles: async (token: string, challengeId: number, files: File[]) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        const res = await fetch(`${API_URL}/challenges/admin/${challengeId}/files`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to upload files')
        return res.json()
      },
      deleteFile: async (token: string, challengeId: number, fileId: number) => {
        const res = await fetch(`${API_URL}/challenges/admin/${challengeId}/files/${fileId}`, {
          method: 'DELETE',
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to delete file')
        return res.json()
      },
      toggleVisibility: async (token: string, id: number) => {
        const res = await fetch(`${API_URL}/challenges/admin/${id}/toggle-visibility`, {
          method: 'PATCH',
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to toggle visibility')
        return res.json()
      },
      createCategory: async (token: string, data: any) => {
        const res = await fetch(`${API_URL}/challenges/admin/categories`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create category')
        return res.json()
      },
      updateCategory: async (token: string, id: number, data: any) => {
        const res = await fetch(`${API_URL}/challenges/admin/categories/${id}`, {
          method: 'PATCH',
          headers: getHeaders(token),
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update category')
        return res.json()
      },
      deleteCategory: async (token: string, id: number) => {
        const res = await fetch(`${API_URL}/challenges/admin/categories/${id}`, {
          method: 'DELETE',
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to delete category')
        return res.json()
      },
    },
    difficulties: async (token: string) => {
      const res = await fetch(`${API_URL}/challenges/difficulties`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch difficulties')
      return res.json()
    },
    get: async (token: string, challengeId: number) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch challenge')
      return res.json()
    },
    getFiles: async (token: string, challengeId: number) => {
      const res = await fetch(`${API_URL}/challenges/${challengeId}/files`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch challenge files')
      return res.json()
    },
    downloadFile: async (token: string, fileUrl: string) => {
      const url = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
      const res = await fetch(`${baseUrl}${url}`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Download failed')
      return res.blob()
    },
  },
  setup: {
    status: async () => {
      const res = await fetch(`${API_URL}/setup/status`)
      if (!res.ok) throw new Error('Failed to fetch setup status')
      return res.json()
    },
    admin: async (data: any) => {
      const res = await fetch(`${API_URL}/setup/admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Setup failed')
      return res.json()
    },
  },
  rules: {
    list: async () => {
      const res = await fetch(`${API_URL}/rules/`)
      if (!res.ok) throw new Error('Failed to fetch rules')
      return res.json()
    },
    update: async (token: string, content_md: string) => {
      const res = await fetch(`${API_URL}/rules/`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ content_md }),
      })
      if (!res.ok) throw new Error('Failed to update rules')
      return res.json()
    },
  },
  event: {
    status: async () => {
      const res = await fetch(`${API_URL}/event/status?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch event status')
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
    getById: async (token: string, teamId: number) => {
      const res = await fetch(`${API_URL}/teams/${teamId}`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch team details')
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to join team')
      }
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
  admin: {
    getConfig: async (token: string) => {
      const res = await fetch(`${API_URL}/admin/config`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch config')
      return res.json()
    },
    updateConfig: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/admin/config`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update config')
      return res.json()
    },
    event: {
      getConfig: async (token: string) => {
        const res = await fetch(`${API_URL}/admin/event/config`, {
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to fetch event config')
        return res.json()
      },
      updateConfig: async (token: string, data: any) => {
        const res = await fetch(`${API_URL}/admin/event/config`, {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update event config')
        return res.json()
      },
    },
    getUsers: async (token: string) => {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
    deleteUser: async (token: string, userId: number) => {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    deleteTeam: async (token: string, teamId: number) => {
      const res = await fetch(`${API_URL}/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to delete team')
      return res.json()
    },
    getSubmissions: async (token: string, params?: any) => {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`${API_URL}/admin/submissions?${query}`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch submissions')
      return res.json()
    },
    getTeams: async (token: string) => {
      const res = await fetch(`${API_URL}/admin/teams`, {
        headers: getHeaders(token),
      })
      if (!res.ok) throw new Error('Failed to fetch teams')
      return res.json()
    },
    stats: {
      get: async (token: string) => {
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to fetch admin stats')
        return res.json()
      },
      challenges: async (token: string, params?: any) => {
        const query = new URLSearchParams(params).toString()
        const res = await fetch(`${API_URL}/admin/stats/challenges?${query}`, {
          headers: getHeaders(token),
        })
        if (!res.ok) throw new Error('Failed to fetch challenge stats')
        return res.json()
      },
    },
  },
}


