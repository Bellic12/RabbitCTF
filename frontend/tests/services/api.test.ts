import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../../src/services/api'

// Mock global fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('API Service', () => {
  beforeEach(() => {
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Auth', () => {
    it('login sends correct request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'fake-token' }),
      })

      const credentials = { username: 'test', password: 'password' }
      await api.auth.login(credentials)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('register sends correct request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      })

      const data = { username: 'new', password: 'pw', email: 'e@e.com' }
      await api.auth.register(data)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
    })

    it('me fetches user profile', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: 'test' }),
      })

      const token = 'token'
      await api.auth.me(token)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      )
    })
  })

  describe('Challenges', () => {
    it('list sends authorization header', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      })

      const token = 'secret-token'
      await api.challenges.list(token)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/challenges/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      )
    })

    it('getSolves fetches solve history', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      })

      const token = 'token'
      const challengeId = '1'
      await api.challenges.getSolves(token, challengeId)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/challenges/${challengeId}/solves`),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      )
    })
  })

  describe('Teams', () => {
    it('create sends correct request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Team1' }),
      })

      const token = 'token'
      const data = { name: 'Team1', password: 'pass' }
      await api.teams.create(token, data)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/teams/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      )
    })

    it('join sends correct request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const token = 'token'
      const data = { name: 'Team1', password: 'pass' }
      await api.teams.join(token, data)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/teams/join'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
    })

    it('me fetches current team', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'MyTeam' }),
      })

      const token = 'token'
      await api.teams.me(token)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/teams/me'),
        expect.anything()
      )
    })
  })

  describe('Scoreboard', () => {
    it('get fetches scoreboard', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      })

      await api.scoreboard.get()

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/scoreboard/'),
        expect.anything()
      )
    })
  })
})
