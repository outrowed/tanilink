export interface Seller {
  id: number
  name: string
  location: string
  warehouse: string
  delivery: string
  rating: number
  price: number
  stockLabel: string
  busyLevel: "Low" | "Moderate" | "High"
  activeOrders: number
  handlingTime: string
  unitsSold: number
}

export interface PriceHistoryPoint {
  month: string
  price: number
}

export type PriceHistoryRange = "1y" | "6m" | "1m" | "1w" | "24h"

export interface SalesHistoryPoint {
  orders: number
  period: string
  revenue: number
  salePrice: number
  unitsSold: number
}

export interface SalesHistorySummary {
  averageSalePrice: number
  latestSalePrice: number
  totalOrders: number
  totalRevenue: number
  totalUnitsSold: number
}

export interface Product {
  id: number
  name: string
  slug: string
  icon: string
  category: "Staple" | "Protein" | "Vegetable" | "Spice" | "Pantry"
  unit: string
  description: string
  marketStatus: string
  averagePrice: number
  priceChange: number
  yearlyHigh: number
  yearlyLow: number
  leadTime: string
  chartColor: string
  priceHistory: PriceHistoryPoint[]
  priceHistoryByRange: Record<PriceHistoryRange, PriceHistoryPoint[]>
  productSalesHistory: SalesHistoryPoint[]
  productSalesHistoryByRange: Record<PriceHistoryRange, SalesHistoryPoint[]>
  sellers: Seller[]
}

export interface SearchBundleIngredient {
  productSlug: Product["slug"]
  quantity: string
  role: string
}

export interface SearchBundle {
  id: string
  name: string
  type: "Dish" | "Supply kit"
  aliases: string[]
  description: string
  servings: string
  outputLabel: string
  ingredients: SearchBundleIngredient[]
}

export type UserLocationId = "jakarta-selatan" | "beji-depok" | "bekasi-barat" | "coblong-bandung"

export interface UserLocationOption {
  id: UserLocationId
  area: string
  city: string
  province: string
  zone: string
}

export type BaseSeller = Omit<Seller, "unitsSold">

export type BaseProduct = Omit<
  Product,
  "priceHistoryByRange" | "productSalesHistory" | "productSalesHistoryByRange" | "sellers"
> & {
  sellers: BaseSeller[]
}

export interface MarketplaceResource {
  baseProducts: BaseProduct[]
  defaultUserLocationId: UserLocationId
  recentAiSearches: string[]
  searchBundles: SearchBundle[]
  searchPrompts: string[]
  userLocationOptions: UserLocationOption[]
}

export const priceHistoryRangeLabels: Record<PriceHistoryRange, string> = {
  "1y": "1 year",
  "6m": "6 months",
  "1m": "1 month",
  "1w": "1 week",
  "24h": "24 hours",
}

const monthShortLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function clampPrice(value: number) {
  return Math.max(1_000, Math.round(value / 100) * 100)
}

function clampCount(value: number, minimum = 1) {
  return Math.max(minimum, Math.round(value))
}

function buildLastSixMonthHistory(history: PriceHistoryPoint[]) {
  return history.slice(-6)
}

function buildOneMonthHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const latestPrice = history[history.length - 1]?.price ?? product.averagePrice
  const startPrice = history[history.length - 2]?.price ?? latestPrice
  const dailyStep = (latestPrice - startPrice) / 29

  return Array.from({ length: 30 }, (_, index) => {
    const wave = Math.sin((index / 29) * Math.PI * 2) * (latestPrice * 0.018)
    const bias = product.priceChange >= 0 ? index * 18 : -index * 14
    const price = clampPrice(startPrice + dailyStep * index + wave + bias)

    return {
      month: `${weekdayLabels[index % weekdayLabels.length]} ${index + 1}`,
      price,
    }
  })
}

function buildOneWeekHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const monthlyHistory = buildOneMonthHistory(product, history)

  return monthlyHistory.slice(-7)
}

function buildTwentyFourHourHistory(product: BaseProduct, history: PriceHistoryPoint[]) {
  const latestPrice = history[history.length - 1]?.price ?? product.averagePrice
  const baseline = history[history.length - 2]?.price ?? latestPrice
  const slope = (latestPrice - baseline) / 23

  return Array.from({ length: 24 }, (_, index) => {
    const hour = String(index).padStart(2, "0")
    const pulse = Math.cos((index / 23) * Math.PI * 3) * (latestPrice * 0.006)
    const demandShift = index >= 17 ? latestPrice * 0.004 : index <= 6 ? -latestPrice * 0.003 : 0
    const price = clampPrice(baseline + slope * index + pulse + demandShift)

    return {
      month: `${hour}:00`,
      price,
    }
  })
}

function buildPriceHistoryByRange(product: BaseProduct): Record<PriceHistoryRange, PriceHistoryPoint[]> {
  const yearlyHistory = product.priceHistory.map((point, index) => ({
    month: monthShortLabels[index] ?? point.month,
    price: point.price,
  }))

  return {
    "1y": yearlyHistory,
    "6m": buildLastSixMonthHistory(yearlyHistory),
    "1m": buildOneMonthHistory(product, yearlyHistory),
    "1w": buildOneWeekHistory(product, yearlyHistory),
    "24h": buildTwentyFourHourHistory(product, yearlyHistory),
  }
}

const categorySalesBaseline: Record<Product["category"], number> = {
  Staple: 640,
  Protein: 420,
  Vegetable: 520,
  Spice: 310,
  Pantry: 560,
}

const rangeVolumeScale: Record<PriceHistoryRange, number> = {
  "1y": 1,
  "6m": 1,
  "1m": 0.18,
  "1w": 0.16,
  "24h": 0.035,
}

function buildProductSalesHistoryForRange(
  product: BaseProduct,
  history: PriceHistoryPoint[],
  range: PriceHistoryRange
): SalesHistoryPoint[] {
  const baselineUnits = categorySalesBaseline[product.category] * rangeVolumeScale[range]
  const markup = 1.014 + (product.id % 4) * 0.0035
  const orderDivisor =
    product.category === "Staple"
      ? 5.4
      : product.category === "Pantry"
        ? 6.1
        : product.category === "Spice"
          ? 4.2
          : 4.8

  return history.map((point, index) => {
    const seasonalWave = Math.sin(index * 0.92 + product.id * 0.55) * baselineUnits * 0.12
    const pricePressure =
      ((product.averagePrice - point.price) / Math.max(product.averagePrice, 1)) * baselineUnits * 0.32
    const demandPulse = Math.cos(index * 0.58 + product.priceChange * 0.12) * baselineUnits * 0.06
    const unitsSold = clampCount(baselineUnits + seasonalWave + pricePressure + demandPulse, 3)
    const orders = clampCount(unitsSold / orderDivisor + Math.sin(index * 0.41 + product.id) * 3, 1)
    const salePrice = clampPrice(point.price * markup)

    return {
      orders,
      period: point.month,
      revenue: salePrice * unitsSold,
      salePrice,
      unitsSold,
    }
  })
}

function buildProductSalesHistoryByRange(
  product: BaseProduct,
  priceHistoryByRange: Record<PriceHistoryRange, PriceHistoryPoint[]>
): Record<PriceHistoryRange, SalesHistoryPoint[]> {
  return {
    "1y": buildProductSalesHistoryForRange(product, priceHistoryByRange["1y"], "1y"),
    "6m": buildProductSalesHistoryForRange(product, priceHistoryByRange["6m"], "6m"),
    "1m": buildProductSalesHistoryForRange(product, priceHistoryByRange["1m"], "1m"),
    "1w": buildProductSalesHistoryForRange(product, priceHistoryByRange["1w"], "1w"),
    "24h": buildProductSalesHistoryForRange(product, priceHistoryByRange["24h"], "24h"),
  }
}

export function summarizeSalesHistory(history: SalesHistoryPoint[]): SalesHistorySummary {
  if (!history.length) {
    return {
      averageSalePrice: 0,
      latestSalePrice: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalUnitsSold: 0,
    }
  }

  const totalOrders = history.reduce((sum, point) => sum + point.orders, 0)
  const totalRevenue = history.reduce((sum, point) => sum + point.revenue, 0)
  const totalUnitsSold = history.reduce((sum, point) => sum + point.unitsSold, 0)
  const latestSalePrice = history[history.length - 1]?.salePrice ?? 0

  return {
    averageSalePrice: Math.round(history.reduce((sum, point) => sum + point.salePrice, 0) / history.length),
    latestSalePrice,
    totalOrders,
    totalRevenue,
    totalUnitsSold,
  }
}

function buildSellerUnitsSold(product: BaseProduct, totalUnitsSold: number) {
  if (!product.sellers.length) {
    return []
  }

  const weights = product.sellers.map((seller, index) => {
    const priceAdvantage = Math.max(
      0.8,
      1 + ((product.averagePrice - seller.price) / Math.max(product.averagePrice, 1)) * 1.8
    )
    const ratingBoost = seller.rating / 5
    const loadAdjustment = seller.busyLevel === "Low" ? 1.08 : seller.busyLevel === "Moderate" ? 1 : 0.92
    const positionBias = 1 + (product.sellers.length - index) * 0.06

    return Math.max(0.1, priceAdvantage * ratingBoost * loadAdjustment * positionBias)
  })

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let remainingUnits = totalUnitsSold

  return product.sellers.map((seller, index) => {
    const isLast = index === product.sellers.length - 1
    const allocatedUnits = isLast
      ? remainingUnits
      : clampCount((totalUnitsSold * weights[index]) / Math.max(totalWeight, 1), 1)

    remainingUnits = Math.max(0, remainingUnits - allocatedUnits)

    return {
      ...seller,
      unitsSold: allocatedUnits,
    }
  })
}

export function buildMarketplaceProducts(resource: MarketplaceResource): Product[] {
  return resource.baseProducts.map((product) => {
    const priceHistoryByRange = buildPriceHistoryByRange(product)
    const productSalesHistoryByRange = buildProductSalesHistoryByRange(product, priceHistoryByRange)
    const productSalesHistory = productSalesHistoryByRange["1y"]
    const productSalesSummary = summarizeSalesHistory(productSalesHistory)

    return {
      ...product,
      priceHistoryByRange,
      productSalesHistory,
      productSalesHistoryByRange,
      sellers: buildSellerUnitsSold(product, productSalesSummary.totalUnitsSold),
    }
  })
}

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
