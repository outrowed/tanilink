import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import ScrollManager from "@/components/layout/ScrollManager"

let scrollX = 0
let scrollY = 0
let scrollToMock = vi.fn()

const originalScrollTo = window.scrollTo
const originalScrollXDescriptor = Object.getOwnPropertyDescriptor(window, "scrollX")
const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, "scrollY")
const originalPageXOffsetDescriptor = Object.getOwnPropertyDescriptor(window, "pageXOffset")
const originalPageYOffsetDescriptor = Object.getOwnPropertyDescriptor(window, "pageYOffset")

function MarketplaceRoute() {
  return (
    <div>
      <h1>Marketplace</h1>
      <Link to="/basket">Go to basket</Link>
    </div>
  )
}

function BasketRoute() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Basket</h1>
      <button onClick={() => navigate(-1)} type="button">
        Go back
      </button>
    </div>
  )
}

function SearchRoute() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div>
      <p data-testid="search-params">{searchParams.toString()}</p>
      <button
        onClick={() => {
          const nextSearchParams = new URLSearchParams(searchParams)
          nextSearchParams.set("preview", "premium-rice")
          setSearchParams(nextSearchParams, { replace: true })
        }}
        type="button"
      >
        Set preview
      </button>
      <button
        onClick={() => {
          const nextSearchParams = new URLSearchParams(searchParams)
          nextSearchParams.set("category", "staple")
          setSearchParams(nextSearchParams, { replace: true })
        }}
        type="button"
      >
        Set category
      </button>
      <button
        onClick={() => navigate("/search?q=ayam%20geprek&mode=ai")}
        type="button"
      >
        New query
      </button>
    </div>
  )
}

function renderWithRouter(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ScrollManager />
      <Routes>
        <Route element={<MarketplaceRoute />} path="/marketplace" />
        <Route element={<BasketRoute />} path="/basket" />
        <Route element={<SearchRoute />} path="/search" />
      </Routes>
    </MemoryRouter>
  )
}

describe("ScrollManager", () => {
  beforeEach(() => {
    scrollX = 0
    scrollY = 0

    Object.defineProperty(window, "scrollX", {
      configurable: true,
      get: () => scrollX,
    })

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    })

    Object.defineProperty(window, "pageXOffset", {
      configurable: true,
      get: () => scrollX,
    })

    Object.defineProperty(window, "pageYOffset", {
      configurable: true,
      get: () => scrollY,
    })

    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: (scrollToMock = vi.fn((options?: ScrollToOptions | number, top?: number) => {
        if (typeof options === "object") {
          scrollX = Number(options.left ?? 0)
          scrollY = Number(options.top ?? 0)
          return
        }

        scrollX = Number(options ?? 0)
        scrollY = Number(top ?? 0)
      })),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: originalScrollTo,
    })

    if (originalScrollXDescriptor) {
      Object.defineProperty(window, "scrollX", originalScrollXDescriptor)
    }

    if (originalScrollYDescriptor) {
      Object.defineProperty(window, "scrollY", originalScrollYDescriptor)
    }

    if (originalPageXOffsetDescriptor) {
      Object.defineProperty(window, "pageXOffset", originalPageXOffsetDescriptor)
    }

    if (originalPageYOffsetDescriptor) {
      Object.defineProperty(window, "pageYOffset", originalPageYOffsetDescriptor)
    }
  })

  it("resets scroll on new route navigation and restores it on browser back", async () => {
    const user = userEvent.setup()

    renderWithRouter("/marketplace")

    scrollToMock.mockClear()
    scrollY = 320

    await user.click(screen.getByRole("link", { name: "Go to basket" }))

    expect(screen.getByText("Basket")).toBeInTheDocument()
    expect(scrollY).toBe(0)

    scrollToMock.mockClear()
    scrollY = 860

    await user.click(screen.getByRole("button", { name: "Go back" }))

    expect(screen.getByText("Marketplace")).toBeInTheDocument()
    expect(scrollY).toBe(320)
    expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 320 })
  })

  it("preserves scroll for same-query search param updates and resets when q changes", async () => {
    const user = userEvent.setup()

    renderWithRouter("/search?q=nasi%20goreng&mode=ai")

    scrollToMock.mockClear()
    scrollY = 410

    await user.click(screen.getByRole("button", { name: "Set preview" }))

    expect(screen.getByTestId("search-params")).toHaveTextContent("preview=premium-rice")
    expect(scrollY).toBe(410)
    expect(window.scrollTo).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Set category" }))

    expect(screen.getByTestId("search-params")).toHaveTextContent("category=staple")
    expect(scrollY).toBe(410)
    expect(window.scrollTo).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "New query" }))

    expect(screen.getByTestId("search-params")).toHaveTextContent("q=ayam+geprek")
    expect(scrollY).toBe(0)
    expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 0 })
  })
})
