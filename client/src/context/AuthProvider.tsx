import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from '@/context/authContext'
import {
  getCurrentUser,
  login as loginRequest,
  parseAuthUser,
  logout as logoutRequest,
  register as registerRequest,
} from '@/services/api/auth'
import { API_BASE_URL } from '@/services/config'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/services/authStorage'
import type { AuthUser, LoginCredentials, RegisterData, RegistrationResult } from '@/types'
import { getErrorMessage, getErrorStatus } from '@/utils/errors'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()))
  const [sessionError, setSessionError] = useState<string | null>(null)
  const sessionGeneration = useRef(0)

  const applySession = useCallback((nextToken: string, nextUser: AuthUser) => {
    sessionGeneration.current += 1
    setStoredToken(nextToken)
    setToken(nextToken)
    setUser(nextUser)
    setSessionError(null)
    setIsLoading(false)
  }, [])

  const clearSession = useCallback(() => {
    sessionGeneration.current += 1
    clearStoredToken()
    setToken(null)
    setUser(null)
    setSessionError(null)
    setIsLoading(false)
  }, [])

  const restoreSession = useCallback(async () => {
    const storedToken = getStoredToken()
    if (!storedToken) {
      setToken(null)
      setUser(null)
      setSessionError(null)
      setIsLoading(false)
      return
    }

    const generation = sessionGeneration.current
    setIsLoading(true)
    setSessionError(null)
    try {
      const currentUser = await getCurrentUser()
      if (sessionGeneration.current !== generation) return
      setToken(storedToken)
      setUser(currentUser)
    } catch (error) {
      if (sessionGeneration.current !== generation) return
      const status = getErrorStatus(error)
      if (status === 401 || status === 404) {
        clearSession()
      } else {
        setToken(storedToken)
        setUser(null)
        setSessionError(
          getErrorMessage(error, 'Your session could not be verified. Please try again.')
        )
      }
    } finally {
      if (sessionGeneration.current === generation) {
        setIsLoading(false)
      }
    }
  }, [clearSession])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (active) return restoreSession()
    })
    return () => {
      active = false
    }
  }, [restoreSession])

  // The API client emits this event when a request returns 401.
  useEffect(() => {
    const handleUnauthorized = clearSession
    window.addEventListener('nf:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('nf:unauthorized', handleUnauthorized)
  }, [clearSession])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginRequest(credentials)
      applySession(response.token, response.user)
      return response.user
    },
    [applySession]
  )

  const register = useCallback(
    async (data: RegisterData): Promise<RegistrationResult> => {
      const response = await registerRequest(data)

      if (response.requiresEmailVerification) {
        return response
      }

      if (response.token) {
        applySession(response.token, response.user)
        return response
      }

      const session = await loginRequest({ email: data.email, password: data.password })
      applySession(session.token, session.user)
      return {
        token: session.token,
        user: session.user,
        requiresEmailVerification: false,
        verificationEmailSent: false,
      }
    },
    [applySession]
  )

  const loginWithGoogle = useCallback(
    () =>
      new Promise<AuthUser>((resolve, reject) => {
        const popup = window.open(
          `${API_BASE_URL}/auth/google`,
          'nf-signature-google-auth',
          'popup,width=520,height=680',
        )
        if (!popup) {
          reject(new Error('Allow pop-ups to continue with Google.'))
          return
        }

        const apiOrigin = new URL(API_BASE_URL).origin
        let timeoutId: number | undefined
        let closePollId: number | undefined
        let closeDelayId: number | undefined
        let settled = false

        const cleanup = () => {
          window.removeEventListener('message', handleMessage)
          if (timeoutId !== undefined) window.clearTimeout(timeoutId)
          if (closePollId !== undefined) window.clearInterval(closePollId)
          if (closeDelayId !== undefined) window.clearTimeout(closeDelayId)
        }

        const finishWithError = (message: string) => {
          if (settled) return
          settled = true
          cleanup()
          if (!popup.closed) popup.close()
          reject(new Error(message))
        }

        const handleMessage = (event: MessageEvent<unknown>) => {
          if (event.origin !== apiOrigin || event.source !== popup) return
          if (!event.data || typeof event.data !== 'object') return

          const result = event.data as Record<string, unknown>
          if (result.type !== 'nf-signature-auth') return
          if (typeof result.error === 'string') {
            finishWithError(result.error)
            return
          }

          const nextUser = parseAuthUser(result.user)
          if (typeof result.token !== 'string' || !nextUser) {
            finishWithError('The server returned an unexpected Google sign-in response.')
            return
          }

          if (settled) return
          settled = true
          cleanup()
          applySession(result.token, nextUser)
          resolve(nextUser)
        }

        window.addEventListener('message', handleMessage)
        timeoutId = window.setTimeout(
          () => finishWithError('Google sign-in timed out. Please try again.'),
          180_000,
        )
        closePollId = window.setInterval(() => {
          if (!popup.closed || closeDelayId !== undefined) return
          closeDelayId = window.setTimeout(() => {
            finishWithError('Google sign-in was closed before it completed.')
          }, 300)
        }, 500)
      }),
    [applySession],
  )

  const logout = useCallback(async () => {
    let logoutError: unknown
    try {
      await logoutRequest()
    } catch (error) {
      logoutError = error
    } finally {
      clearSession()
    }

    if (logoutError) throw logoutError
  }, [clearSession])

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      sessionError,
      isAuthenticated: Boolean(user && token),
      login,
      loginWithGoogle,
      register,
      logout,
      restoreSession,
      updateUser,
      applySession,
    }),
    [
      user,
      token,
      isLoading,
      sessionError,
      login,
      loginWithGoogle,
      register,
      logout,
      restoreSession,
      updateUser,
      applySession,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
