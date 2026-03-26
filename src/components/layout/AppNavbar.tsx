import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
  ShoppingBasket,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()
  const { isAuthenticated, isSeller, logout, user } = useAuth()
  const { locationOptions, selectedLocationId, setSelectedLocationId } = useLocationPreference()
  const location = useLocation()
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const locationMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const isMarketplacePage = location.pathname === "/marketplace" || location.pathname === "/catalog"
  const isSellerPage = location.pathname.startsWith("/seller")
  const profileTitle = isAuthenticated ? user?.name ?? "Account" : "Sign in"
  const profileMeta = isAuthenticated ? (isSeller ? "Seller account" : "Buyer account") : "Access your account"
  const avatarContent = isAuthenticated && user ? user.avatarInitials : <UserRound className={styles.smallIcon} />
  const activeLocation = locationOptions.find((locationOption) => locationOption.id === selectedLocationId)
  const profileLinks = isAuthenticated
    ? [
        { icon: UserRound, label: "Account overview", to: "/account" },
        { icon: WalletCards, label: "Transactions", to: "/account/transactions" },
        { icon: MessageSquareText, label: "Inbox", to: "/account/inbox" },
        { icon: Settings, label: "Settings", to: "/account/settings" },
        ...(isSeller ? [{ icon: LayoutDashboard, label: "Seller Hub", to: "/seller" }] : []),
      ]
    : [
        { icon: UserRound, label: "Sign in", to: "/auth" },
        { icon: WalletCards, label: "Create account", to: "/auth?mode=signup" },
      ]

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!locationMenuRef.current?.contains(event.target as Node)) {
        setIsLocationMenuOpen(false)
      }

      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLocationMenuOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    logout()
    navigate("/auth", { replace: true })
  }

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

          <div
            className={styles.profileMenuWrap}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsProfileMenuOpen(false)
              }
            }}
            ref={profileMenuRef}
          >
            <button
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className={styles.profileButton}
              onClick={() => setIsProfileMenuOpen((current) => !current)}
              type="button"
            >
              <span className={styles.profileAvatar}>{avatarContent}</span>
              <span className={styles.profileCopy}>
                <span className={styles.profileName}>{profileTitle}</span>
                <span className={styles.profileMeta}>{profileMeta}</span>
              </span>
              <ChevronDown className={styles.profileChevron} />
            </button>

            {isProfileMenuOpen ? (
              <div className={styles.profileMenu}>
                <div className={styles.profileMenuHeader}>
                  <p className={styles.profileMenuTitle}>{profileTitle}</p>
                  <p className={styles.profileMenuNote}>{profileMeta}</p>
                </div>

                <div className={styles.profileMenuList}>
                  {profileLinks.map((item) => {
                    const Icon = item.icon

                    return (
                      <Link
                        className={styles.profileMenuItem}
                        key={item.to}
                        onClick={() => setIsProfileMenuOpen(false)}
                        to={item.to}
                      >
                        <Icon className={styles.smallIcon} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}

                  {isAuthenticated ? (
                    <button className={styles.profileMenuLogout} onClick={handleLogout} type="button">
                      <LogOut className={styles.smallIcon} />
                      <span>Logout</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppNavbar
