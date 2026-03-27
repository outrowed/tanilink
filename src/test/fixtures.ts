import type { AuthContextValue } from "@/context/auth"
import type { BasketContextValue, BasketLine } from "@/context/basket"
import type { LocationContextValue } from "@/context/location"
import type { MockDataContextValue } from "@/context/mock-data"
import type { SellerContextValue } from "@/context/seller"
import type { CheckoutInput } from "@/lib/account"
import type { AccountResource } from "@/lib/account"
import type { AuthResource, AuthUser } from "@/lib/auth"
import type { MarketplaceResource, Product } from "@/lib/data"
import { buildMarketplaceProducts } from "@/lib/data"
import type { SellerResource } from "@/lib/seller"

import accountResourceJson from "../../public/resources/account.json"
import authResourceJson from "../../public/resources/auth.json"
import marketplaceResourceJson from "../../public/resources/marketplace.json"
import sellerResourceJson from "../../public/resources/seller.json"

const marketplaceResource = marketplaceResourceJson as MarketplaceResource
const accountResource = accountResourceJson as AccountResource
const authResource = authResourceJson as AuthResource
const sellerResource = sellerResourceJson as SellerResource

const baseMarketplaceProducts = buildMarketplaceProducts(marketplaceResource)
const defaultLocation =
  marketplaceResource.userLocationOptions.find(
    (location) => location.id === marketplaceResource.defaultUserLocationId
  ) ?? marketplaceResource.userLocationOptions[0]

const buyerUser = authResource.presetAccounts.find((account) => account.role === "buyer") as AuthUser
const sellerUser = authResource.presetAccounts.find((account) => account.role === "seller") as AuthUser

const sampleBasketLine: BasketLine = {
  id: "premium-rice:101",
  productSlug: "premium-rice",
  productName: "Premium Rice",
  productIcon: "BR",
  unit: "per 5 kg sack",
  sellerId: 101,
  sellerName: "Karawang Grain Union",
  sellerPrice: 75800,
  quantity: 2,
}

const sampleCheckoutInput: CheckoutInput = {
  deliveryAddress: "Jl. Tebet Timur Dalam VIII No. 17, Jakarta Selatan",
  deliveryMethod: "Same-day metro",
  paymentMethod: "Bank transfer",
  recipientName: "Rizky Pratama",
  recipientPhone: "+62 812 8900 1145",
}

function createMockDataValue(overrides: Partial<MockDataContextValue> = {}): MockDataContextValue {
  return {
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
    ...overrides,
  }
}

function createSellerContextValue(overrides: Partial<SellerContextValue> = {}): SellerContextValue {
  const marketplaceProducts = overrides.marketplaceProducts ?? baseMarketplaceProducts

  return {
    addDeliveryOption: () => {},
    addLocation: () => {},
    createListing: () => null,
    currentSellerListings: [],
    currentStoreProfile: sellerResource.defaultSellerProfile,
    getProductBySlug: (slug: Product["slug"]) =>
      marketplaceProducts.find((product) => product.slug === slug),
    marketplaceProducts,
    removeDeliveryOption: () => {},
    removeListing: () => {},
    removeLocation: () => {},
    sellerSummary: null,
    toggleListing: () => {},
    updateDeliveryOption: () => {},
    updateListing: () => {},
    updateLocation: () => {},
    updateStoreProfile: () => {},
    ...overrides,
  }
}

function createLocationContextValue(
  overrides: Partial<LocationContextValue> = {}
): LocationContextValue {
  return {
    currentLocation: defaultLocation,
    locationOptions: marketplaceResource.userLocationOptions,
    selectedLocationId: defaultLocation.id,
    setSelectedLocationId: () => {},
    ...overrides,
  }
}

function createBasketContextValue(
  overrides: Partial<BasketContextValue> = {}
): BasketContextValue {
  return {
    basketLines: [],
    clearBasket: () => {},
    itemCount: 0,
    lineCount: 0,
    removeItem: () => {},
    sellerCount: 0,
    subtotal: 0,
    addItem: () => {},
    updateQuantity: () => {},
    ...overrides,
  }
}

function createAuthContextValue(
  user: AuthUser | null,
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue {
  return {
    isAuthenticated: Boolean(user),
    isBuyer: user?.role === "buyer",
    isSeller: user?.role === "seller",
    login: () => ({ ok: true }),
    logout: () => {},
    signup: () => ({ ok: true }),
    user,
    ...overrides,
  }
}

export {
  authResource,
  baseMarketplaceProducts,
  buyerUser,
  createAuthContextValue,
  createBasketContextValue,
  createLocationContextValue,
  createMockDataValue,
  createSellerContextValue,
  defaultLocation,
  marketplaceResource,
  sampleBasketLine,
  sampleCheckoutInput,
  sellerUser,
}
