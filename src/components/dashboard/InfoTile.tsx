import { type LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import styles from "@/components/dashboard/dashboard.module.css"

interface InfoTileProps {
  label: string
  value: string
  icon?: LucideIcon
  className?: string
  labelClassName?: string
  valueClassName?: string
}

function InfoTile({
  label,
  value,
  icon: Icon,
  className,
  labelClassName,
  valueClassName,
}: InfoTileProps) {
  return (
    <Card className={cn(styles.infoTile, className)} size="sm">
      <CardContent className={styles.infoTileBody}>
        {Icon ? (
          <div className={cn(styles.infoTileLabelRow, styles.infoTileLabel, labelClassName)}>
            <Icon className={styles.smallIcon} />
            {label}
          </div>
        ) : (
          <p className={cn(styles.infoTileLabel, labelClassName)}>{label}</p>
        )}
        <p className={cn(styles.infoTileValue, valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  )
}

export default InfoTile
