export type AccountRole = "buyer" | "seller"

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatarInitials: string
  role: AccountRole
}

export interface StoredAccount extends AuthUser {
  password: string
}

export interface AuthSession {
  email: string
  role: AccountRole
  userId: string
}

export interface SignUpInput {
  email: string
  name: string
  password: string
  phone?: string
}

export interface AuthResource {
  presetAccounts: StoredAccount[]
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getAvatarInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (!words.length) {
    return "TL"
  }

  return words.map((word) => word.charAt(0).toUpperCase()).join("")
}
