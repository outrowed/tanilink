import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { type Product, type Seller } from "@/lib/data"
import { BasketContext, type BasketLine } from "@/context/basket"

const STORAGE_KEY = "tanilink:basket"

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 1
  }

  return Math.max(1, Math.floor(quantity))
}

function readInitialBasket() {
  if (typeof window === "undefined") {
    return [] as BasketLine[]
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue ? (JSON.parse(storedValue) as BasketLine[]) : []
  } catch {
    return []
  }
}

interface BasketProviderProps {
  children: ReactNode
}

function BasketProvider({ children }: BasketProviderProps) {
  const [basketLines, setBasketLines] = useState<BasketLine[]>(readInitialBasket)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(basketLines))
  }, [basketLines])

  const addItem = useCallback((product: Product, seller: Seller, quantity: number) => {
    const nextQuantity = clampQuantity(quantity)
    const lineId = `${product.slug}:${seller.id}`

    setBasketLines((currentLines) => {
      const existingLine = currentLines.find((line) => line.id === lineId)

      if (existingLine) {
        return currentLines.map((line) =>
          line.id === lineId
            ? { ...line, quantity: line.quantity + nextQuantity, sellerPrice: seller.price }
            : line
        )
      }

      return [
        ...currentLines,
        {
          id: lineId,
          productSlug: product.slug,
          productName: product.name,
          productIcon: product.icon,
          quantity: nextQuantity,
          sellerId: seller.id,
          sellerName: seller.name,
          sellerPrice: seller.price,
          unit: product.unit,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const nextQuantity = clampQuantity(quantity)

    setBasketLines((currentLines) =>
      currentLines.map((line) => (line.id === lineId ? { ...line, quantity: nextQuantity } : line))
    )
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setBasketLines((currentLines) => currentLines.filter((line) => line.id !== lineId))
  }, [])

  const clearBasket = useCallback(() => {
    setBasketLines([])
  }, [])

  const value = useMemo(
    () => ({
      addItem,
      basketLines,
      clearBasket,
      itemCount: basketLines.reduce((sum, line) => sum + line.quantity, 0),
      lineCount: basketLines.length,
      removeItem,
      sellerCount: new Set(basketLines.map((line) => line.sellerId)).size,
      subtotal: basketLines.reduce((sum, line) => sum + line.quantity * line.sellerPrice, 0),
      updateQuantity,
    }),
    [addItem, basketLines, clearBasket, removeItem, updateQuantity]
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export { BasketProvider }
