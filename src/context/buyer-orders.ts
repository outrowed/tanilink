import { createContext, useContext } from "react"

import { type CheckoutInput, type Transaction } from "@/lib/account"

export interface BuyerOrdersActionResult {
  error?: string
  ok: boolean
  transaction?: Transaction
}

export interface BuyerOrdersContextValue {
  accountTransactions: Transaction[]
  createTransactionFromBasket: (checkoutInput: CheckoutInput) => BuyerOrdersActionResult
}

export const BuyerOrdersContext = createContext<BuyerOrdersContextValue | null>(null)

export function useBuyerOrders() {
  const context = useContext(BuyerOrdersContext)

  if (!context) {
    throw new Error("useBuyerOrders must be used within BuyerOrdersProvider")
  }

  return context
}
