import { type Product } from "@/lib/data"

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

export function matchesProductQuery(product: Product, query: string) {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return true
  }

  return [
    product.name,
    product.category,
    product.description,
    product.marketStatus,
    ...product.sellers.map((seller) => seller.location),
    ...product.sellers.map((seller) => seller.name),
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function getProductSuggestions(products: Product[], query: string, limit = 5) {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return []
  }

  return products.filter((product) => matchesProductQuery(product, normalizedQuery)).slice(0, limit)
}
