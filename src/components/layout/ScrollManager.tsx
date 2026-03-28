import { useEffect, useLayoutEffect, useRef } from "react"
import { type Location, useLocation, useNavigationType } from "react-router-dom"

const SCROLL_STORAGE_PREFIX = "tanilink:scroll:"
const SEARCH_PATHNAME = "/search"

function getStorageKey(locationKey: string) {
  return `${SCROLL_STORAGE_PREFIX}${locationKey}`
}

function getSearchQuery(location: Location | null) {
  if (!location || location.pathname !== SEARCH_PATHNAME) {
    return null
  }

  return new URLSearchParams(location.search).get("q") ?? ""
}

function shouldPreserveScroll(previousLocation: Location | null, nextLocation: Location) {
  return (
    previousLocation?.pathname === SEARCH_PATHNAME &&
    nextLocation.pathname === SEARCH_PATHNAME &&
    getSearchQuery(previousLocation) === getSearchQuery(nextLocation)
  )
}

function readStoredScrollPosition(locationKey: string) {
  try {
    const storedValue = window.sessionStorage.getItem(getStorageKey(locationKey))

    if (!storedValue) {
      return null
    }

    const parsedValue = JSON.parse(storedValue) as { x?: number; y?: number }

    return {
      x: Number.isFinite(parsedValue.x) ? parsedValue.x : 0,
      y: Number.isFinite(parsedValue.y) ? parsedValue.y : 0,
    }
  } catch {
    return null
  }
}

function saveScrollPosition(locationKey: string) {
  try {
    window.sessionStorage.setItem(
      getStorageKey(locationKey),
      JSON.stringify({
        x: window.scrollX ?? window.pageXOffset ?? 0,
        y: window.scrollY ?? window.pageYOffset ?? 0,
      })
    )
  } catch {
    // Ignore session storage write failures and keep the app navigable.
  }
}

function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousLocationRef = useRef<Location | null>(null)

  useEffect(() => {
    const historyState = window.history

    if (!("scrollRestoration" in historyState)) {
      return
    }

    const previousScrollRestoration = historyState.scrollRestoration
    historyState.scrollRestoration = "manual"

    return () => {
      historyState.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useEffect(() => {
    const persistCurrentScroll = () => {
      saveScrollPosition(location.key)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistCurrentScroll()
      }
    }

    window.addEventListener("pagehide", persistCurrentScroll)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", persistCurrentScroll)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [location.key])

  useLayoutEffect(() => {
    const previousLocation = previousLocationRef.current

    if (previousLocation && previousLocation.key !== location.key) {
      saveScrollPosition(previousLocation.key)
    }

    if (shouldPreserveScroll(previousLocation, location)) {
      previousLocationRef.current = location
      return
    }

    if (navigationType === "POP") {
      const storedPosition = readStoredScrollPosition(location.key)

      window.scrollTo({
        left: storedPosition?.x ?? 0,
        top: storedPosition?.y ?? 0,
      })
    } else {
      window.scrollTo({ left: 0, top: 0 })
    }

    previousLocationRef.current = location
  }, [location, navigationType])

  return null
}

export default ScrollManager
