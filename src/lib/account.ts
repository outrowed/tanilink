import { type Product } from "@/lib/data"

export type TransactionStatus =
  | "Awaiting confirmation"
  | "Packed"
  | "In transit"
  | "Delivered"
  | "Issue reported"

export type PaymentMethod = "Bank transfer" | "E-wallet" | "Virtual account"
export type DeliveryMethod = "Same-day metro" | "Next-day route" | "Chilled consolidation"

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
  deliveryAddress: string
  deliveryFee: number
  deliveryMethod: DeliveryMethod
  deliveryStatus: string
  eta: string
  id: string
  items: TransactionItem[]
  paymentMethod: PaymentMethod
  placedAt: string
  recipientName: string
  recipientPhone: string
  sellerNames: string[]
  status: TransactionStatus
  subtotal: number
  total: number
  trackingCode: string
  timeline: TransactionTimelineStep[]
}

export type TransactionRecord = Omit<
  Transaction,
  "deliveryAddress" | "deliveryMethod" | "paymentMethod" | "recipientName" | "recipientPhone"
> &
  Partial<
    Pick<
      Transaction,
      "deliveryAddress" | "deliveryMethod" | "paymentMethod" | "recipientName" | "recipientPhone"
    >
  >

export interface CheckoutInput {
  deliveryAddress: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  recipientName: string
  recipientPhone: string
}

export interface PaymentMethodOption {
  description: string
  id: PaymentMethod
  label: string
}

export interface DeliveryMethodOption {
  description: string
  fee: number
  id: DeliveryMethod
  label: string
}

export interface CheckoutBasketLine {
  productIcon: Product["icon"]
  productName: Product["name"]
  productSlug: Product["slug"]
  quantity: number
  sellerName: string
  sellerPrice: number
  unit: Product["unit"]
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
  accountTransactions: TransactionRecord[]
  inboxThreads: InboxThread[]
  settingsSections: SettingsSection[]
}

const longMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const

export const paymentMethodOptions: PaymentMethodOption[] = [
  {
    id: "Bank transfer",
    label: "Bank transfer",
    description: "Transfer directly to the TaniLink settlement account and continue with automatic confirmation.",
  },
  {
    id: "E-wallet",
    label: "E-wallet",
    description: "Use a linked e-wallet balance for fast payment confirmation at checkout.",
  },
  {
    id: "Virtual account",
    label: "Virtual account",
    description: "Generate a dedicated virtual account number for this ingredient purchase.",
  },
]

export const deliveryMethodOptions: DeliveryMethodOption[] = [
  {
    id: "Same-day metro",
    label: "Same-day metro",
    description: "Fast same-day dispatch for nearby kitchen restocking and urgent replenishment.",
    fee: 18000,
  },
  {
    id: "Next-day route",
    label: "Next-day route",
    description: "Lower-cost scheduled route for standard ingredient purchasing across the city.",
    fee: 12000,
  },
  {
    id: "Chilled consolidation",
    label: "Chilled consolidation",
    description: "Consolidated cold-chain handling for mixed orders that need temperature-sensitive routing.",
    fee: 24000,
  },
]

function padTime(value: number) {
  return String(value).padStart(2, "0")
}

function formatPlacedAt(date: Date) {
  return `${date.getDate()} ${longMonthNames[date.getMonth()]} ${date.getFullYear()}, ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
}

function formatTimelineTimestamp(date: Date) {
  return `${date.getDate()} ${shortMonthNames[date.getMonth()]}, ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
}

function buildTransactionId(date: Date) {
  const year = String(date.getFullYear()).slice(-2)
  const month = padTime(date.getMonth() + 1)
  const day = padTime(date.getDate())
  const suffix = String(date.getTime()).slice(-3)

  return `TNL-${year}${month}${day}-${suffix}`
}

function buildTrackingCode(date: Date) {
  return `JKT-TRK-${String(date.getTime()).slice(-6)}`
}

function buildEtaLabel(deliveryMethod: DeliveryMethod) {
  switch (deliveryMethod) {
    case "Same-day metro":
      return "Arrives today, 18:00 - 20:00"
    case "Next-day route":
      return "Arrives tomorrow, 09:00 - 13:00"
    case "Chilled consolidation":
      return "Arrives in 2 days, 08:00 - 12:00"
    default:
      return "Arrives soon"
  }
}

function buildDeliveryStatus(deliveryMethod: DeliveryMethod) {
  switch (deliveryMethod) {
    case "Same-day metro":
      return "Payment recorded. Sellers are confirming stock for same-day dispatch."
    case "Next-day route":
      return "Payment recorded. Sellers are preparing the next-day delivery route."
    case "Chilled consolidation":
      return "Payment recorded. Sellers are preparing a chilled consolidated delivery route."
    default:
      return "Payment recorded. Sellers are confirming the order."
  }
}

function defaultTransactionSnapshot() {
  return {
    deliveryAddress: "Jakarta Selatan delivery area",
    deliveryMethod: "Same-day metro" as DeliveryMethod,
    paymentMethod: "Bank transfer" as PaymentMethod,
    recipientName: "TaniLink buyer",
    recipientPhone: "+62 812 0000 0000",
  }
}

export function normalizeTransaction(transaction: TransactionRecord): Transaction {
  const fallback = defaultTransactionSnapshot()

  return {
    ...transaction,
    deliveryAddress: transaction.deliveryAddress ?? fallback.deliveryAddress,
    deliveryMethod: transaction.deliveryMethod ?? fallback.deliveryMethod,
    paymentMethod: transaction.paymentMethod ?? fallback.paymentMethod,
    recipientName: transaction.recipientName ?? fallback.recipientName,
    recipientPhone: transaction.recipientPhone ?? fallback.recipientPhone,
  }
}

export function getDeliveryMethodOption(deliveryMethod: DeliveryMethod) {
  return (
    deliveryMethodOptions.find((option) => option.id === deliveryMethod) ??
    deliveryMethodOptions[0]
  )
}

export function buildTransactionFromBasket(
  basketLines: CheckoutBasketLine[],
  checkoutInput: CheckoutInput
): Transaction {
  const now = new Date()
  const deliveryOption = getDeliveryMethodOption(checkoutInput.deliveryMethod)
  const subtotal = basketLines.reduce((sum, line) => sum + line.quantity * line.sellerPrice, 0)
  const items: TransactionItem[] = basketLines.map((line) => ({
    lineTotal: line.quantity * line.sellerPrice,
    productIcon: line.productIcon,
    productName: line.productName,
    productSlug: line.productSlug,
    quantity: line.quantity,
    sellerName: line.sellerName,
    unit: line.unit,
  }))
  const sellerNames = Array.from(new Set(basketLines.map((line) => line.sellerName)))

  return {
    deliveryAddress: checkoutInput.deliveryAddress.trim(),
    deliveryFee: deliveryOption.fee,
    deliveryMethod: checkoutInput.deliveryMethod,
    deliveryStatus: buildDeliveryStatus(checkoutInput.deliveryMethod),
    eta: buildEtaLabel(checkoutInput.deliveryMethod),
    id: buildTransactionId(now),
    items,
    paymentMethod: checkoutInput.paymentMethod,
    placedAt: formatPlacedAt(now),
    recipientName: checkoutInput.recipientName.trim(),
    recipientPhone: checkoutInput.recipientPhone.trim(),
    sellerNames,
    status: "Awaiting confirmation",
    subtotal,
    total: subtotal + deliveryOption.fee,
    trackingCode: buildTrackingCode(now),
    timeline: [
      {
        label: "Order placed",
        detail: "You confirmed the ingredient purchase and submitted the order successfully.",
        state: "done",
        timestamp: formatTimelineTimestamp(now),
      },
      {
        label: "Payment confirmed",
        detail: `Payment has been recorded via ${checkoutInput.paymentMethod}.`,
        state: "done",
        timestamp: formatTimelineTimestamp(new Date(now.getTime() + 2 * 60 * 1000)),
      },
      {
        label: "Awaiting seller confirmation",
        detail: "Sellers are reviewing stock, reserving items, and preparing the combined order for dispatch.",
        state: "current",
        timestamp: formatTimelineTimestamp(new Date(now.getTime() + 15 * 60 * 1000)),
      },
      {
        label: "Packed at warehouse",
        detail: "Each ingredient line will be packed and staged at its assigned warehouse location.",
        state: "pending",
        timestamp: "Waiting",
      },
      {
        label: "Delivered",
        detail: "Final handoff to the delivery address selected at checkout.",
        state: "pending",
        timestamp: "Waiting",
      },
    ],
  }
}
