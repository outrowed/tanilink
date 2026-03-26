import { MapPin, ShoppingBasket, UserRound } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import SearchBox from "@/components/shared/SearchBox"
import { useAuth } from "@/context/auth"
import { useBasket } from "@/context/basket"
import { describeUserLocation } from "@/lib/planner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import styles from "@/components/layout/AppNavbar.module.css"

function AppNavbar() {
  const { itemCount } = useBasket()
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const isCatalogPage = location.pathname === "/catalog"
  const profileDestination = isAuthenticated ? "/account" : "/auth"
  const profileTitle = isAuthenticated ? user?.name ?? "Account" : "Sign in"
  const profileMeta = isAuthenticated ? "Account management" : "Access your account"
  const avatarContent = isAuthenticated && user ? user.avatarInitials : <UserRound className={styles.smallIcon} />

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link className={styles.brandLink} to="/">
            TaniLink
          </Link>
          <div className={styles.locationPill}>
            <MapPin className={styles.smallIcon} />
            <span>{describeUserLocation()}</span>
          </div>
        </div>

        <div className={styles.searchStack}>
          <Link className={cn(styles.catalogButton, isCatalogPage && styles.catalogButtonActive)} to="/catalog">
            Catalog
          </Link>
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
