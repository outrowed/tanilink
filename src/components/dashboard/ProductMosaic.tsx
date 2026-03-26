import { ArrowUpRight } from "lucide-react"

import { formatRupiah, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

import { categoryBadgeClass } from "@/components/dashboard/lib"
import ProductPriceChart from "@/components/dashboard/ProductPriceChart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductMosaicProps {
  onSelect: (id: number) => void
  products: Product[]
}

function ProductMosaic({ onSelect, products }: ProductMosaicProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionLabel}>Market snapshot</p>
          <h2 className={styles.sectionTitle}>
            Ingredient price previews across the marketplace
          </h2>
        </div>
        <p className={styles.sectionNote}>
          Select any ingredient from the right panel to zoom into its price history and supplier stack.
        </p>
      </div>

      <div className={styles.mosaicGrid}>
        {products.map((product) => (
          <button
            key={product.id}
            className={styles.unstyledButton}
            onClick={() => onSelect(product.id)}
            type="button"
          >
            <Card className={styles.mosaicCard}>
              <CardHeader className={styles.mosaicHeader}>
                <div className={styles.mosaicHeaderRow}>
                  <div className={styles.mosaicMeta}>
                    <Card className={styles.iconCardSmall}>
                      <CardContent className={cn(styles.iconCardBody, styles.iconSmallText)}>
                        {product.icon}
                      </CardContent>
                    </Card>
                    <div>
                      <CardTitle className={styles.itemTitleSmall}>{product.name}</CardTitle>
                      <CardDescription className={styles.itemSubtitle}>{product.unit}</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className={styles.mosaicArrow} />
                </div>
              </CardHeader>

              <CardContent className={styles.mosaicBody}>
                <Card className={styles.mosaicChartCard}>
                  <CardContent className={styles.mosaicChartBody}>
                    <ProductPriceChart
                      compact
                      history={product.priceHistory}
                      label={product.name}
                      priceChange={product.priceChange}
                      tone={product.chartColor}
                    />
                  </CardContent>
                </Card>

                <div className={styles.mosaicFooter}>
                  <div>
                    <p className={styles.metricLabel}>Average price</p>
                    <p className={styles.metricValue}>{formatRupiah(product.averagePrice)}</p>
                  </div>
                  <Badge className={cn(styles.categoryBadge, categoryBadgeClass(product.category))} variant="outline">
                    {product.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </section>
  )
}

export default ProductMosaic
