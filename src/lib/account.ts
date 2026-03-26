import { type Product } from "@/lib/data"

export type TransactionStatus =
  | "Awaiting confirmation"
  | "Packed"
  | "In transit"
  | "Delivered"
  | "Issue reported"

export interface TransactionItem {
  lineTotal: number
  productIcon: Product["icon"]
  productName: Product["name"]
  productSlug: Product["slug"]
  quantity: number
  sellerName: string
  unit: Product["unit"]
}

export interface TransactionTimelineStep {
  detail: string
  label: string
  state: "current" | "done" | "issue" | "pending"
  timestamp: string
}

export interface Transaction {
  deliveryFee: number
  deliveryStatus: string
  eta: string
  id: string
  items: TransactionItem[]
  placedAt: string
  sellerNames: string[]
  status: TransactionStatus
  subtotal: number
  total: number
  trackingCode: string
  timeline: TransactionTimelineStep[]
}

export interface InboxMessage {
  author: string
  body: string
  id: string
  isUser: boolean
  sentAt: string
}

export interface InboxThread {
  id: string
  messages: InboxMessage[]
  preview: string
  sender: string
  status: string
  subject: string
  timestamp: string
  unread: boolean
}

export interface SettingsSection {
  actions: string[]
  description: string
  id: string
  title: string
}

export interface AccountResource {
  accountTransactions: Transaction[]
  inboxThreads: InboxThread[]
  settingsSections: SettingsSection[]
}
