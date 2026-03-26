import { createContext, useContext } from "react"

import { type UserLocationId, type UserLocationOption } from "@/lib/data"

export interface LocationContextValue {
  currentLocation: UserLocationOption
  locationOptions: UserLocationOption[]
  selectedLocationId: UserLocationId
  setSelectedLocationId: (locationId: UserLocationId) => void
}

export const LocationContext = createContext<LocationContextValue | null>(null)

export function useLocationPreference() {
  const context = useContext(LocationContext)

  if (!context) {
    throw new Error("useLocationPreference must be used within LocationProvider")
  }

  return context
}
