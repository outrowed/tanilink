import { createContext, useContext } from "react"

import { type AccountResource, type InboxThread, type SettingsSection, type TransactionRecord } from "@/lib/account"
import { type AuthResource, type StoredAccount } from "@/lib/auth"
import {
  type MarketplaceResource,
  type Product,
  type SearchBundle,
  type UserLocationId,
  type UserLocationOption,
} from "@/lib/data"
import {
  type SellerListingSeed,
  type SellerResource,
  type SellerStoreProfile,
} from "@/lib/seller"

export interface MockDataContextValue {
  accountResource: AccountResource
  accountTransactions: TransactionRecord[]
  authResource: AuthResource
  baseMarketplaceProducts: Product[]
  defaultSellerListingSeeds: SellerListingSeed[]
  defaultSellerProfile: SellerStoreProfile
  defaultUserLocationId: UserLocationId
  inboxThreads: InboxThread[]
  marketplaceResource: MarketplaceResource
  presetAccounts: StoredAccount[]
  recentAiSearches: string[]
  searchBundles: SearchBundle[]
  searchPrompts: string[]
  sellerResource: SellerResource
  settingsSections: SettingsSection[]
  userLocationOptions: UserLocationOption[]
}

export const MockDataContext = createContext<MockDataContextValue | null>(null)

export function useMockData() {
  const context = useContext(MockDataContext)

  if (!context) {
    throw new Error("useMockData must be used within MockDataProvider")
  }

  return context
}
