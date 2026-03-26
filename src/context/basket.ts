import { createContext, useContext } from "react"

import { type Product, type Seller } from "@/lib/data"

export interface BasketLine {
  id: string
  productSlug: Product["slug"]
  productName: Product["name"]
  productIcon: Product["icon"]
  unit: Product["unit"]
  sellerId: Seller["id"]
  sellerName: Seller["name"]
  sellerPrice: Seller["price"]
  quantity: number
}

export interface BasketContextValue {
  basketLines: BasketLine[]
  clearBasket: () => void
  itemCount: number
  lineCount: number
  removeItem: (lineId: string) => void
  sellerCount: number
  subtotal: number
  addItem: (product: Product, seller: Seller, quantity: number) => void
  updateQuantity: (lineId: string, quantity: number) => void
}

export const BasketContext = createContext<BasketContextValue | null>(null)

export function useBasket() {
  const context = useContext(BasketContext)

  if (!context) {
    throw new Error("useBasket must be used within BasketProvider")
  }

  return context
}
