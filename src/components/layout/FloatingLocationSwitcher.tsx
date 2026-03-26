import { useEffect, useRef, useState } from "react"
import { ChevronDown, MapPin } from "lucide-react"

import { useLocationPreference } from "@/context/location"
import { describeUserLocation } from "@/lib/planner"
import { cn } from "@/lib/utils"
import styles from "@/components/layout/FloatingLocationSwitcher.module.css"

interface FloatingLocationSwitcherProps {
  className?: string
}

function FloatingLocationSwitcher({ className }: FloatingLocationSwitcherProps) {
  const { currentLocation, locationOptions, selectedLocationId, setSelectedLocationId } = useLocationPreference()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div className={cn(styles.wrap, className)} ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <MapPin className={styles.icon} />
        <span className={styles.value}>{describeUserLocation(currentLocation, "short")}</span>
        <ChevronDown className={styles.chevron} />
      </button>

      {isOpen ? (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <p className={styles.menuTitle}>Choose your area</p>
            <p className={styles.menuNote}>Recommendations and smart scores update immediately.</p>
          </div>

          <div className={styles.menuList}>
            {locationOptions.map((locationOption) => (
              <button
                className={cn(
                  styles.menuItem,
                  locationOption.id === selectedLocationId && styles.menuItemActive
                )}
                key={locationOption.id}
                onClick={() => {
                  setSelectedLocationId(locationOption.id)
                  setIsOpen(false)
                }}
                type="button"
              >
                <span className={styles.menuItemTitle}>
                  {describeUserLocation(locationOption, "short")}
                </span>
                <span className={styles.menuItemMeta}>{locationOption.zone}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FloatingLocationSwitcher
