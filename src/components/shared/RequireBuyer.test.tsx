import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, expect, it } from "vitest"

import RequireBuyer from "@/components/shared/RequireBuyer"
import { AuthContext } from "@/context/auth"
import {
  buyerUser,
  createAuthContextValue,
  sellerUser,
} from "@/test/fixtures"

function LocationProbe() {
  const location = useLocation()

  return <div>{`${location.pathname}${location.search}`}</div>
}

function renderGuard(authValue: ReturnType<typeof createAuthContextValue>) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={["/checkout"]}>
        <Routes>
          <Route path="/auth" element={<LocationProbe />} />
          <Route path="/account" element={<LocationProbe />} />
          <Route element={<RequireBuyer />}>
            <Route path="/checkout" element={<LocationProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe("RequireBuyer", () => {
  it("redirects anonymous users to auth with a checkout redirect", () => {
    renderGuard(createAuthContextValue(null))

    expect(screen.getByText("/auth?redirect=%2Fcheckout")).toBeInTheDocument()
  })

  it("allows buyer accounts through to checkout", () => {
    renderGuard(createAuthContextValue(buyerUser))

    expect(screen.getByText("/checkout")).toBeInTheDocument()
  })

  it("redirects seller accounts back to account pages", () => {
    renderGuard(createAuthContextValue(sellerUser))

    expect(screen.getByText("/account")).toBeInTheDocument()
  })
})
