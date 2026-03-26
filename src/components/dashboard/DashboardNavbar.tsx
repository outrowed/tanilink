import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLocationPreference } from "@/context/location"
import { describeUserLocation } from "@/lib/planner"
import styles from "@/components/dashboard/dashboard.module.css"

interface DashboardNavbarProps {
  backLabel?: string
  note?: string
  onBack?: () => void
  pageBadge?: string
}

function DashboardNavbar({
  backLabel,
  note = "Food sourcing for Indonesian consumers",
  onBack,
  pageBadge = "Consumer marketplace",
}: DashboardNavbarProps) {
  const { currentLocation } = useLocationPreference()

  return (
    <Card className={styles.navbar}>
      <CardContent className={styles.navbarBody}>
        <div className={styles.navbarPrimary}>
          {onBack ? (
            <Button onClick={onBack} type="button" variant="ghost">
              {backLabel}
            </Button>
          ) : null}
          <div className={styles.navbarCopy}>
            <p className={styles.wordmark}>
              TaniLink
            </p>
            <p className={styles.navbarNote}>{note}</p>
          </div>
        </div>

        <div className={styles.navbarMeta}>
          <Badge variant="secondary">{pageBadge}</Badge>
          <div className={styles.navbarLocation}>
            <div className={styles.navbarLocationLabel}>
              <MapPin className={styles.smallIcon} />
              You are in
            </div>
            <p className={styles.navbarLocationValue}>{describeUserLocation(currentLocation)}</p>
            <p className={styles.navbarLocationSubtle}>{currentLocation.zone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardNavbar
