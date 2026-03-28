import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShoppingBasket,
  Store,
  UserRound,
  WalletCards,
  X,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import FloatingLocationSwitcher from "@/components/layout/FloatingLocationSwitcher"
import SearchBox from "@/components/shared/SearchBox"
import { useAuth } from "@/context/auth"
import { useBasket } from "@/context/basket"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import styles from "@/components/layout/AppNavbar.module.css"

function AppNavbar() {
  const { itemCount } = useBasket()
  const navigate = useNavigate()
  const { isAuthenticated, isSeller, logout, user } = useAuth()
  const location = useLocation()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const hasMountedRef = useRef(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const isMarketplacePage = location.pathname === "/marketplace" || location.pathname === "/catalog"
  const isSellerPage = location.pathname.startsWith("/seller")
  const profileTitle = isAuthenticated ? user?.name ?? "Account" : "Sign in"
  const profileMeta = isAuthenticated ? (isSeller ? "Seller account" : "Buyer account") : "Access your account"
  const avatarContent = isAuthenticated && user ? user.avatarInitials : <UserRound className={styles.smallIcon} />
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
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    const resetMenus = window.setTimeout(() => {
      setIsProfileMenuOpen(false)
      setIsMobileDrawerOpen(false)
    }, 0)

    return () => window.clearTimeout(resetMenus)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isMobileDrawerOpen) {
      document.body.style.removeProperty("overflow")
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileDrawerOpen])

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    setIsMobileDrawerOpen(false)
    logout()
    navigate("/auth", { replace: true })
  }

  return (
    <div className={styles.stickyShell}>
      <header className={styles.bar}>
        <div className={styles.inner}>
          <div className={styles.desktopBar}>
            <div className={styles.brandBlock}>
              <Link className={styles.brandLink} to="/">
                TaniLink
              </Link>
            </div>

            <div className={styles.searchStack}>
              <div className={styles.navLinks}>
                <Link
                  className={cn(styles.catalogButton, isMarketplacePage && styles.catalogButtonActive)}
                  to="/marketplace"
                >
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

          <div className={styles.mobileBar}>
            <div className={styles.mobileTopRow}>
              <div className={styles.brandBlock}>
                <Link className={styles.brandLink} to="/">
                  TaniLink
                </Link>
              </div>

              <div className={styles.mobileTopActions}>
                <Link aria-label="Basket" className={styles.mobileBasketButton} to="/basket">
                  <ShoppingBasket className={styles.smallIcon} />
                  <Badge className={styles.mobileBasketCount} variant="outline">
                    {itemCount}
                  </Badge>
                </Link>

                <div className={styles.mobileDrawerWrap}>
                  {isMobileDrawerOpen ? (
                    <button
                      aria-label="Close navigation menu"
                      className={styles.mobileDrawerBackdrop}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      type="button"
                    />
                  ) : null}

                  <button
                    aria-expanded={isMobileDrawerOpen}
                    aria-haspopup="menu"
                    aria-label={isMobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
                    className={styles.mobileMenuButton}
                    onClick={() => setIsMobileDrawerOpen((current) => !current)}
                    type="button"
                  >
                    {isMobileDrawerOpen ? <X className={styles.smallIcon} /> : <Menu className={styles.smallIcon} />}
                  </button>

                  {isMobileDrawerOpen ? (
                    <div className={styles.mobileDrawerPanel}>
                      <div className={styles.mobileDrawerHeader}>
                        <div className={styles.mobileDrawerIdentity}>
                          <span className={styles.profileAvatar}>{avatarContent}</span>
                          <div>
                            <p className={styles.mobileDrawerTitle}>{profileTitle}</p>
                            <p className={styles.mobileDrawerMeta}>{profileMeta}</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.mobileDrawerSection}>
                        <p className={styles.mobileDrawerLabel}>Navigate</p>
                        <Link
                          className={styles.mobileDrawerItem}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          to="/marketplace"
                        >
                          <Store className={styles.smallIcon} />
                          <span>Marketplace</span>
                        </Link>
                        {isSeller ? (
                          <Link
                            className={styles.mobileDrawerItem}
                            onClick={() => setIsMobileDrawerOpen(false)}
                            to="/seller"
                          >
                            <LayoutDashboard className={styles.smallIcon} />
                            <span>Seller Hub</span>
                          </Link>
                        ) : null}
                        <Link
                          className={styles.mobileDrawerItem}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          to="/basket"
                        >
                          <ShoppingBasket className={styles.smallIcon} />
                          <span>Basket</span>
                        </Link>
                      </div>

                      <div className={styles.mobileDrawerSection}>
                        <p className={styles.mobileDrawerLabel}>Account</p>
                        {profileLinks.map((item) => {
                          const Icon = item.icon

                          return (
                            <Link
                              className={styles.mobileDrawerItem}
                              key={item.to}
                              onClick={() => setIsMobileDrawerOpen(false)}
                              to={item.to}
                            >
                              <Icon className={styles.smallIcon} />
                              <span>{item.label}</span>
                            </Link>
                          )
                        })}

                        {isAuthenticated ? (
                          <button className={styles.mobileDrawerLogout} onClick={handleLogout} type="button">
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

            <SearchBox className={styles.mobileSearchRegion} />
          </div>
        </div>
      </header>

      <div className={styles.locationShelf}>
        <FloatingLocationSwitcher />
      </div>
    </div>
  )
}

export default AppNavbar
