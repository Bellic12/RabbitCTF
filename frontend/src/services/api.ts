const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  auth: {
    me: async (token: string) => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    login: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    register: async (data: any) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
  },
  challenges: {
    list: async (token: string) => {
      const res = await fetch(`${API_URL}/challenges/`, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error('Failed to fetch challenges');
      return res.json();
    },
    categories: async (token: string) => {
      const res = await fetch(`${API_URL}/challenges/categories`, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  },
  scoreboard: {
    get: async () => {
      const res = await fetch(`${API_URL}/scoreboard/`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch scoreboard');
      return res.json();
    },
  },
  teams: {
    create: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/teams/`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create team');
      return res.json();
    },
    join: async (token: string, data: any) => {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to join team');
      return res.json();
    },
  },
};
