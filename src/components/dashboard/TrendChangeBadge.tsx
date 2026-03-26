import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import styles from "@/components/dashboard/dashboard.module.css"

interface TrendChangeBadgeProps {
  priceChange: number
  active?: boolean
  showSuffix?: boolean
}

function TrendChangeBadge({
  priceChange,
  active = false,
  showSuffix = false,
}: TrendChangeBadgeProps) {
  const rising = priceChange >= 0

  return (
    <Badge
      className={cn(
        styles.trendBadge,
        rising
          ? active
            ? styles.trendPositiveActive
            : styles.trendPositive
          : active
            ? styles.trendNegativeActive
            : styles.trendNegative
      )}
      variant="muted"
    >
      {rising ? <TrendingUp className={styles.smallIcon} /> : <TrendingDown className={styles.smallIcon} />}
      {Math.abs(priceChange)}%
      {showSuffix ? " vs last month" : null}
    </Badge>
  )
}

export default TrendChangeBadge
