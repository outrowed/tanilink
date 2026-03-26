import { type Product } from "@/lib/data"

export interface SellerStoreLocation {
  address: string
  area: string
  city: string
  id: string
  label: string
  province: string
}

export interface SellerDeliveryOption {
  description: string
  id: string
  label: string
  leadTime: string
}

export interface SellerStoreProfile {
  contactPhone: string
  deliveryOptions: SellerDeliveryOption[]
  description: string
  locations: SellerStoreLocation[]
  ownerName: string
  sellerAccountId: string
  storeName: string
}

export interface SellerListing {
  activeOrders: number
  deliveryOptionIds: string[]
  handlingTime: string
  id: number
  isActive: boolean
  monthlyOrders: number
  monthlyRevenue: number
  pendingPayout: number
  price: number
  productSlug: Product["slug"]
  rating: number
  sellerAccountId: string
  stockLabel: string
  stockQuantity: number
  warehouseLocationId: string
}

export interface SellerHubSummary {
  activeListings: number
  averageOrderValue: number
  grossRevenue: number
  lowStockCount: number
  ordersThisMonth: number
  pendingPayout: number
}

export interface CreateSellerListingInput {
  deliveryOptionIds: string[]
  handlingTime: string
  isActive?: boolean
  price: number
  productSlug: Product["slug"]
  stockLabel: string
  stockQuantity: number
  warehouseLocationId: string
}

export const DEFAULT_SELLER_PROFILE: SellerStoreProfile = {
  sellerAccountId: "preset-dewi-santika",
  storeName: "Dewi Pantry Nusantara",
  ownerName: "Dewi Santika",
  description: "Ingredient supplier focused on pantry staples, aromatics, and fast-moving kitchen restock items for Jakarta kitchens.",
  contactPhone: "+62 813 7220 4551",
  locations: [
    {
      id: "location-bekasi-main",
      label: "Main Warehouse",
      area: "Cibitung",
      city: "Bekasi",
      province: "West Java",
      address: "Jl. Niaga Pangan No. 18, Cibitung, Bekasi",
    },
    {
      id: "location-tangerang-dispatch",
      label: "Metro Dispatch Point",
      area: "Karawaci",
      city: "Tangerang",
      province: "Banten",
      address: "Jl. Raya Karawaci No. 42, Tangerang",
    },
  ],
  deliveryOptions: [
    {
      id: "delivery-metro-courier",
      label: "Metro courier",
      description: "Fast courier coverage for Jakarta and surrounding metro districts.",
      leadTime: "Same-day delivery",
    },
    {
      id: "delivery-next-day-van",
      label: "Next-day van route",
      description: "Scheduled van delivery for regular pantry replenishment.",
      leadTime: "Arrives tomorrow",
    },
    {
      id: "delivery-bulk-drop",
      label: "Bulk scheduled drop",
      description: "Planned bulk dispatch for larger stock replenishment runs.",
      leadTime: "2 day delivery",
    },
  ],
}

export const DEFAULT_SELLER_LISTINGS: SellerListing[] = [
  {
    id: 9101,
    sellerAccountId: "preset-dewi-santika",
    productSlug: "premium-rice",
    price: 74900,
    stockQuantity: 120,
    stockLabel: "120 sacks ready",
    warehouseLocationId: "location-bekasi-main",
    deliveryOptionIds: ["delivery-next-day-van", "delivery-bulk-drop"],
    handlingTime: "Packed within 3 hours",
    isActive: true,
    monthlyRevenue: 28700000,
    monthlyOrders: 118,
    pendingPayout: 4310000,
    rating: 4.9,
    activeOrders: 21,
  },
  {
    id: 9102,
    sellerAccountId: "preset-dewi-santika",
    productSlug: "cooking-oil",
    price: 18600,
    stockQuantity: 210,
    stockLabel: "High pallet stock",
    warehouseLocationId: "location-tangerang-dispatch",
    deliveryOptionIds: ["delivery-metro-courier", "delivery-next-day-van"],
    handlingTime: "Prepared within 2 hours",
    isActive: true,
    monthlyRevenue: 15400000,
    monthlyOrders: 92,
    pendingPayout: 2260000,
    rating: 4.8,
    activeOrders: 18,
  },
  {
    id: 9103,
    sellerAccountId: "preset-dewi-santika",
    productSlug: "shallots",
    price: 39800,
    stockQuantity: 34,
    stockLabel: "34 crates ready",
    warehouseLocationId: "location-bekasi-main",
    deliveryOptionIds: ["delivery-metro-courier", "delivery-next-day-van"],
    handlingTime: "Sorted within 4 hours",
    isActive: true,
    monthlyRevenue: 8800000,
    monthlyOrders: 46,
    pendingPayout: 1290000,
    rating: 4.8,
    activeOrders: 11,
  },
  {
    id: 9104,
    sellerAccountId: "preset-dewi-santika",
    productSlug: "tomatoes",
    price: 21700,
    stockQuantity: 12,
    stockLabel: "12 crates left",
    warehouseLocationId: "location-tangerang-dispatch",
    deliveryOptionIds: ["delivery-metro-courier"],
    handlingTime: "Prepared within 2 hours",
    isActive: true,
    monthlyRevenue: 5690000,
    monthlyOrders: 29,
    pendingPayout: 840000,
    rating: 4.7,
    activeOrders: 9,
  },
]

export function clampMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.round(value))
}

export function clampStockQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

export function deriveListingMetrics(price: number, stockQuantity: number) {
  const safePrice = clampMoney(price)
  const safeStockQuantity = clampStockQuantity(stockQuantity)
  const monthlyOrders = Math.max(6, Math.min(140, Math.round(Math.max(safeStockQuantity, 12) * 0.62)))
  const monthlyRevenue = safePrice * monthlyOrders
  const pendingPayout = Math.round(monthlyRevenue * 0.17)
  const activeOrders = Math.max(3, Math.min(32, Math.round(monthlyOrders * 0.2)))

  return {
    activeOrders,
    monthlyOrders,
    monthlyRevenue,
    pendingPayout,
    rating: 4.8,
  }
}
