import { useMemo, useState } from "react"
import { Clock3, MapPin, PackageCheck, Star, Store, Truck } from "lucide-react"
import { Navigate, useParams } from "react-router-dom"

import ProductPriceChart from "@/components/dashboard/ProductPriceChart"
import TrendChangeBadge from "@/components/dashboard/TrendChangeBadge"
import BackButton from "@/components/shared/BackButton"
import { useBasket } from "@/context/basket"
import { useLocationPreference } from "@/context/location"
import { useMarketplace } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { formatRupiah, type Product } from "@/lib/data"
import { categoryBadgeClass } from "@/components/dashboard/lib"
import { describeUserLocation, rankSellers, type SellerSortMode } from "@/lib/planner"
import { cn } from "@/lib/utils"
import styles from "@/pages/ProductPage.module.css"

const sortModes: Array<{ label: string; value: SellerSortMode }> = [
  { label: "Smart match", value: "smart" },
  { label: "Closest", value: "location" },
  { label: "Lowest price", value: "price" },
  { label: "Highest rating", value: "rating" },
]

function ProductPage() {
  const { slug } = useParams<{ slug: Product["slug"] }>()
  const { getProductBySlug } = useMarketplace()
  const { currentLocation } = useLocationPreference()
  const product = slug ? getProductBySlug(slug) : undefined
  const [sortMode, setSortMode] = useState<SellerSortMode>("smart")
  const [sellerQuantities, setSellerQuantities] = useState<Record<number, number>>({})
  const { addItem } = useBasket()

  const sortedSellers = useMemo(
    () => (product ? rankSellers(product, sortMode, currentLocation) : []),
    [currentLocation, product, sortMode]
  )
  const smartBestSeller = useMemo(
    () => (product ? rankSellers(product, "smart", currentLocation)[0] : null),
    [currentLocation, product]
  )

  if (!product || !smartBestSeller) {
    return <Navigate replace to="/" />
  }

  const getSellerQuantity = (sellerId: number) => sellerQuantities[sellerId] ?? 1
  const remainingSellers = sortedSellers.filter((seller) => seller.id !== smartBestSeller.id)

  const renderSellerCard = (
    seller: (typeof sortedSellers)[number],
    options?: { spotlight?: boolean }
  ) => {
    const isSavingsOffer = seller.marketDeltaLabel.toLowerCase().includes("below market")

    return (
    <Card
      key={`${options?.spotlight ? "spotlight" : "seller"}-${seller.id}`}
      className={cn(
        styles.sellerCard,
        options?.spotlight && styles.sellerCardSpotlight,
        options?.spotlight && isSavingsOffer && styles.sellerCardSpotlightSaving
      )}
    >
      <CardHeader className={styles.sellerHeader}>
        {options?.spotlight ? (
          <div className={styles.spotlightIntro}>
            <p className={styles.sectionLabel}>Best match for {currentLocation.area}</p>
            <div className={styles.spotlightBadgeRow}>
              <Badge variant="success">{seller.smartScore} smart score</Badge>
              <Badge
                className={isSavingsOffer ? styles.savingsBadge : undefined}
                variant={isSavingsOffer ? "success" : "outline"}
              >
                {seller.marketDeltaLabel}
              </Badge>
            </div>
          </div>
        ) : null}

        <div className={styles.sellerHeaderTop}>
          <div>
            <div className={styles.sellerTitleRow}>
              <CardTitle className={styles.sellerTitle}>{seller.name}</CardTitle>
              {seller.id === smartBestSeller.id ? <Badge variant="success">Recommended</Badge> : null}
            </div>
            <CardDescription>{seller.stockLabel}</CardDescription>
          </div>
          <div className={styles.priceBlock}>
            <p className={styles.metricLabel}>Seller price</p>
            <p className={styles.priceValue}>{formatRupiah(seller.price)}</p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className={styles.sellerBody}>
        <div className={styles.infoGrid}>
          <div className={styles.infoPill}>
            <MapPin className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Location</p>
              <p className={styles.infoValue}>
                {seller.location} · {seller.distanceKm} km
              </p>
            </div>
          </div>
          <div className={styles.infoPill}>
            <Store className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Warehouse</p>
              <p className={styles.infoValue}>{seller.warehouse}</p>
            </div>
          </div>
          <div className={styles.infoPill}>
            <Truck className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Delivery</p>
              <p className={styles.infoValue}>{seller.delivery}</p>
            </div>
          </div>
          <div className={styles.infoPill}>
            <Star className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Rating</p>
              <p className={styles.infoValue}>{seller.rating.toFixed(1)} / 5</p>
            </div>
          </div>
        </div>

        <div className={styles.badgeList}>
          {!options?.spotlight ? <Badge variant="success">{seller.smartScore} smart score</Badge> : null}
          <Badge variant="outline">
            <PackageCheck className={styles.icon} />
            {seller.marketDeltaLabel}
          </Badge>
          <Badge
            variant={
              seller.busyLevel === "High"
                ? "danger"
                : seller.busyLevel === "Moderate"
                  ? "warning"
                  : "success"
            }
          >
            <Clock3 className={styles.icon} />
            {seller.busyLevel} load
          </Badge>
          <Badge variant="secondary">{seller.unitsSold.toLocaleString()} units sold</Badge>
          <Badge variant="secondary">{seller.activeOrders} active orders</Badge>
          <Badge variant="muted">{seller.handlingTime}</Badge>
        </div>

        <div className={styles.basketControls}>
          <label className={styles.quantityGroup}>
            <span className={styles.metricLabel}>Quantity</span>
            <Input
              className={styles.quantityInput}
              min="1"
              onChange={(event) =>
                setSellerQuantities((current) => ({
                  ...current,
                  [seller.id]: Math.max(1, Number(event.target.value) || 1),
                }))
              }
              type="number"
              value={getSellerQuantity(seller.id)}
            />
          </label>
          <Button onClick={() => addItem(product, seller, getSellerQuantity(seller.id))} type="button">
            Add to basket
          </Button>
        </div>
      </CardContent>
    </Card>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.backRow}>
          <BackButton fallbackTo="/" label="Back" />
        </div>

        <main className={styles.pageContent}>
          <section className={styles.topLayout}>
            <Card className={styles.overviewCard}>
              <CardHeader className={styles.overviewHeader}>
                <div className={styles.overviewTop}>
                  <div className={styles.identityRow}>
                    <Card className={styles.iconCard} size="sm">
                      <CardContent className={styles.iconBody}>{product.icon}</CardContent>
                    </Card>
                    <div>
                      <div className={styles.badgeRow}>
                        <Badge className={cn(styles.categoryBadge, categoryBadgeClass(product.category))}>
                          {product.category}
                        </Badge>
                        <Badge variant="secondary">Product detail</Badge>
                      </div>
                      <CardTitle className={styles.title}>{product.name}</CardTitle>
                      <CardDescription className={styles.description}>
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>

                  <TrendChangeBadge priceChange={product.priceChange} showSuffix />
                </div>
              </CardHeader>

              <Separator />

              <CardContent className={styles.chartBody}>
                <ProductPriceChart
                  availableRanges={product.priceHistoryByRange}
                  description={`Market history for this ingredient. Seller ranking is adjusted for your ${describeUserLocation(currentLocation, "short")} location, current price pressure, rating, and handling load.`}
                  history={product.priceHistory}
                  label={product.name}
                  priceChange={product.priceChange}
                  referencePrice={product.averagePrice}
                  showForecast
                  showRangeControls
                  subtitle={product.leadTime}
                  title="Market curve"
                  tone={product.chartColor}
                />
              </CardContent>

              <Separator />

              <CardContent className={styles.statsGrid}>
                <Card className={styles.metricCard} size="sm">
                  <CardContent className={styles.metricBody}>
                    <p className={styles.metricLabel}>Average market price</p>
                    <p className={styles.metricValue}>{formatRupiah(product.averagePrice)}</p>
                  </CardContent>
                </Card>
                <Card className={styles.metricCard} size="sm">
                  <CardContent className={styles.metricBody}>
                    <p className={styles.metricLabel}>Yearly low</p>
                    <p className={styles.metricValue}>{formatRupiah(product.yearlyLow)}</p>
                  </CardContent>
                </Card>
                <Card className={styles.metricCard} size="sm">
                  <CardContent className={styles.metricBody}>
                    <p className={styles.metricLabel}>Yearly high</p>
                    <p className={styles.metricValue}>{formatRupiah(product.yearlyHigh)}</p>
                  </CardContent>
                </Card>
                <Card className={styles.metricCard} size="sm">
                  <CardContent className={styles.metricBody}>
                    <p className={styles.metricLabel}>Market status</p>
                    <p className={styles.metricValue}>{product.marketStatus}</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            <aside className={styles.bestSellerColumn}>
              <Card className={styles.sidebarCard}>
                <CardHeader className={styles.sidebarHeader}>
                  <div className={styles.sidebarHeaderTop}>
                    <div>
                      <p className={styles.sectionLabel}>Seller routing</p>
                      <CardTitle className={styles.sidebarTitle}>Best seller candidate</CardTitle>
                    </div>
                    <Badge variant="warning">{product.sellers.length} sellers</Badge>
                  </div>
                  <CardDescription>
                    Ranked for your location in {currentLocation.area} using distance, price, rating, and current seller busyness.
                  </CardDescription>
                </CardHeader>

                <CardContent className={styles.sidebarBody}>
                  <div className={styles.bestMatchSection}>
                    {renderSellerCard(smartBestSeller, { spotlight: true })}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>

          <section className={styles.bottomSection}>
            <Card className={styles.sellersCard}>
              <CardHeader className={styles.sidebarHeader}>
                <div className={styles.sidebarHeaderTop}>
                  <div>
                    <p className={styles.sectionLabel}>Seller marketplace</p>
                    <CardTitle className={styles.sidebarTitle}>Other available sellers</CardTitle>
                  </div>
                  <Badge variant="outline">{remainingSellers.length} more offers</Badge>
                </div>
                <CardDescription>
                  Compare alternate supply lanes by smart match, location, price, or rating before adding to basket.
                </CardDescription>
              </CardHeader>

              <CardContent className={styles.bottomBody}>
                <div className={styles.sortSection}>
                  <div>
                    <h3 className={styles.sortTitle}>Sort sellers by smart match, location, price, or rating</h3>
                  </div>
                  <div className={styles.sortRow}>
                    {sortModes.map((mode) => (
                      <Button
                        key={mode.value}
                        onClick={() => setSortMode(mode.value)}
                        type="button"
                        variant={mode.value === sortMode ? "default" : "outline"}
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={styles.sellerList}>
                  {remainingSellers.map((seller) => renderSellerCard(seller))}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}

export default ProductPage
