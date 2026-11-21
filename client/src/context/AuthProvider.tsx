import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from '@/context/authContext'
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/services/api/auth'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/services/authStorage'
import type { AuthUser, LoginCredentials, RegisterData } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()))

  const applySession = useCallback((nextToken: string, nextUser: AuthUser) => {
    setStoredToken(nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])

  // Validate an existing token with the backend on first load. A token is
  // never trusted just because it exists in storage.
  useEffect(() => {
    let active = true
    const storedToken = getStoredToken()

    // isLoading was initialised from token presence, so there is nothing to
    // update when no token is stored.
    if (!storedToken) return

    getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setToken(storedToken)
          setUser(currentUser)
        }
      })
      .catch(() => {
        if (active) {
          clearStoredToken()
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // The API client emits this event when a request returns 401.
  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredToken()
      setToken(null)
      setUser(null)
    }

    window.addEventListener('nf:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('nf:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginRequest(credentials)
      applySession(response.token, response.user)
      return response.user
    },
    [applySession]
  )

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await registerRequest(data)

      // Some Express implementations return only the created user. In that
      // case we immediately perform a real sign-in request to obtain a token.
      if (response.token) {
        applySession(response.token, response.user)
        return response.user
      }

      const session = await loginRequest({ email: data.email, password: data.password })
      applySession(session.token, session.user)
      return session.user
    },
    [applySession]
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Local session must still be cleared if the server is unreachable.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
