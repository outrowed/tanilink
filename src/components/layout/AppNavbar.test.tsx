import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import AppNavbar from "@/components/layout/AppNavbar"
import { AuthContext } from "@/context/auth"
import { BasketContext } from "@/context/basket"
import { LocationContext } from "@/context/location"
import {
  createAuthContextValue,
  createBasketContextValue,
  createLocationContextValue,
  sellerUser,
} from "@/test/fixtures"

vi.mock("@/components/layout/FloatingLocationSwitcher", () => ({
  default: () => <div>Location switcher</div>,
}))

vi.mock("@/components/shared/SearchBox", () => ({
  default: ({ className }: { className?: string }) => <div className={className}>Search box</div>,
}))

function renderNavbar() {
  return render(
    <AuthContext.Provider value={createAuthContextValue(sellerUser)}>
      <LocationContext.Provider value={createLocationContextValue()}>
        <BasketContext.Provider value={createBasketContextValue({ itemCount: 2 })}>
          <MemoryRouter>
            <AppNavbar />
          </MemoryRouter>
        </BasketContext.Provider>
      </LocationContext.Provider>
    </AuthContext.Provider>
  )
}

describe("AppNavbar", () => {
  it("opens and closes the mobile navigation drawer", async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }))

    const dialog = screen.getByRole("dialog", { name: "Navigation menu" })

    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText("Current delivery area")).toBeInTheDocument()
    expect(within(dialog).getAllByText("Jakarta Selatan, Jakarta")).not.toHaveLength(0)
    expect(within(dialog).getByText("Account overview")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Logout" })).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Close menu" })).toBeInTheDocument()
    expect(within(dialog).getAllByText("Seller Hub")).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: "Close menu" }))

    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument()
    expect(screen.queryByText("Account overview")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument()
  })

  it("does not auto-close the mobile drawer immediately after the first open", async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }))

    await new Promise((resolve) => window.setTimeout(resolve, 10))

    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeInTheDocument()
    expect(screen.getByText("Account overview")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Close navigation menu" })).toHaveLength(2)
  })
})
