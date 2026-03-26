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

export const PRESET_BUYER_ACCOUNT: StoredAccount = {
  id: "preset-rizky-pratama",
  name: "Rizky Pratama",
  email: "rizky.pratama@tanilink.id",
  password: "Tanilink123",
  phone: "+62 812 8900 1145",
  avatarInitials: "RP",
  role: "buyer",
}

export const PRESET_SELLER_ACCOUNT: StoredAccount = {
  id: "preset-dewi-santika",
  name: "Dewi Santika",
  email: "dewi.santika@tanilink.id",
  password: "TaniLinkSeller123",
  phone: "+62 813 7220 4551",
  avatarInitials: "DS",
  role: "seller",
}

export const PRESET_ACCOUNTS: StoredAccount[] = [PRESET_BUYER_ACCOUNT, PRESET_SELLER_ACCOUNT]

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
