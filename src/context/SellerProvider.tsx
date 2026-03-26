import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { useAuth } from "@/context/auth"
import { SellerContext, type CreateListingResult } from "@/context/seller"
import { products as baseProducts, type Product, type Seller } from "@/lib/data"
import {
  DEFAULT_SELLER_LISTINGS,
  DEFAULT_SELLER_PROFILE,
  clampMoney,
  clampStockQuantity,
  deriveListingMetrics,
  type CreateSellerListingInput,
  type SellerDeliveryOption,
  type SellerHubSummary,
  type SellerListing,
  type SellerStoreLocation,
  type SellerStoreProfile,
} from "@/lib/seller"

const STORAGE_KEY = "tanilink:seller-store"

interface PersistedSellerState {
  listings: SellerListing[]
  profiles: SellerStoreProfile[]
}

function readInitialSellerState(): PersistedSellerState {
  if (typeof window === "undefined") {
    return {
      listings: DEFAULT_SELLER_LISTINGS,
      profiles: [DEFAULT_SELLER_PROFILE],
    }
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return {
        listings: DEFAULT_SELLER_LISTINGS,
        profiles: [DEFAULT_SELLER_PROFILE],
      }
    }

    const parsedValue = JSON.parse(storedValue) as Partial<PersistedSellerState>

    return {
      listings: parsedValue.listings ?? DEFAULT_SELLER_LISTINGS,
      profiles: parsedValue.profiles ?? [DEFAULT_SELLER_PROFILE],
    }
  } catch {
    return {
      listings: DEFAULT_SELLER_LISTINGS,
      profiles: [DEFAULT_SELLER_PROFILE],
    }
  }
}

function getBusyLevel(activeOrders: number): Seller["busyLevel"] {
  if (activeOrders >= 20) {
    return "High"
  }

  if (activeOrders >= 10) {
    return "Moderate"
  }

  return "Low"
}

function getLocationForListing(profile: SellerStoreProfile, listing: SellerListing) {
  return profile.locations.find((location) => location.id === listing.warehouseLocationId) ?? profile.locations[0]
}

function getDeliveryOptionsForListing(profile: SellerStoreProfile, listing: SellerListing) {
  return profile.deliveryOptions.filter((option) => listing.deliveryOptionIds.includes(option.id))
}

function formatStockLabel(listing: SellerListing) {
  return listing.stockLabel.trim() || `${listing.stockQuantity} units ready`
}

function formatDeliveryLabel(profile: SellerStoreProfile, listing: SellerListing) {
  const deliveryOptions = getDeliveryOptionsForListing(profile, listing)

  if (!deliveryOptions.length) {
    return "Seller-arranged delivery"
  }

  return deliveryOptions.map((option) => option.leadTime).join(" / ")
}

function mapListingToSeller(profile: SellerStoreProfile, listing: SellerListing): Seller {
  const location = getLocationForListing(profile, listing)

  return {
    id: listing.id,
    name: profile.storeName,
    location: location?.city ?? "Bekasi",
    warehouse: location ? `${location.label}, ${location.area}` : "Seller warehouse",
    delivery: formatDeliveryLabel(profile, listing),
    rating: listing.rating,
    price: listing.price,
    stockLabel: formatStockLabel(listing),
    busyLevel: getBusyLevel(listing.activeOrders),
    activeOrders: listing.activeOrders,
    handlingTime: listing.handlingTime,
  }
}

function mergeMarketplaceProducts(
  products: Product[],
  profiles: SellerStoreProfile[],
  listings: SellerListing[]
) {
  return products.map((product) => {
    const managedSellerEntries = listings
      .filter((listing) => listing.isActive && listing.productSlug === product.slug)
      .map((listing) => {
        const profile = profiles.find((entry) => entry.sellerAccountId === listing.sellerAccountId)

        return profile ? mapListingToSeller(profile, listing) : null
      })
      .filter(Boolean) as Seller[]

    return {
      ...product,
      sellers: [...product.sellers, ...managedSellerEntries],
    }
  })
}

function createLocationId() {
  return `location-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

function createDeliveryOptionId() {
  return `delivery-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

function createListingId(listings: SellerListing[]) {
  return Math.max(9100, ...listings.map((listing) => listing.id)) + 1
}

interface SellerProviderProps {
  children: ReactNode
}

function SellerProvider({ children }: SellerProviderProps) {
  const { user } = useAuth()
  const [storeProfiles, setStoreProfiles] = useState<SellerStoreProfile[]>(() => readInitialSellerState().profiles)
  const [listings, setListings] = useState<SellerListing[]>(() => readInitialSellerState().listings)

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        listings,
        profiles: storeProfiles,
      })
    )
  }, [listings, storeProfiles])

  const currentSellerId = user?.role === "seller" ? user.id : null
  const currentStoreProfile = useMemo(
    () => (currentSellerId ? storeProfiles.find((profile) => profile.sellerAccountId === currentSellerId) ?? null : null),
    [currentSellerId, storeProfiles]
  )
  const currentSellerListings = useMemo(
    () => (currentSellerId ? listings.filter((listing) => listing.sellerAccountId === currentSellerId) : []),
    [currentSellerId, listings]
  )
  const marketplaceProducts = useMemo(
    () => mergeMarketplaceProducts(baseProducts, storeProfiles, listings),
    [listings, storeProfiles]
  )
  const getProductBySlug = useCallback(
    (slug: Product["slug"]) => marketplaceProducts.find((product) => product.slug === slug),
    [marketplaceProducts]
  )

  const sellerSummary = useMemo<SellerHubSummary | null>(() => {
    if (!currentSellerId) {
      return null
    }

    const sellerListings = listings.filter((listing) => listing.sellerAccountId === currentSellerId)
    const grossRevenue = sellerListings.reduce((sum, listing) => sum + listing.monthlyRevenue, 0)
    const ordersThisMonth = sellerListings.reduce((sum, listing) => sum + listing.monthlyOrders, 0)
    const pendingPayout = sellerListings.reduce((sum, listing) => sum + listing.pendingPayout, 0)
    const activeListings = sellerListings.filter((listing) => listing.isActive).length
    const lowStockCount = sellerListings.filter((listing) => listing.isActive && listing.stockQuantity <= 20).length

    return {
      activeListings,
      averageOrderValue: ordersThisMonth ? Math.round(grossRevenue / ordersThisMonth) : 0,
      grossRevenue,
      lowStockCount,
      ordersThisMonth,
      pendingPayout,
    }
  }, [currentSellerId, listings])

  const updateStoreProfile = useCallback(
    (
      patch: Partial<Pick<SellerStoreProfile, "contactPhone" | "description" | "ownerName" | "storeName">>
    ) => {
      if (!currentSellerId) {
        return
      }

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId ? { ...profile, ...patch } : profile
        )
      )
    },
    [currentSellerId]
  )

  const addLocation = useCallback(
    (input: Omit<SellerStoreLocation, "id">) => {
      if (!currentSellerId) {
        return
      }

      const nextLocation: SellerStoreLocation = {
        ...input,
        id: createLocationId(),
      }

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? { ...profile, locations: [...profile.locations, nextLocation] }
            : profile
        )
      )
    },
    [currentSellerId]
  )

  const updateLocation = useCallback(
    (locationId: string, patch: Partial<Omit<SellerStoreLocation, "id">>) => {
      if (!currentSellerId) {
        return
      }

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? {
                ...profile,
                locations: profile.locations.map((location) =>
                  location.id === locationId ? { ...location, ...patch } : location
                ),
              }
            : profile
        )
      )
    },
    [currentSellerId]
  )

  const removeLocation = useCallback(
    (locationId: string) => {
      if (!currentSellerId || !currentStoreProfile || currentStoreProfile.locations.length <= 1) {
        return
      }

      const fallbackLocation = currentStoreProfile.locations.find((location) => location.id !== locationId)

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? {
                ...profile,
                locations: profile.locations.filter((location) => location.id !== locationId),
              }
            : profile
        )
      )

      if (fallbackLocation) {
        setListings((currentListings) =>
          currentListings.map((listing) =>
            listing.sellerAccountId === currentSellerId && listing.warehouseLocationId === locationId
              ? { ...listing, warehouseLocationId: fallbackLocation.id }
              : listing
          )
        )
      }
    },
    [currentSellerId, currentStoreProfile]
  )

  const addDeliveryOption = useCallback(
    (input: Omit<SellerDeliveryOption, "id">) => {
      if (!currentSellerId) {
        return
      }

      const nextOption: SellerDeliveryOption = {
        ...input,
        id: createDeliveryOptionId(),
      }

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? { ...profile, deliveryOptions: [...profile.deliveryOptions, nextOption] }
            : profile
        )
      )
    },
    [currentSellerId]
  )

  const updateDeliveryOption = useCallback(
    (deliveryOptionId: string, patch: Partial<Omit<SellerDeliveryOption, "id">>) => {
      if (!currentSellerId) {
        return
      }

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? {
                ...profile,
                deliveryOptions: profile.deliveryOptions.map((option) =>
                  option.id === deliveryOptionId ? { ...option, ...patch } : option
                ),
              }
            : profile
        )
      )
    },
    [currentSellerId]
  )

  const removeDeliveryOption = useCallback(
    (deliveryOptionId: string) => {
      if (!currentSellerId || !currentStoreProfile || currentStoreProfile.deliveryOptions.length <= 1) {
        return
      }

      const fallbackOption = currentStoreProfile.deliveryOptions.find((option) => option.id !== deliveryOptionId)

      setStoreProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.sellerAccountId === currentSellerId
            ? {
                ...profile,
                deliveryOptions: profile.deliveryOptions.filter((option) => option.id !== deliveryOptionId),
              }
            : profile
        )
      )

      setListings((currentListings) =>
        currentListings.map((listing) => {
          if (listing.sellerAccountId !== currentSellerId) {
            return listing
          }

          const filteredOptionIds = listing.deliveryOptionIds.filter((optionId) => optionId !== deliveryOptionId)

          return {
            ...listing,
            deliveryOptionIds:
              filteredOptionIds.length || !fallbackOption ? filteredOptionIds : [fallbackOption.id],
          }
        })
      )
    },
    [currentSellerId, currentStoreProfile]
  )

  const createListing = useCallback(
    (input: CreateSellerListingInput): CreateListingResult | null => {
      if (!currentSellerId) {
        return null
      }

      let result: CreateListingResult | null = null

      setListings((currentListings) => {
        const existingListing = currentListings.find(
          (listing) =>
            listing.sellerAccountId === currentSellerId && listing.productSlug === input.productSlug
        )

        if (existingListing) {
          result = {
            listingId: existingListing.id,
            status: "updated",
          }

          return currentListings.map((listing) =>
            listing.id === existingListing.id
              ? {
                  ...listing,
                  ...input,
                  isActive: input.isActive ?? listing.isActive,
                  price: clampMoney(input.price),
                  stockQuantity: clampStockQuantity(input.stockQuantity),
                  stockLabel: input.stockLabel.trim(),
                }
              : listing
          )
        }

        const nextListingId = createListingId(currentListings)
        const metrics = deriveListingMetrics(input.price, input.stockQuantity)

        result = {
          listingId: nextListingId,
          status: "created",
        }

        return [
          ...currentListings,
          {
            id: nextListingId,
            sellerAccountId: currentSellerId,
            productSlug: input.productSlug,
            price: clampMoney(input.price),
            stockQuantity: clampStockQuantity(input.stockQuantity),
            stockLabel: input.stockLabel.trim(),
            warehouseLocationId: input.warehouseLocationId,
            deliveryOptionIds: input.deliveryOptionIds,
            handlingTime: input.handlingTime.trim(),
            isActive: input.isActive ?? true,
            ...metrics,
          },
        ]
      })

      return result
    },
    [currentSellerId]
  )

  const updateListing = useCallback(
    (
      listingId: number,
      patch: Partial<Omit<SellerListing, "id" | "productSlug" | "sellerAccountId">>
    ) => {
      if (!currentSellerId) {
        return
      }

      setListings((currentListings) =>
        currentListings.map((listing) => {
          if (listing.id !== listingId || listing.sellerAccountId !== currentSellerId) {
            return listing
          }

          return {
            ...listing,
            ...patch,
            price: patch.price === undefined ? listing.price : clampMoney(patch.price),
            stockQuantity:
              patch.stockQuantity === undefined ? listing.stockQuantity : clampStockQuantity(patch.stockQuantity),
            stockLabel: patch.stockLabel === undefined ? listing.stockLabel : patch.stockLabel.trim(),
            handlingTime:
              patch.handlingTime === undefined ? listing.handlingTime : patch.handlingTime.trim(),
          }
        })
      )
    },
    [currentSellerId]
  )

  const toggleListing = useCallback(
    (listingId: number) => {
      if (!currentSellerId) {
        return
      }

      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing.id === listingId && listing.sellerAccountId === currentSellerId
            ? { ...listing, isActive: !listing.isActive }
            : listing
        )
      )
    },
    [currentSellerId]
  )

  const removeListing = useCallback(
    (listingId: number) => {
      if (!currentSellerId) {
        return
      }

      setListings((currentListings) =>
        currentListings.filter(
          (listing) => !(listing.id === listingId && listing.sellerAccountId === currentSellerId)
        )
      )
    },
    [currentSellerId]
  )

  const value = useMemo(
    () => ({
      addDeliveryOption,
      addLocation,
      createListing,
      currentSellerListings,
      currentStoreProfile,
      getProductBySlug,
      marketplaceProducts,
      removeDeliveryOption,
      removeListing,
      removeLocation,
      sellerSummary,
      toggleListing,
      updateDeliveryOption,
      updateListing,
      updateLocation,
      updateStoreProfile,
    }),
    [
      addDeliveryOption,
      addLocation,
      createListing,
      currentSellerListings,
      currentStoreProfile,
      getProductBySlug,
      marketplaceProducts,
      removeDeliveryOption,
      removeListing,
      removeLocation,
      sellerSummary,
      toggleListing,
      updateDeliveryOption,
      updateListing,
      updateLocation,
      updateStoreProfile,
    ]
  )

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
}

export { SellerProvider }
