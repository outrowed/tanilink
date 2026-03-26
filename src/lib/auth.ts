export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  avatarInitials: string
}

export interface StoredAccount extends AuthUser {
  password: string
}

export interface AuthSession {
  email: string
  userId: string
}

export interface SignUpInput {
  email: string
  name: string
  password: string
  phone?: string
}

export const PRESET_ACCOUNT: StoredAccount = {
  id: "preset-rizky-pratama",
  name: "Rizky Pratama",
  email: "rizky.pratama@tanilink.id",
  password: "Tanilink123",
  phone: "+62 812 8900 1145",
  avatarInitials: "RP",
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
