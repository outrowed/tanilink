import { Sparkles } from "lucide-react"

import { formatRupiah, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

import { categoryBadgeClass } from "@/components/dashboard/lib"
import ProductPriceChart from "@/components/dashboard/ProductPriceChart"
import TrendChangeBadge from "@/components/dashboard/TrendChangeBadge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductCardProps {
  detailMeta?: string
  detailReason?: string
  detailRole?: string
  isActive: boolean
  metricLabel?: string
  metricValue?: string
  onSelect: () => void
  product: Product
  showChart?: boolean
  subtitle?: string
}

function ProductCard({
  detailMeta,
  detailReason,
  detailRole,
  isActive,
  metricLabel = "Average market price",
  metricValue,
  onSelect,
  product,
  showChart = true,
  subtitle,
}: ProductCardProps) {
  return (
    <button
      className={styles.unstyledButton}
      onClick={onSelect}
      type="button"
    >
      <Card
        className={cn(
          styles.itemCard,
          isActive
            ? styles.itemCardActive
            : styles.itemCardMuted
        )}
      >
        <CardContent className={styles.itemCardBody}>
          <div className={styles.itemRow}>
            <Card
              className={cn(
                styles.iconCardMedium,
                isActive && styles.iconCardMediumActive
              )}
            >
              <CardContent className={cn(styles.iconCardBody, styles.iconMediumText)}>
                {product.icon}
              </CardContent>
            </Card>
            <div className={styles.itemMain}>
              <div className={styles.itemTop}>
                <div>
                  <p className={cn(styles.itemTitle, isActive && styles.itemTitleActive)}>{product.name}</p>
                  <p className={cn(styles.itemSubtitle, isActive && styles.itemSubtitleActive)}>
                    {subtitle ?? product.unit}
                  </p>
                </div>
                <Badge
                  className={cn(
                    styles.categoryBadge,
                    isActive ? styles.categoryBadgeActive : categoryBadgeClass(product.category)
                  )}
                  variant={isActive ? "muted" : "outline"}
                >
                  {product.category}
                </Badge>
              </div>

              {detailRole ? (
                <div className={cn(styles.itemDetail, isActive && styles.itemDetailActive)}>
                  {detailRole ? (
                    <p className={styles.itemDetailRole}>
                      <Sparkles className={styles.itemDetailIcon} />
                      {detailRole}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {showChart ? (
                <div className={styles.itemChart}>
                  <ProductPriceChart
                    compact
                    history={product.priceHistory}
                    label={product.name}
                    priceChange={product.priceChange}
                    tone={product.chartColor}
                  />
                </div>
              ) : null}

              <div className={styles.itemFooter}>
                <div>
                  <p className={cn(styles.metricLabel, isActive && styles.metricLabelActive)}>
                    {metricLabel}
                  </p>
                  <p className={cn(styles.metricValue, isActive && styles.metricValueActive)}>
                    {metricValue ?? formatRupiah(product.averagePrice)}
                  </p>
                </div>
                <TrendChangeBadge active={isActive} priceChange={product.priceChange} />
              </div>

              {detailMeta || detailReason ? (
                <div className={cn(styles.itemDetail, isActive && styles.itemDetailActive)}>
                  {detailMeta && <p className={styles.itemDetailMeta}>{detailMeta}</p>}
                  {detailReason ? (
                    <p className={styles.itemDetailReason}>
                      <Sparkles className={styles.itemDetailIcon} />
                      {detailReason}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

export default ProductCard
