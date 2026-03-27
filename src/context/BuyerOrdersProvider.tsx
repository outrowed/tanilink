import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { useAuth } from "@/context/auth"
import { useBasket } from "@/context/basket"
import { BuyerOrdersContext } from "@/context/buyer-orders"
import { useMockData } from "@/context/mock-data"
import { normalizeEmail } from "@/lib/auth"
import {
  buildTransactionFromBasket,
  normalizeTransaction,
  type CheckoutInput,
  type Transaction,
  type TransactionRecord,
} from "@/lib/account"

const STORAGE_KEY = "tanilink:buyer-orders"

type StoredTransactionsByUser = Record<string, TransactionRecord[]>

function readStoredTransactions(): StoredTransactionsByUser {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue ? (JSON.parse(storedValue) as StoredTransactionsByUser) : {}
  } catch {
    return {}
  }
}

function buildUserStorageKey(userId: string, email: string) {
  return `${userId}:${normalizeEmail(email)}`
}

interface BuyerOrdersProviderProps {
  children: ReactNode
}

function BuyerOrdersProvider({ children }: BuyerOrdersProviderProps) {
  const { user } = useAuth()
  const { basketLines, clearBasket } = useBasket()
  const { accountTransactions: seededTransactions } = useMockData()
  const [storedTransactionsByUser, setStoredTransactionsByUser] = useState<StoredTransactionsByUser>(
    readStoredTransactions
  )

  const normalizedSeedTransactions = useMemo(
    () => seededTransactions.map((transaction) => normalizeTransaction(transaction)),
    [seededTransactions]
  )

  const userStorageKey = user ? buildUserStorageKey(user.id, user.email) : null

  const accountTransactions = useMemo(() => {
    const persistedTransactions = userStorageKey
      ? (storedTransactionsByUser[userStorageKey] ?? []).map((transaction) => normalizeTransaction(transaction))
      : []

    return [...persistedTransactions, ...normalizedSeedTransactions]
  }, [normalizedSeedTransactions, storedTransactionsByUser, userStorageKey])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTransactionsByUser))
  }, [storedTransactionsByUser])

  const createTransactionFromBasket = useCallback(
    (checkoutInput: CheckoutInput) => {
      if (!user || !userStorageKey) {
        return {
          error: "Sign in to continue with checkout.",
          ok: false,
        }
      }

      if (!basketLines.length) {
        return {
          error: "Your basket is empty.",
          ok: false,
        }
      }

      const transaction = buildTransactionFromBasket(
        basketLines.map((line) => ({
          productIcon: line.productIcon,
          productName: line.productName,
          productSlug: line.productSlug,
          quantity: line.quantity,
          sellerName: line.sellerName,
          sellerPrice: line.sellerPrice,
          unit: line.unit,
        })),
        checkoutInput
      )

      setStoredTransactionsByUser((current) => ({
        ...current,
        [userStorageKey]: [transaction, ...(current[userStorageKey] ?? [])],
      }))
      clearBasket()

      return {
        ok: true,
        transaction,
      } satisfies { ok: true; transaction: Transaction }
    },
    [basketLines, clearBasket, user, userStorageKey]
  )

  const value = useMemo(
    () => ({
      accountTransactions,
      createTransactionFromBasket,
    }),
    [accountTransactions, createTransactionFromBasket]
  )

  return <BuyerOrdersContext.Provider value={value}>{children}</BuyerOrdersContext.Provider>
}

export { BuyerOrdersProvider }
