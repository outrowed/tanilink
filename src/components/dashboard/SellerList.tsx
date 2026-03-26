import { Clock3, MapPin, Star, Warehouse } from "lucide-react"

import { formatRupiah, type Product } from "@/lib/data"

import InfoTile from "@/components/dashboard/InfoTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import styles from "@/components/dashboard/dashboard.module.css"

interface SellerListProps {
  product: Product
}

function SellerList({ product }: SellerListProps) {
  return (
    <div className={styles.sellerList}>
      {product.sellers.map((seller) => (
        <Card
          key={seller.id}
          className={styles.sellerCard}
        >
          <CardHeader className={styles.sellerHeader}>
            <div className={styles.sellerHeaderRow}>
              <div>
                <CardTitle className={styles.sellerTitle}>{seller.name}</CardTitle>
                <p className={styles.sellerStock}>{seller.stockLabel}</p>
              </div>
              <Card className={styles.sellerPriceCard}>
                <CardContent className={styles.sellerPriceBody}>
                  <p className={styles.sellerPriceLabel}>Seller price</p>
                  <p className={styles.sellerPriceValue}>{formatRupiah(seller.price)}</p>
                </CardContent>
              </Card>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className={styles.sellerBody}>
            <div className={styles.sellerMetaGrid}>
              <InfoTile
                className={styles.infoTileCompact}
                icon={MapPin}
                label="Location"
                value={seller.location}
                valueClassName={styles.infoTileCompactValue}
              />
              <InfoTile
                className={styles.infoTileCompact}
                icon={Warehouse}
                label="Warehouse"
                value={seller.warehouse}
                valueClassName={styles.infoTileCompactValue}
              />
              <InfoTile
                className={styles.infoTileCompact}
                icon={Clock3}
                label="Delivery"
                value={seller.delivery}
                valueClassName={styles.infoTileCompactValue}
              />
            </div>

            <Badge className={styles.sellerRating} variant="warning">
              <Star className={`${styles.ratingIcon} ${styles.ratingIconFilled}`} />
              {seller.rating.toFixed(1)} seller rating
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SellerList
