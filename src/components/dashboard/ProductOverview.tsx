import { formatRupiah, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

import InfoTile from "@/components/dashboard/InfoTile"
import ProductPriceChart from "@/components/dashboard/ProductPriceChart"
import SellerList from "@/components/dashboard/SellerList"
import TrendChangeBadge from "@/components/dashboard/TrendChangeBadge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductOverviewProps {
  product: Product
}

function ProductOverview({ product }: ProductOverviewProps) {
  return (
    <section className={styles.section}>
      <Card className={styles.overviewCard}>
        <CardHeader className={styles.overviewHeader}>
          <div className={styles.sellerHeaderRow}>
            <div>
              <div className={styles.itemRow}>
                <Card className={styles.iconCardLarge}>
                  <CardContent className={cn(styles.iconCardBody, styles.iconLargeText)}>
                    {product.icon}
                  </CardContent>
                </Card>
                <div>
                  <Badge className={styles.selectedBadge} variant="secondary">
                    Selected ingredient
                  </Badge>
                  <CardTitle className={styles.sectionTitle}>
                    {product.name}
                  </CardTitle>
                </div>
              </div>
              <p className={styles.overviewDescription}>
                {product.description}
              </p>
            </div>

            <TrendChangeBadge priceChange={product.priceChange} showSuffix />
          </div>
        </CardHeader>

        <Separator />

        <CardContent className={styles.overviewContent}>
          <ProductPriceChart
            description="Mock monthly market data for the selected ingredient across the latest trading cycle."
            history={product.priceHistory}
            label={product.name}
            priceChange={product.priceChange}
            subtitle={product.leadTime}
            title="12 month market curve"
            tone={product.chartColor}
          />
        </CardContent>

        <Separator />

        <CardContent className={styles.overviewStats}>
          <InfoTile label="Average price" value={formatRupiah(product.averagePrice)} />
          <InfoTile label="Yearly low" value={formatRupiah(product.yearlyLow)} />
          <InfoTile label="Yearly high" value={formatRupiah(product.yearlyHigh)} />
          <InfoTile label="Market status" value={product.marketStatus} />
        </CardContent>
      </Card>

      <div className={styles.section}>
        <div className={styles.sellerSectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Available sellers</p>
            <h3 className={styles.sectionTitle}>
              Compare warehouse location, price, and rating
            </h3>
          </div>
          <Badge className={styles.sellerCountBadge} variant="success">
            {product.sellers.length} sellers active
          </Badge>
        </div>
        <SellerList product={product} />
      </div>
    </section>
  )
}

export default ProductOverview
