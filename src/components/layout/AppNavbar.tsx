import { useEffect, useRef, useState } from "react"
import { ChevronDown, LayoutDashboard, MapPin, ShoppingBasket, Store, UserRound } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import SearchBox from "@/components/shared/SearchBox"
import { useAuth } from "@/context/auth"
import { useBasket } from "@/context/basket"
import { useLocationPreference } from "@/context/location"
import { describeUserLocation } from "@/lib/planner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import styles from "@/components/layout/AppNavbar.module.css"

function AppNavbar() {
  const { itemCount } = useBasket()
  const { isAuthenticated, isSeller, user } = useAuth()
  const { locationOptions, selectedLocationId, setSelectedLocationId } = useLocationPreference()
  const location = useLocation()
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const locationMenuRef = useRef<HTMLDivElement | null>(null)
  const isMarketplacePage = location.pathname === "/marketplace" || location.pathname === "/catalog"
  const isSellerPage = location.pathname.startsWith("/seller")
  const profileDestination = isAuthenticated ? "/account" : "/auth"
  const profileTitle = isAuthenticated ? user?.name ?? "Account" : "Sign in"
  const profileMeta = isAuthenticated ? (isSeller ? "Seller account" : "Buyer account") : "Access your account"
  const avatarContent = isAuthenticated && user ? user.avatarInitials : <UserRound className={styles.smallIcon} />
  const activeLocation = locationOptions.find((locationOption) => locationOption.id === selectedLocationId)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!locationMenuRef.current?.contains(event.target as Node)) {
        setIsLocationMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLocationMenuOpen(false)
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
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link className={styles.brandLink} to="/">
            TaniLink
          </Link>

          <div className={styles.locationMenuWrap} ref={locationMenuRef}>
            <button
              aria-expanded={isLocationMenuOpen}
              aria-haspopup="menu"
              className={styles.locationTag}
              onClick={() => setIsLocationMenuOpen((current) => !current)}
              type="button"
            >
              <MapPin className={styles.smallIcon} />
              <span className={styles.locationTagText}>
                {activeLocation ? describeUserLocation(activeLocation, "short") : "Choose area"}
              </span>
              <ChevronDown className={styles.locationChevron} />
            </button>

            {isLocationMenuOpen ? (
              <div className={styles.locationMenu}>
                <div className={styles.locationMenuHeader}>
                  <p className={styles.locationMenuTitle}>Choose your area</p>
                  <p className={styles.locationMenuNote}>Recommendations will re-rank instantly.</p>
                </div>
                <div className={styles.locationMenuList}>
                  {locationOptions.map((locationOption) => (
                    <button
                      key={locationOption.id}
                      className={cn(
                        styles.locationMenuItem,
                        locationOption.id === selectedLocationId && styles.locationMenuItemActive
                      )}
                      onClick={() => {
                        setSelectedLocationId(locationOption.id)
                        setIsLocationMenuOpen(false)
                      }}
                      type="button"
                    >
                      <span className={styles.locationMenuItemTitle}>
                        {describeUserLocation(locationOption, "short")}
                      </span>
                      <span className={styles.locationMenuItemMeta}>{locationOption.zone}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.searchStack}>
          <div className={styles.navLinks}>
            <Link className={cn(styles.catalogButton, isMarketplacePage && styles.catalogButtonActive)} to="/marketplace">
              <Store className={styles.smallIcon} />
              Marketplace
            </Link>
            {isSeller ? (
              <Link className={cn(styles.catalogButton, isSellerPage && styles.catalogButtonActive)} to="/seller">
                <LayoutDashboard className={styles.smallIcon} />
                Seller Hub
              </Link>
            ) : null}
          </div>
          <SearchBox className={styles.searchRegion} />
        </div>

        <div className={styles.actions}>
          <Link className={styles.basketButton} to="/basket">
            <span className={styles.basketIconWrap}>
              <ShoppingBasket className={styles.smallIcon} />
            </span>
            <span className={styles.basketCopy}>
              <span className={styles.profileName}>Basket</span>
              <span className={styles.profileMeta}>Review selected items</span>
            </span>
            <Badge className={styles.basketCount} variant="outline">
              {itemCount}
            </Badge>
          </Link>

          <Link className={styles.profileButton} to={profileDestination}>
            <span className={styles.profileAvatar}>
              {avatarContent}
            </span>
            <span className={styles.profileCopy}>
              <span className={styles.profileName}>{profileTitle}</span>
              <span className={styles.profileMeta}>{profileMeta}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default AppNavbar
