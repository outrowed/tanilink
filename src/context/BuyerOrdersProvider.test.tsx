import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { AuthContext } from "@/context/auth"
import { BasketContext } from "@/context/basket"
import { BuyerOrdersProvider } from "@/context/BuyerOrdersProvider"
import { useBuyerOrders } from "@/context/buyer-orders"
import { MockDataContext } from "@/context/mock-data"
import {
  buyerUser,
  createAuthContextValue,
  createMockDataValue,
  sampleBasketLine,
  sampleCheckoutInput,
  sellerUser,
} from "@/test/fixtures"

function TransactionHarness() {
  const { accountTransactions, createTransactionFromBasket } = useBuyerOrders()
  const [message, setMessage] = useState("")

  return (
    <div>
      <p>{`Transactions: ${accountTransactions.length}`}</p>
      <button
        onClick={() => {
          const result = createTransactionFromBasket(sampleCheckoutInput)
          setMessage(result.ok ? `Created ${result.transaction?.id}` : result.error ?? "Unknown error")
        }}
        type="button"
      >
        Create transaction
      </button>
      <p>{message}</p>
    </div>
  )
}

describe("BuyerOrdersProvider", () => {
  it("creates a new transaction for seller accounts and clears the basket", async () => {
    const user = userEvent.setup()
    const clearBasket = vi.fn()

    render(
      <MockDataContext.Provider value={createMockDataValue({ accountTransactions: [] })}>
        <AuthContext.Provider value={createAuthContextValue(sellerUser)}>
          <BasketContext.Provider
            value={{
              basketLines: [sampleBasketLine],
              clearBasket,
              itemCount: sampleBasketLine.quantity,
              lineCount: 1,
              removeItem: vi.fn(),
              sellerCount: 1,
              subtotal: sampleBasketLine.quantity * sampleBasketLine.sellerPrice,
              addItem: vi.fn(),
              updateQuantity: vi.fn(),
            }}
          >
            <BuyerOrdersProvider>
              <TransactionHarness />
            </BuyerOrdersProvider>
          </BasketContext.Provider>
        </AuthContext.Provider>
      </MockDataContext.Provider>
    )

    await user.click(screen.getByRole("button", { name: "Create transaction" }))

    expect(screen.getByText(/^Created TNL-/)).toBeInTheDocument()
    expect(clearBasket).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Transactions: 1")).toBeInTheDocument()
  })

  it("creates a new transaction for buyer accounts and clears the basket", async () => {
    const user = userEvent.setup()
    const clearBasket = vi.fn()

    render(
      <MockDataContext.Provider value={createMockDataValue({ accountTransactions: [] })}>
        <AuthContext.Provider value={createAuthContextValue(buyerUser)}>
          <BasketContext.Provider
            value={{
              basketLines: [sampleBasketLine],
              clearBasket,
              itemCount: sampleBasketLine.quantity,
              lineCount: 1,
              removeItem: vi.fn(),
              sellerCount: 1,
              subtotal: sampleBasketLine.quantity * sampleBasketLine.sellerPrice,
              addItem: vi.fn(),
              updateQuantity: vi.fn(),
            }}
          >
            <BuyerOrdersProvider>
              <TransactionHarness />
            </BuyerOrdersProvider>
          </BasketContext.Provider>
        </AuthContext.Provider>
      </MockDataContext.Provider>
    )

    await user.click(screen.getByRole("button", { name: "Create transaction" }))

    expect(screen.getByText(/^Created TNL-/)).toBeInTheDocument()
    expect(clearBasket).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Transactions: 1")).toBeInTheDocument()
  })
})
