import type { ReactNode } from 'react'

import { createContext, useContext, useEffect, useState } from 'react'

import { api } from '../services/api'

type User = {
  id: number
  username: string
  email: string
  role_id: number
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const userData = await api.auth.me(token)
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token])
        console.error('Error fetching user:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
