import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { AuthContext } from "@/context/auth"
import {
  PRESET_ACCOUNTS,
  getAvatarInitials,
  normalizeEmail,
  type AuthSession,
  type SignUpInput,
  type StoredAccount,
} from "@/lib/auth"

const ACCOUNTS_STORAGE_KEY = "tanilink:accounts"
const SESSION_STORAGE_KEY = "tanilink:session"

function readStoredAccounts() {
  if (typeof window === "undefined") {
    return [] as StoredAccount[]
  }

  try {
    const storedValue = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    return storedValue
      ? (JSON.parse(storedValue) as Array<Omit<StoredAccount, "role"> & Partial<Pick<StoredAccount, "role">>>).map(
          (account) => ({
            ...account,
            role: account.role ?? "buyer",
          })
        )
      : []
  } catch {
    return []
  }
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null as AuthSession | null
  }

  try {
    const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return storedValue
      ? ({
          ...(JSON.parse(storedValue) as Omit<AuthSession, "role"> & Partial<Pick<AuthSession, "role">>),
          role: (JSON.parse(storedValue) as Partial<AuthSession>).role ?? "buyer",
        } as AuthSession)
      : null
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [storedAccounts, setStoredAccounts] = useState<StoredAccount[]>(readStoredAccounts)
  const [session, setSession] = useState<AuthSession | null>(readStoredSession)

  const allAccounts = useMemo(() => [...PRESET_ACCOUNTS, ...storedAccounts], [storedAccounts])
  const user = useMemo(
    () =>
      session
        ? allAccounts.find(
            (account) =>
              account.id === session.userId && normalizeEmail(account.email) === normalizeEmail(session.email)
          ) ?? null
        : null,
    [allAccounts, session]
  )

  useEffect(() => {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(storedAccounts))
  }, [storedAccounts])

  useEffect(() => {
    if (!session || !user) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }, [session, user])

  const login = useCallback(
    (email: string, password: string) => {
      const normalizedEmail = normalizeEmail(email)
      const account = allAccounts.find((entry) => normalizeEmail(entry.email) === normalizedEmail)

      if (!account || account.password !== password) {
        return {
          error: "The email or password does not match an account.",
          ok: false,
        }
      }

      setSession({
        email: account.email,
        role: account.role,
        userId: account.id,
      })

      return { ok: true }
    },
    [allAccounts]
  )

  const signup = useCallback(
    (input: SignUpInput) => {
      const normalizedEmail = normalizeEmail(input.email)
      const trimmedName = input.name.trim()
      const trimmedPassword = input.password.trim()
      const trimmedPhone = input.phone?.trim() || undefined

      if (!trimmedName || !normalizedEmail || !trimmedPassword) {
        return {
          error: "Name, email, and password are required to create an account.",
          ok: false,
        }
      }

      const existingAccount = allAccounts.find((account) => normalizeEmail(account.email) === normalizedEmail)

      if (existingAccount) {
        return {
          error: "That email is already in use. Sign in instead or choose another email.",
          ok: false,
        }
      }

      const nextAccount: StoredAccount = {
        id: `local-${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        password: trimmedPassword,
        phone: trimmedPhone,
        avatarInitials: getAvatarInitials(trimmedName),
        role: "buyer",
      }

      setStoredAccounts((current) => [...current, nextAccount])
      setSession({
        email: nextAccount.email,
        role: nextAccount.role,
        userId: nextAccount.id,
      })

      return { ok: true }
    },
    [allAccounts]
  )

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isSeller: user?.role === "seller",
      login,
      logout,
      signup,
      user,
    }),
    [login, logout, signup, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
