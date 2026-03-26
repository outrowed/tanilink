import {
  products as marketplaceProducts,
  type PriceHistoryRange,
  type Product,
  type SalesHistoryPoint,
  summarizeSalesHistory,
} from "@/lib/data"

export interface RatingHistoryPoint {
  period: string
  rating: number
  reviewCount: number
}

export interface RatingHistorySummary {
  averageRating: number
  latestRating: number
  strongestPeriod: string
  strongestPeriodRating: number
  totalReviews: number
}

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
  ratingHistory: RatingHistoryPoint[]
  ratingHistoryByRange: Record<PriceHistoryRange, RatingHistoryPoint[]>
  sellerAccountId: string
  salesHistory: SalesHistoryPoint[]
  salesHistoryByRange: Record<PriceHistoryRange, SalesHistoryPoint[]>
  stockLabel: string
  stockQuantity: number
  warehouseLocationId: string
}

export interface SellerHubSummary {
  activeListings: number
  averageOrderValue: number
  averageOrdersPerListing: number
  averageReviewsPerListing: number
  averageRevenuePerListing: number
  averageStoreRating: number
  averageStockPerListing: number
  averageUnitsSoldPerListing: number
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

type SellerListingSeed = Omit<
  SellerListing,
  "ratingHistory" | "ratingHistoryByRange" | "salesHistory" | "salesHistoryByRange"
>

const DEFAULT_SELLER_LISTING_SEEDS: SellerListingSeed[] = [
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

function buildSellerSalesHistoryByRange(
  productSlug: Product["slug"],
  price: number,
  monthlyOrders: number,
  listingSeed: number
): Record<PriceHistoryRange, SalesHistoryPoint[]> {
  const product = marketplaceProducts.find((entry) => entry.slug === productSlug)

  if (!product) {
    const emptyHistory: SalesHistoryPoint[] = []

    return {
      "1y": emptyHistory,
      "6m": emptyHistory,
      "1m": emptyHistory,
      "1w": emptyHistory,
      "24h": emptyHistory,
    }
  }

  const marketMonthlyOrders =
    product.productSalesHistoryByRange["1y"][product.productSalesHistoryByRange["1y"].length - 1]?.orders ?? 1
  const share = Math.min(0.42, Math.max(0.08, monthlyOrders / Math.max(marketMonthlyOrders, 1)))

  const mapRange = (range: PriceHistoryRange) =>
    product.productSalesHistoryByRange[range].map((point, index) => {
      const sellerWave = Math.sin(index * 0.57 + listingSeed * 0.11) * point.unitsSold * 0.035
      const unitsSold = Math.max(1, Math.round(point.unitsSold * share + sellerWave))
      const orders = Math.max(1, Math.round(point.orders * share + Math.cos(index * 0.36 + listingSeed) * 0.8))
      const realizedSalePrice = clampMoney(
        price *
          (1 +
            Math.sin(index * 0.48 + listingSeed * 0.03) * 0.014 +
            Math.cos(index * 0.21 + listingSeed * 0.05) * 0.008)
      )

      return {
        orders,
        period: point.period,
        revenue: realizedSalePrice * unitsSold,
        salePrice: realizedSalePrice,
        unitsSold,
      }
    })

  return {
    "1y": mapRange("1y"),
    "6m": mapRange("6m"),
    "1m": mapRange("1m"),
    "1w": mapRange("1w"),
    "24h": mapRange("24h"),
  }
}

function clampRating(value: number) {
  return Math.max(1, Math.min(5, Number(value.toFixed(1))))
}

function buildSellerRatingHistoryByRange(
  productSlug: Product["slug"],
  rating: number,
  monthlyOrders: number,
  listingSeed: number,
  salesHistoryByRange: Record<PriceHistoryRange, SalesHistoryPoint[]>
): Record<PriceHistoryRange, RatingHistoryPoint[]> {
  const product = marketplaceProducts.find((entry) => entry.slug === productSlug)
  const productRatingBias =
    product?.category === "Protein"
      ? 0.06
      : product?.category === "Staple"
        ? 0.03
        : product?.category === "Vegetable"
          ? -0.02
          : 0

  const mapRange = (range: PriceHistoryRange) =>
    salesHistoryByRange[range].map((point, index) => {
      const reviewBase = Math.max(4, monthlyOrders * 0.18)
      const reviewWave = Math.cos(index * 0.49 + listingSeed * 0.07) * reviewBase * 0.18
      const reviewCount = Math.max(1, Math.round(reviewBase + reviewWave))
      const trendWave = Math.sin(index * 0.34 + listingSeed * 0.09) * 0.16
      const confidenceLift = Math.min(0.12, point.unitsSold / 1200)
      const periodRating = clampRating(rating + productRatingBias + trendWave + confidenceLift)

      return {
        period: point.period,
        rating: periodRating,
        reviewCount,
      }
    })

  return {
    "1y": mapRange("1y"),
    "6m": mapRange("6m"),
    "1m": mapRange("1m"),
    "1w": mapRange("1w"),
    "24h": mapRange("24h"),
  }
}

export function normalizeSellerListing(listing: SellerListingSeed | SellerListing): SellerListing {
  const baseListing = {
    ...listing,
    handlingTime: listing.handlingTime.trim(),
    price: clampMoney(listing.price),
    stockLabel: listing.stockLabel.trim(),
    stockQuantity: clampStockQuantity(listing.stockQuantity),
  }

  const salesHistoryByRange =
    "salesHistoryByRange" in listing && listing.salesHistoryByRange
      ? listing.salesHistoryByRange
      : buildSellerSalesHistoryByRange(
          listing.productSlug,
          baseListing.price,
          listing.monthlyOrders,
          listing.id
        )

  const ratingHistoryByRange =
    "ratingHistoryByRange" in listing && listing.ratingHistoryByRange
      ? listing.ratingHistoryByRange
      : buildSellerRatingHistoryByRange(
          listing.productSlug,
          listing.rating,
          listing.monthlyOrders,
          listing.id,
          salesHistoryByRange
        )

  return {
    ...baseListing,
    ratingHistory: ratingHistoryByRange["1y"],
    ratingHistoryByRange,
    salesHistory: salesHistoryByRange["1y"],
    salesHistoryByRange,
  }
}

export function deriveListingSnapshot(
  productSlug: Product["slug"],
  price: number,
  stockQuantity: number,
  listingSeed: number
) {
  const metrics = deriveListingMetrics(price, stockQuantity)
  const salesHistoryByRange = buildSellerSalesHistoryByRange(
    productSlug,
    clampMoney(price),
    metrics.monthlyOrders,
    listingSeed
  )
  const ratingHistoryByRange = buildSellerRatingHistoryByRange(
    productSlug,
    metrics.rating,
    metrics.monthlyOrders,
    listingSeed,
    salesHistoryByRange
  )

  return {
    ...metrics,
    ratingHistory: ratingHistoryByRange["1y"],
    ratingHistoryByRange,
    salesHistory: salesHistoryByRange["1y"],
    salesHistoryByRange,
  }
}

export function getListingUnitsSold(listing: SellerListing) {
  return summarizeSalesHistory(listing.salesHistory).totalUnitsSold
}

export function getListingSalesSummary(listing: SellerListing) {
  return summarizeSalesHistory(listing.salesHistory)
}

export function summarizeRatingHistory(history: RatingHistoryPoint[]): RatingHistorySummary {
  if (!history.length) {
    return {
      averageRating: 0,
      latestRating: 0,
      strongestPeriod: "No rating data",
      strongestPeriodRating: 0,
      totalReviews: 0,
    }
  }

  const totalReviews = history.reduce((sum, point) => sum + point.reviewCount, 0)
  const averageRating = Number(
    (
      history.reduce((sum, point) => sum + point.rating, 0) /
      Math.max(history.length, 1)
    ).toFixed(1)
  )
  const latestRating = history[history.length - 1]?.rating ?? 0
  const strongestPoint = [...history].sort((left, right) => {
    const leftScore = left.rating * left.reviewCount
    const rightScore = right.rating * right.reviewCount

    return rightScore - leftScore
  })[0]

  return {
    averageRating,
    latestRating,
    strongestPeriod: strongestPoint?.period ?? "No rating data",
    strongestPeriodRating: strongestPoint?.rating ?? 0,
    totalReviews,
  }
}

export function getListingRatingSummary(listing: SellerListing): RatingHistorySummary {
  const summary = summarizeRatingHistory(listing.ratingHistory)

  return {
    ...summary,
    latestRating: summary.latestRating || listing.rating,
  }
}

export function buildAverageSalesHistory(listings: SellerListing[], range: PriceHistoryRange): SalesHistoryPoint[] {
  if (!listings.length) {
    return []
  }

  const baseHistory = listings[0]?.salesHistoryByRange[range] ?? []

  return baseHistory.map((point, index) => {
    const periodPoints = listings
      .map((listing) => listing.salesHistoryByRange[range][index])
      .filter(Boolean)

    const count = Math.max(periodPoints.length, 1)

    return {
      orders: Math.round(periodPoints.reduce((sum, entry) => sum + entry.orders, 0) / count),
      period: point.period,
      revenue: Math.round(periodPoints.reduce((sum, entry) => sum + entry.revenue, 0) / count),
      salePrice: Math.round(periodPoints.reduce((sum, entry) => sum + entry.salePrice, 0) / count),
      unitsSold: Math.round(periodPoints.reduce((sum, entry) => sum + entry.unitsSold, 0) / count),
    }
  })
}

export function buildAverageRatingHistory(listings: SellerListing[], range: PriceHistoryRange): RatingHistoryPoint[] {
  if (!listings.length) {
    return []
  }

  const baseHistory = listings[0]?.ratingHistoryByRange[range] ?? []

  return baseHistory.map((point, index) => {
    const periodPoints = listings
      .map((listing) => listing.ratingHistoryByRange[range][index])
      .filter(Boolean)

    const count = Math.max(periodPoints.length, 1)

    return {
      period: point.period,
      rating: Number(
        (
          periodPoints.reduce((sum, entry) => sum + entry.rating, 0) /
          count
        ).toFixed(1)
      ),
      reviewCount: Math.round(periodPoints.reduce((sum, entry) => sum + entry.reviewCount, 0) / count),
    }
  })
}

export const DEFAULT_SELLER_LISTINGS: SellerListing[] = DEFAULT_SELLER_LISTING_SEEDS.map((listing) =>
  normalizeSellerListing(listing)
)
