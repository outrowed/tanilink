import { useEffect, useMemo, useState, type ReactNode } from "react"

import { MockDataContext, type MockDataContextValue } from "@/context/mock-data"
import { type AccountResource } from "@/lib/account"
import { type AuthResource } from "@/lib/auth"
import { buildMarketplaceProducts, type MarketplaceResource } from "@/lib/data"
import { type SellerResource } from "@/lib/seller"

interface MockDataProviderProps {
  children: ReactNode
}

interface MockDataProviderState {
  error: string | null
  isLoading: boolean
  value: MockDataContextValue | null
}

function buildResourceUrl(fileName: string) {
  return `${import.meta.env.BASE_URL}resources/${fileName}`
}

async function loadResource<T>(fileName: string): Promise<T> {
  const response = await fetch(buildResourceUrl(fileName))

  if (!response.ok) {
    throw new Error(`Failed to load ${fileName} (${response.status})`)
  }

  return (await response.json()) as T
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "var(--page-bg, #f5f1ea)",
        color: "var(--foreground, #1f1a16)",
      }}
    >
      <div style={{ maxWidth: "420px", textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.64 }}>
          Loading resources
        </p>
        <h1 style={{ fontSize: "1.5rem", margin: "12px 0 8px" }}>Preparing the marketplace data</h1>
        <p style={{ margin: 0, opacity: 0.74 }}>
          TaniLink is loading marketplace, account, seller, and planner resources.
        </p>
      </div>
    </div>
  )
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "var(--page-bg, #f5f1ea)",
        color: "var(--foreground, #1f1a16)",
      }}
    >
      <div style={{ maxWidth: "460px", textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.64 }}>
          Resource load failed
        </p>
        <h1 style={{ fontSize: "1.5rem", margin: "12px 0 8px" }}>TaniLink could not start correctly</h1>
        <p style={{ margin: 0, opacity: 0.74 }}>
          {error}
        </p>
      </div>
    </div>
  )
}

function MockDataProvider({ children }: MockDataProviderProps) {
  const [state, setState] = useState<MockDataProviderState>({
    error: null,
    isLoading: true,
    value: null,
  })

  useEffect(() => {
    let isActive = true

    async function loadResources() {
      try {
        const [marketplaceResource, accountResource, authResource, sellerResource] = await Promise.all([
          loadResource<MarketplaceResource>("marketplace.json"),
          loadResource<AccountResource>("account.json"),
          loadResource<AuthResource>("auth.json"),
          loadResource<SellerResource>("seller.json"),
        ])

        if (!isActive) {
          return
        }

        const baseMarketplaceProducts = buildMarketplaceProducts(marketplaceResource)

        setState({
          error: null,
          isLoading: false,
          value: {
            accountResource,
            accountTransactions: accountResource.accountTransactions,
            authResource,
            baseMarketplaceProducts,
            defaultSellerListingSeeds: sellerResource.defaultSellerListingSeeds,
            defaultSellerProfile: sellerResource.defaultSellerProfile,
            defaultUserLocationId: marketplaceResource.defaultUserLocationId,
            inboxThreads: accountResource.inboxThreads,
            marketplaceResource,
            presetAccounts: authResource.presetAccounts,
            recentAiSearches: marketplaceResource.recentAiSearches,
            searchBundles: marketplaceResource.searchBundles,
            searchPrompts: marketplaceResource.searchPrompts,
            sellerResource,
            settingsSections: accountResource.settingsSections,
            userLocationOptions: marketplaceResource.userLocationOptions,
          },
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        setState({
          error: error instanceof Error ? error.message : "Unknown resource loading error.",
          isLoading: false,
          value: null,
        })
      }
    }

    loadResources()

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo(() => state.value, [state.value])

  if (state.isLoading || !value) {
    return state.error ? <ErrorScreen error={state.error} /> : <LoadingScreen />
  }

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

export { MockDataProvider }
