import { products, type Product } from "@/lib/data"

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

function getProductSnapshot(productSlug: Product["slug"]) {
  const product = products.find((entry) => entry.slug === productSlug)

  if (!product) {
    throw new Error(`Unknown product slug: ${productSlug}`)
  }

  return product
}

function createTransactionItem(
  productSlug: Product["slug"],
  quantity: number,
  sellerName: string,
  lineTotal: number
): TransactionItem {
  const product = getProductSnapshot(productSlug)

  return {
    lineTotal,
    productIcon: product.icon,
    productName: product.name,
    productSlug,
    quantity,
    sellerName,
    unit: product.unit,
  }
}

export const accountTransactions: Transaction[] = [
  {
    id: "TNL-240326-015",
    placedAt: "26 March 2026, 09:20",
    status: "In transit",
    deliveryStatus: "Courier is moving between South Jakarta drop points.",
    eta: "Arrives today, 15:00 - 17:00",
    trackingCode: "JKT-TRK-880214",
    sellerNames: ["Karawang Grain Union", "Batu Agro Mandiri"],
    items: [
      createTransactionItem("premium-rice", 2, "Karawang Grain Union", 151600),
      createTransactionItem("red-chili", 3, "Batu Agro Mandiri", 146400),
    ],
    subtotal: 298000,
    deliveryFee: 18000,
    total: 316000,
    timeline: [
      {
        label: "Order confirmed",
        detail: "Sellers accepted the purchase and reserved stock.",
        state: "done",
        timestamp: "26 Mar, 09:31",
      },
      {
        label: "Packed at warehouse",
        detail: "Items were packed at East Jakarta and Depok hubs.",
        state: "done",
        timestamp: "26 Mar, 11:05",
      },
      {
        label: "Courier en route",
        detail: "The mixed order is currently on the way to Jakarta Selatan.",
        state: "current",
        timestamp: "26 Mar, 13:40",
      },
      {
        label: "Delivered",
        detail: "Final handoff to your address.",
        state: "pending",
        timestamp: "Waiting",
      },
    ],
  },
  {
    id: "TNL-240325-084",
    placedAt: "25 March 2026, 19:10",
    status: "Delivered",
    deliveryStatus: "Delivered and received by kitchen staff.",
    eta: "Completed on 26 March 2026, 07:42",
    trackingCode: "JKT-TRK-879731",
    sellerNames: ["Cianjur Fresh Protein", "Bogor Fresh Depot"],
    items: [
      createTransactionItem("chicken-fillet", 4, "Cianjur Fresh Protein", 167600),
      createTransactionItem("cabbage", 5, "Bogor Fresh Depot", 98500),
    ],
    subtotal: 266100,
    deliveryFee: 16000,
    total: 282100,
    timeline: [
      {
        label: "Order confirmed",
        detail: "All sellers accepted the order.",
        state: "done",
        timestamp: "25 Mar, 19:22",
      },
      {
        label: "Packed at warehouse",
        detail: "Cold-chain packing completed and quality checked.",
        state: "done",
        timestamp: "25 Mar, 21:10",
      },
      {
        label: "Courier en route",
        detail: "Driver completed both delivery stops.",
        state: "done",
        timestamp: "26 Mar, 05:52",
      },
      {
        label: "Delivered",
        detail: "Order was delivered and marked complete.",
        state: "done",
        timestamp: "26 Mar, 07:42",
      },
    ],
  },
  {
    id: "TNL-240325-033",
    placedAt: "25 March 2026, 10:55",
    status: "Packed",
    deliveryStatus: "Packed and queued for next dispatch window.",
    eta: "Arrives tomorrow morning",
    trackingCode: "JKT-TRK-879204",
    sellerNames: ["Bekasi Cold & Dry Hub", "Lembang Spice House"],
    items: [
      createTransactionItem("premium-rice", 1, "Subang Padi Sentra", 77200),
      createTransactionItem("garlic", 2, "Lembang Spice House", 74200),
      createTransactionItem("shallots", 2, "Lembang Spice House", 81600),
    ],
    subtotal: 233000,
    deliveryFee: 14000,
    total: 247000,
    timeline: [
      {
        label: "Order confirmed",
        detail: "All line items are locked for fulfillment.",
        state: "done",
        timestamp: "25 Mar, 11:08",
      },
      {
        label: "Packed at warehouse",
        detail: "Dry goods and produce were packed for the 06:00 route.",
        state: "current",
        timestamp: "25 Mar, 16:25",
      },
      {
        label: "Courier en route",
        detail: "Dispatch begins on the next morning route.",
        state: "pending",
        timestamp: "Waiting",
      },
      {
        label: "Delivered",
        detail: "Final handoff to your address.",
        state: "pending",
        timestamp: "Waiting",
      },
    ],
  },
  {
    id: "TNL-240324-118",
    placedAt: "24 March 2026, 08:12",
    status: "Awaiting confirmation",
    deliveryStatus: "Waiting for seller acceptance and route batching.",
    eta: "Seller confirmation expected within 2 hours",
    trackingCode: "JKT-TRK-878560",
    sellerNames: ["West Jakarta Fresh Hub"],
    items: [
      createTransactionItem("tomatoes", 4, "Malang Fresh Route", 96400),
      createTransactionItem("firm-tofu", 6, "Jakarta Tofu Collective", 91800),
      createTransactionItem("tempeh", 6, "Jakarta Tofu Collective", 84600),
    ],
    subtotal: 272800,
    deliveryFee: 15000,
    total: 287800,
    timeline: [
      {
        label: "Order placed",
        detail: "Your order has been submitted to the seller network.",
        state: "current",
        timestamp: "24 Mar, 08:12",
      },
      {
        label: "Seller confirmation",
        detail: "Waiting for the marketplace to confirm all line items.",
        state: "pending",
        timestamp: "Waiting",
      },
      {
        label: "Packed at warehouse",
        detail: "Items will be packed after confirmation.",
        state: "pending",
        timestamp: "Waiting",
      },
      {
        label: "Delivered",
        detail: "Final handoff to your address.",
        state: "pending",
        timestamp: "Waiting",
      },
    ],
  },
  {
    id: "TNL-240323-071",
    placedAt: "23 March 2026, 15:48",
    status: "Issue reported",
    deliveryStatus: "A seller-side packing issue is being resolved.",
    eta: "Support update expected today before 18:00",
    trackingCode: "JKT-TRK-877921",
    sellerNames: ["Batu Agro Mandiri", "South Jakarta Chill Hub"],
    items: [
      createTransactionItem("red-chili", 2, "Batu Agro Mandiri", 97600),
      createTransactionItem("fresh-eggs", 3, "FarmEgg Nusantara", 129000),
    ],
    subtotal: 226600,
    deliveryFee: 12000,
    total: 238600,
    timeline: [
      {
        label: "Order confirmed",
        detail: "Both sellers accepted and prepared the order.",
        state: "done",
        timestamp: "23 Mar, 16:02",
      },
      {
        label: "Issue reported",
        detail: "One line item failed packing inspection and support was notified.",
        state: "issue",
        timestamp: "23 Mar, 18:11",
      },
      {
        label: "Seller resolution",
        detail: "Replacement stock is being prepared.",
        state: "current",
        timestamp: "24 Mar, 09:20",
      },
      {
        label: "Delivered",
        detail: "Delivery will resume after the issue is cleared.",
        state: "pending",
        timestamp: "Waiting",
      },
    ],
  },
]

export const inboxThreads: InboxThread[] = [
  {
    id: "thread-1",
    sender: "Karawang Grain Union",
    subject: "Rice delivery window update",
    preview: "Your 5 kg sacks are already on the courier route and should arrive before 17:00.",
    unread: true,
    timestamp: "10 minutes ago",
    status: "Order update",
    messages: [
      {
        id: "msg-1",
        author: "Karawang Grain Union",
        body: "Your rice order has left our East Jakarta fulfillment hub and is now on the courier route.",
        isUser: false,
        sentAt: "26 Mar, 13:42",
      },
      {
        id: "msg-2",
        author: "You",
        body: "Noted. Please leave it with the kitchen entrance if I am still out on delivery pickup.",
        isUser: true,
        sentAt: "26 Mar, 13:47",
      },
      {
        id: "msg-3",
        author: "Karawang Grain Union",
        body: "Understood. The driver note has been updated for kitchen-entrance handoff.",
        isUser: false,
        sentAt: "26 Mar, 13:49",
      },
    ],
  },
  {
    id: "thread-2",
    sender: "TaniLink Support",
    subject: "Issue review for order TNL-240323-071",
    preview: "We are coordinating a replacement batch and will update your ETA shortly.",
    unread: true,
    timestamp: "1 hour ago",
    status: "Support case",
    messages: [
      {
        id: "msg-4",
        author: "TaniLink Support",
        body: "We have received the packing issue report for your egg and chili order and are coordinating with the seller.",
        isUser: false,
        sentAt: "26 Mar, 11:08",
      },
      {
        id: "msg-5",
        author: "You",
        body: "Please prioritize a replacement if possible. These items are for evening prep.",
        isUser: true,
        sentAt: "26 Mar, 11:11",
      },
      {
        id: "msg-6",
        author: "TaniLink Support",
        body: "Confirmed. We have escalated the ticket and will send a delivery update before 18:00.",
        isUser: false,
        sentAt: "26 Mar, 11:18",
      },
    ],
  },
  {
    id: "thread-3",
    sender: "Cianjur Fresh Protein",
    subject: "Cold-chain order completed",
    preview: "Thanks for receiving yesterday's protein delivery. Let us know if you need a repeat order.",
    unread: false,
    timestamp: "Yesterday",
    status: "Seller message",
    messages: [
      {
        id: "msg-7",
        author: "Cianjur Fresh Protein",
        body: "Thank you for receiving yesterday's chilled delivery. Everything was signed off at 07:42.",
        isUser: false,
        sentAt: "25 Mar, 08:00",
      },
      {
        id: "msg-8",
        author: "You",
        body: "Received in good condition. Please keep the same route timing for next week.",
        isUser: true,
        sentAt: "25 Mar, 08:16",
      },
    ],
  },
]

export const settingsSections: SettingsSection[] = [
  {
    id: "profile",
    title: "Profile and identity",
    description: "Update your account name, contact details, and public identity preferences.",
    actions: ["Edit profile", "Change phone number", "Update business label"],
  },
  {
    id: "address",
    title: "Addresses and delivery",
    description: "Manage destination addresses, handoff notes, and preferred receiving windows.",
    actions: ["Manage saved addresses", "Set delivery instructions", "Choose default drop point"],
  },
  {
    id: "payment",
    title: "Payment methods",
    description: "Review linked payment options used for ingredient purchases and repeat orders.",
    actions: ["Add payment method", "Set primary payment", "Review payment history"],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Tune how often TaniLink sends order alerts, seller updates, and support responses.",
    actions: ["Order alerts", "Price notifications", "Inbox preferences"],
  },
  {
    id: "language",
    title: "Language and region",
    description: "Choose your preferred language, region display, and delivery communication style.",
    actions: ["Display language", "Regional formats", "Preferred communication"],
  },
  {
    id: "security",
    title: "Security",
    description: "Control password, sign-in protection, and active sessions for this account.",
    actions: ["Change password", "Review sessions", "Sign-in protection"],
  },
]
