import { createContext, useContext } from "react"

import { type Product } from "@/lib/data"
import {
  type CreateSellerListingInput,
  type SellerDeliveryOption,
  type SellerHubSummary,
  type SellerListing,
  type SellerStoreLocation,
  type SellerStoreProfile,
} from "@/lib/seller"

export interface CreateListingResult {
  listingId: number
  status: "created" | "updated"
}

export interface SellerContextValue {
  addDeliveryOption: (input: Omit<SellerDeliveryOption, "id">) => void
  addLocation: (input: Omit<SellerStoreLocation, "id">) => void
  createListing: (input: CreateSellerListingInput) => CreateListingResult | null
  currentSellerListings: SellerListing[]
  currentStoreProfile: SellerStoreProfile | null
  getProductBySlug: (slug: Product["slug"]) => Product | undefined
  marketplaceProducts: Product[]
  removeDeliveryOption: (deliveryOptionId: string) => void
  removeListing: (listingId: number) => void
  removeLocation: (locationId: string) => void
  sellerSummary: SellerHubSummary | null
  toggleListing: (listingId: number) => void
  updateDeliveryOption: (deliveryOptionId: string, patch: Partial<Omit<SellerDeliveryOption, "id">>) => void
  updateListing: (
    listingId: number,
    patch: Partial<Omit<SellerListing, "id" | "productSlug" | "sellerAccountId">>
  ) => void
  updateLocation: (locationId: string, patch: Partial<Omit<SellerStoreLocation, "id">>) => void
  updateStoreProfile: (
    patch: Partial<Pick<SellerStoreProfile, "contactPhone" | "description" | "ownerName" | "storeName">>
  ) => void
}

export const SellerContext = createContext<SellerContextValue | null>(null)

function useSellerContext() {
  const context = useContext(SellerContext)

  if (!context) {
    throw new Error("useSellerContext must be used within SellerProvider")
  }

  return context
}

export function useSellerStore() {
  return useSellerContext()
}

export function useMarketplace() {
  return useSellerContext()
}
