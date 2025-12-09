import type { ReactNode } from 'react'

import { createContext, useContext, useEffect, useState } from 'react'

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
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Token invalid or expired
          logout()
        }
      } catch (error) {
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
