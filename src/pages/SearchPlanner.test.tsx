import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import SearchPlanner from "@/pages/SearchPlanner"
import { BasketContext } from "@/context/basket"
import { LocationContext } from "@/context/location"
import { MockDataContext } from "@/context/mock-data"
import { SellerContext } from "@/context/seller"
import {
  createBasketContextValue,
  createLocationContextValue,
  createMockDataValue,
  createSellerContextValue,
} from "@/test/fixtures"

vi.mock("@/components/dashboard/ProductPriceChart", () => ({
  default: ({
    compact,
    label,
    title,
  }: {
    compact?: boolean
    label?: string
    title?: string
  }) => <div>{compact ? `${label} mini chart` : title}</div>,
}))

function renderSearchPlanner(initialEntry: string) {
  function RouteProbe() {
    const location = useLocation()

    return (
      <>
        <SearchPlanner />
        <div data-testid="search-location">{location.search}</div>
      </>
    )
  }

  return render(
    <MockDataContext.Provider value={createMockDataValue()}>
      <SellerContext.Provider value={createSellerContextValue()}>
        <LocationContext.Provider value={createLocationContextValue()}>
          <BasketContext.Provider value={createBasketContextValue()}>
            <MemoryRouter initialEntries={[initialEntry]}>
              <Routes>
                <Route path="/search" element={<RouteProbe />} />
              </Routes>
            </MemoryRouter>
          </BasketContext.Provider>
        </LocationContext.Provider>
      </SellerContext.Provider>
    </MockDataContext.Provider>
  )
}

describe("SearchPlanner", () => {
  afterEach(() => {
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    }
  })

  it("preserves seller sort mode while preview query params change between ingredients", async () => {
    const user = userEvent.setup()

    renderSearchPlanner("/search?q=I%20want%20to%20cook%20nasi%20goreng%20for%2020%20portions&mode=ai")

    await user.click(screen.getAllByRole("button", { name: /Premium Rice/i })[0])
    await user.click(screen.getByRole("button", { name: "Lowest price" }))

    expect(screen.getByRole("button", { name: "Lowest price" })).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: /Broiler Chicken Fillet/i }))

    expect(screen.getByTestId("search-location")).toHaveTextContent("preview=chicken-fillet")
    expect(screen.getByRole("button", { name: "Lowest price" })).toHaveAttribute("aria-pressed", "true")
  })

  it("keeps the sidebar mounted during the close animation before unmounting it", async () => {
    vi.useFakeTimers()

    renderSearchPlanner("/search?q=I%20want%20to%20cook%20nasi%20goreng%20for%2020%20portions&mode=ai")

    fireEvent.click(screen.getAllByRole("button", { name: /Premium Rice/i })[0])

    expect(
      screen.getByText("Sort sellers by location, price, rating, or smart match")
    ).toBeInTheDocument()
    expect(screen.getByTestId("search-location")).toHaveTextContent("preview=premium-rice")

    fireEvent.click(screen.getAllByRole("button", { name: /Premium Rice/i })[0])

    expect(
      screen.getByText("Sort sellers by location, price, rating, or smart match")
    ).toBeInTheDocument()
    expect(screen.getByTestId("search-location")).not.toHaveTextContent("preview=premium-rice")

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(
      screen.queryByText("Sort sellers by location, price, rating, or smart match")
    ).not.toBeInTheDocument()
  })
})
