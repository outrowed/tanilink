import { createContext, useContext } from "react"

import { type AuthUser, type SignUpInput } from "@/lib/auth"

export interface AuthActionResult {
  error?: string
  ok: boolean
}

export interface AuthContextValue {
  isAuthenticated: boolean
  isBuyer: boolean
  isSeller: boolean
  login: (email: string, password: string) => AuthActionResult
  logout: () => void
  signup: (input: SignUpInput) => AuthActionResult
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
