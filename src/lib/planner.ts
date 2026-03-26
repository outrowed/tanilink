import {
  formatRupiah,
  products,
  searchBundles,
  userLocation,
  type PriceHistoryPoint,
  type Product,
  type SearchBundle,
  type SearchBundleIngredient,
  type Seller,
} from "@/lib/data"

export type SellerSortMode = "smart" | "location" | "price" | "rating"

export interface RankedSeller extends Seller {
  distanceKm: number
  marketDelta: number
  marketDeltaLabel: string
  smartScore: number
}

export interface ResolvedIngredient {
  product: Product
  quantity: string
  role: string
  recommendedSeller: RankedSeller
  rankedSellers: RankedSeller[]
  sourcingReason: string
}

export interface SearchPlan {
  bundle: SearchBundle
  ingredients: ResolvedIngredient[]
  totalEstimatedCost: number
  totalMarketSpend: number
  totalSavings: number
  marketPressure: string
}

export interface BundleMatch {
  bundle: SearchBundle
  matchedAlias: string
  matchType: "exact" | "related" | "fallback"
}

const distanceFromSouthJakarta: Record<string, number> = {
  Bandung: 150,
  Batu: 890,
  Bekasi: 28,
  Bogor: 52,
  Brebes: 337,
  Cianjur: 105,
  Cirebon: 225,
  Depok: 18,
  Garut: 240,
  Karawang: 67,
  Lembang: 172,
  Malang: 880,
  Pemalang: 323,
  Subang: 118,
  Sukabumi: 115,
  Tangerang: 24,
  Tegal: 304,
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getDistanceKm(city: string) {
  return distanceFromSouthJakarta[city] ?? 180
}

function getBusyPenalty(level: Seller["busyLevel"]) {
  switch (level) {
    case "Low":
      return 0
    case "Moderate":
      return 8
    case "High":
      return 18
  }
}

function getLatestPrice(history: PriceHistoryPoint[]) {
  return history[history.length - 1]?.price ?? 0
}

function formatMarketDelta(delta: number) {
  return delta <= 0
    ? `${formatRupiah(Math.abs(delta))} below market`
    : `${formatRupiah(delta)} above market`
}

export function findBundleMatch(query: string): BundleMatch {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    const bundle = searchBundles[0]
    return {
      bundle,
      matchedAlias: bundle.aliases[0],
      matchType: "fallback",
    }
  }

  const scoredMatches = searchBundles.flatMap((bundle) =>
    bundle.aliases.map((alias) => {
      const normalizedAlias = normalize(alias)
      let score = 0

      if (normalizedQuery === normalizedAlias) {
        score += 100
      }

      if (normalizedQuery.includes(normalizedAlias) || normalizedAlias.includes(normalizedQuery)) {
        score += 60
      }

      const queryWords = normalizedQuery.split(" ")
      const aliasWords = normalizedAlias.split(" ")
      const overlappingWords = queryWords.filter((word) => aliasWords.includes(word)).length
      score += overlappingWords * 12

      return {
        alias,
        bundle,
        score,
      }
    })
  )

  const bestMatch = scoredMatches.sort((left, right) => right.score - left.score)[0]

  if (!bestMatch || bestMatch.score <= 0) {
    const fallbackBundle = searchBundles[0]
    return {
      bundle: fallbackBundle,
      matchedAlias: fallbackBundle.aliases[0],
      matchType: "fallback",
    }
  }

  return {
    bundle: bestMatch.bundle,
    matchedAlias: bestMatch.alias,
    matchType: bestMatch.score >= 100 ? "exact" : "related",
  }
}

export function rankSellers(product: Product, mode: SellerSortMode = "smart") {
  const latestPrice = getLatestPrice(product.priceHistory)

  const rankedSellers: RankedSeller[] = product.sellers.map((seller) => {
    const distanceKm = getDistanceKm(seller.location)
    const marketDelta = seller.price - latestPrice
    const priceScore = Math.max(0, 100 + ((latestPrice - seller.price) / latestPrice) * 160)
    const locationScore = Math.max(0, 100 - distanceKm * 0.5)
    const ratingScore = seller.rating * 20
    const trendBonus = product.priceChange > 0 && seller.price <= product.averagePrice ? 10 : 0
    const smartScore = Number(
      (
        priceScore * 0.38 +
        locationScore * 0.27 +
        ratingScore * 0.25 +
        trendBonus -
        getBusyPenalty(seller.busyLevel)
      ).toFixed(1)
    )

    return {
      ...seller,
      distanceKm,
      marketDelta,
      marketDeltaLabel: formatMarketDelta(marketDelta),
      smartScore,
    }
  })

  const sorted = [...rankedSellers]

  switch (mode) {
    case "location":
      sorted.sort((left, right) => left.distanceKm - right.distanceKm || left.price - right.price)
      break
    case "price":
      sorted.sort((left, right) => left.price - right.price || left.distanceKm - right.distanceKm)
      break
    case "rating":
      sorted.sort((left, right) => right.rating - left.rating || left.price - right.price)
      break
    case "smart":
      sorted.sort((left, right) => right.smartScore - left.smartScore || left.price - right.price)
      break
  }

  return sorted
}

function resolveIngredient(ingredient: SearchBundleIngredient): ResolvedIngredient {
  const product = products.find((item) => item.slug === ingredient.productSlug)

  if (!product) {
    throw new Error(`Unknown product slug: ${ingredient.productSlug}`)
  }

  const rankedSellers = rankSellers(product, "smart")
  const recommendedSeller = rankedSellers[0]
  const reasons = []

  if (recommendedSeller.distanceKm <= 35) {
    reasons.push("closest lane to South Jakarta")
  }

  if (recommendedSeller.marketDelta <= 0) {
    reasons.push("priced below the current market line")
  }

  if (recommendedSeller.busyLevel === "Low") {
    reasons.push("light handling load")
  }

  if (recommendedSeller.rating >= 4.8) {
    reasons.push("consistently high seller rating")
  }

  return {
    product,
    quantity: ingredient.quantity,
    role: ingredient.role,
    recommendedSeller,
    rankedSellers,
    sourcingReason: reasons.join(", "),
  }
}

export function buildSearchPlan(query: string): SearchPlan & { match: BundleMatch } {
  const match = findBundleMatch(query)
  const ingredients = match.bundle.ingredients.map(resolveIngredient)
  const totalEstimatedCost = ingredients.reduce(
    (sum, ingredient) => sum + ingredient.recommendedSeller.price,
    0
  )
  const totalMarketSpend = ingredients.reduce(
    (sum, ingredient) => sum + getLatestPrice(ingredient.product.priceHistory),
    0
  )
  const totalSavings = totalMarketSpend - totalEstimatedCost
  const risingProducts = ingredients.filter((ingredient) => ingredient.product.priceChange > 0).length

  return {
    bundle: match.bundle,
    ingredients,
    totalEstimatedCost,
    totalMarketSpend,
    totalSavings,
    marketPressure:
      risingProducts >= 3
        ? "Several ingredients are trending upward, so the planner favors cheaper nearby stock with lighter seller load."
        : "Market pressure is manageable, so the planner balances price, distance, rating, and seller capacity.",
    match,
  }
}

export function getIngredientView(
  query: string,
  productSlug: Product["slug"] | null,
  sortMode: SellerSortMode
) {
  const plan = buildSearchPlan(query)
  const activeIngredient =
    plan.ingredients.find((ingredient) => ingredient.product.slug === productSlug) ??
    plan.ingredients[0]

  return {
    ...plan,
    activeIngredient: {
      ...activeIngredient,
      rankedSellers: rankSellers(activeIngredient.product, sortMode),
    },
  }
}

export function describeUserLocation() {
  return `${userLocation.area}, ${userLocation.city}, ${userLocation.province}`
}
