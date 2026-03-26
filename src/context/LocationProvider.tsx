import { useEffect, useMemo, useState, type ReactNode } from "react"

import { LocationContext } from "@/context/location"
import {
  defaultUserLocationId,
  userLocationOptions,
  type UserLocationId,
  type UserLocationOption,
} from "@/lib/data"

const STORAGE_KEY = "tanilink:user-location"

function isLocationId(value: string): value is UserLocationId {
  return userLocationOptions.some((location) => location.id === value)
}

function readInitialLocationId() {
  if (typeof window === "undefined") {
    return defaultUserLocationId
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue && isLocationId(storedValue) ? storedValue : defaultUserLocationId
  } catch {
    return defaultUserLocationId
  }
}

interface LocationProviderProps {
  children: ReactNode
}

function LocationProvider({ children }: LocationProviderProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<UserLocationId>(readInitialLocationId)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selectedLocationId)
  }, [selectedLocationId])

  const currentLocation = useMemo<UserLocationOption>(
    () =>
      userLocationOptions.find((location) => location.id === selectedLocationId) ??
      userLocationOptions[0],
    [selectedLocationId]
  )

  const value = useMemo(
    () => ({
      currentLocation,
      locationOptions: userLocationOptions,
      selectedLocationId,
      setSelectedLocationId,
    }),
    [currentLocation, selectedLocationId]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export { LocationProvider }
