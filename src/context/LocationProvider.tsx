import { useEffect, useMemo, useState, type ReactNode } from "react"

import { LocationContext } from "@/context/location"
import { useMockData } from "@/context/mock-data"
import { type UserLocationId, type UserLocationOption } from "@/lib/data"

const STORAGE_KEY = "tanilink:user-location"

function readInitialLocationId(
  defaultUserLocationId: UserLocationId,
  userLocationOptions: UserLocationOption[]
) {
  if (typeof window === "undefined") {
    return defaultUserLocationId
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    return storedValue && userLocationOptions.some((location) => location.id === storedValue)
      ? (storedValue as UserLocationId)
      : defaultUserLocationId
  } catch {
    return defaultUserLocationId
  }
}

interface LocationProviderProps {
  children: ReactNode
}

function LocationProvider({ children }: LocationProviderProps) {
  const { defaultUserLocationId, userLocationOptions } = useMockData()
  const [selectedLocationId, setSelectedLocationId] = useState<UserLocationId>(() =>
    readInitialLocationId(defaultUserLocationId, userLocationOptions)
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selectedLocationId)
  }, [selectedLocationId])

  const currentLocation = useMemo<UserLocationOption>(
    () => userLocationOptions.find((location) => location.id === selectedLocationId) ?? userLocationOptions[0],
    [selectedLocationId, userLocationOptions]
  )

  const value = useMemo(
    () => ({
      currentLocation,
      locationOptions: userLocationOptions,
      selectedLocationId,
      setSelectedLocationId,
    }),
    [currentLocation, selectedLocationId, userLocationOptions]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export { LocationProvider }
