import { createContext } from 'react'
import type { AuthUser, LoginCredentials, RegisterData } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  sessionError: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  loginWithGoogle: () => Promise<AuthUser>
  register: (data: RegisterData) => Promise<AuthUser>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  updateUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
