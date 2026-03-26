import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import ProductSalesChart from "@/components/dashboard/ProductSalesChart"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace, useSellerStore } from "@/context/seller"
import { formatRupiah, type PriceHistoryRange, type Product } from "@/lib/data"
import {
  buildAverageRatingHistory,
  buildAverageSalesHistory,
  getListingRatingSummary,
  getListingSalesSummary,
  summarizeRatingHistory,
} from "@/lib/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Seller.module.css"

type ListingStatusFilter = "all" | "active" | "inactive"
type ListingCategoryFilter = "all" | Product["category"]

function SellerHubPage() {
  const { currentSellerListings, currentStoreProfile, sellerSummary } = useSellerStore()
  const { getProductBySlug } = useMarketplace()
  const [statusFilter, setStatusFilter] = useState<ListingStatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<ListingCategoryFilter>("all")

  const listingsWithProducts = useMemo(
    () =>
      currentSellerListings
        .map((listing) => ({
          listing,
          product: getProductBySlug(listing.productSlug),
          salesSummary: getListingSalesSummary(listing),
        }))
        .filter((entry): entry is {
          listing: (typeof currentSellerListings)[number]
          product: Product
          salesSummary: ReturnType<typeof getListingSalesSummary>
        } => Boolean(entry.product)),
    [currentSellerListings, getProductBySlug]
  )

  const categories = useMemo(
    () => Array.from(new Set(listingsWithProducts.map((entry) => entry.product.category))),
    [listingsWithProducts]
  )

  const visibleListings = useMemo(
    () =>
      listingsWithProducts.filter(({ listing, product }) => {
        if (statusFilter === "active" && !listing.isActive) {
          return false
        }

        if (statusFilter === "inactive" && listing.isActive) {
          return false
        }

        if (categoryFilter !== "all" && product.category !== categoryFilter) {
          return false
        }

        return true
      }),
    [categoryFilter, listingsWithProducts, statusFilter]
  )

  const filteredListings = useMemo(
    () => visibleListings.map((entry) => entry.listing),
    [visibleListings]
  )

  const averageSalesHistoryByRange = useMemo(() => {
    const ranges: PriceHistoryRange[] = ["1y", "6m", "1m", "1w", "24h"]

    return ranges.reduce(
      (acc, range) => {
        acc[range] = buildAverageSalesHistory(filteredListings, range)
        return acc
      },
      {} as Record<PriceHistoryRange, ReturnType<typeof buildAverageSalesHistory>>
    )
  }, [filteredListings])

  const filteredAverageRatingSummary = useMemo(() => {
    if (!filteredListings.length) {
      return {
        averageRating: 0,
        latestRating: 0,
        strongestPeriod: "No visible listings",
        strongestPeriodRating: 0,
        totalReviews: 0,
      }
    }

    return summarizeRatingHistory(buildAverageRatingHistory(filteredListings, "1y"))
  }, [filteredListings])

  if (!currentStoreProfile || !sellerSummary) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/account" label="Back" />}
          description="Track store-level performance, compare average listing health, and open ingredient pages for deeper analytics or inventory edits."
          label="Seller hub"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{sellerSummary.activeListings} active listings</Badge>
              <Badge variant="outline">{sellerSummary.lowStockCount} low-stock alerts</Badge>
            </div>
          }
          title={`${currentStoreProfile.storeName} analytics hub`}
        />

        <main className={styles.stackLayout}>
          <section className={styles.summaryGrid}>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Gross revenue</p>
                <p className={styles.metricValue}>{formatRupiah(sellerSummary.grossRevenue)}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Orders this month</p>
                <p className={styles.metricValue}>{sellerSummary.ordersThisMonth}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Pending payout</p>
                <p className={styles.metricValue}>{formatRupiah(sellerSummary.pendingPayout)}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average order value</p>
                <p className={styles.metricValue}>{formatRupiah(sellerSummary.averageOrderValue)}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average store rating</p>
                <p className={styles.metricValue}>{sellerSummary.averageStoreRating.toFixed(1)} / 5</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average reviews / listing</p>
                <p className={styles.metricValue}>{sellerSummary.averageReviewsPerListing}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average revenue / listing</p>
                <p className={styles.metricValue}>{formatRupiah(sellerSummary.averageRevenuePerListing)}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average orders / listing</p>
                <p className={styles.metricValue}>{sellerSummary.averageOrdersPerListing}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average stock / listing</p>
                <p className={styles.metricValue}>{sellerSummary.averageStockPerListing}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Average units sold / listing</p>
                <p className={styles.metricValue}>{sellerSummary.averageUnitsSoldPerListing}</p>
              </CardContent>
            </Card>
          </section>

          {filteredListings.length ? (
            <section className={styles.listStack}>
              <ProductSalesChart
                availableRanges={averageSalesHistoryByRange}
                description={`Average listing sales across ${filteredListings.length} visible ingredient${filteredListings.length === 1 ? "" : "s"}. Each period averages sale price and units sold across the current filtered set.`}
                history={averageSalesHistoryByRange["1y"]}
                label="Store average"
                subtitle="Filtered listing average"
                title="Average listing sales"
                tone="#2563eb"
              />
              <div className={styles.inlineSummary}>
                <Card className={styles.metricTile} size="sm">
                  <CardContent className={styles.metricTileBody}>
                    <p className={styles.fieldLabel}>Filtered avg rating</p>
                    <p className={styles.metricTileValue}>
                      {filteredAverageRatingSummary.averageRating.toFixed(1)} / 5
                    </p>
                  </CardContent>
                </Card>
                <Card className={styles.metricTile} size="sm">
                  <CardContent className={styles.metricTileBody}>
                    <p className={styles.fieldLabel}>Filtered avg reviews</p>
                    <p className={styles.metricTileValue}>
                      {filteredListings.length
                        ? Math.round(filteredAverageRatingSummary.totalReviews / filteredListings.length)
                        : 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className={styles.metricTile} size="sm">
                  <CardContent className={styles.metricTileBody}>
                    <p className={styles.fieldLabel}>Strongest rating period</p>
                    <p className={styles.metricTileValue}>{filteredAverageRatingSummary.strongestPeriod}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          ) : null}

          <section className={styles.gridLayout}>
            <section className={styles.mainColumn}>
              <Card className={styles.surfaceCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <CardTitle className={styles.surfaceTitle}>Ingredient analytics</CardTitle>
                      <CardDescription>
                        Review headline performance for each listing, then open the ingredient page for detailed analytics and pricing or stock edits.
                      </CardDescription>
                    </div>
                    <Button asChild type="button" variant="outline">
                      <Link to="/seller/store">Open store setup</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <div className={styles.filterRow}>
                    {(["all", "active", "inactive"] as ListingStatusFilter[]).map((filter) => (
                      <Button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        type="button"
                        variant={statusFilter === filter ? "default" : "outline"}
                      >
                        {filter === "all" ? "All statuses" : filter === "active" ? "Active only" : "Inactive only"}
                      </Button>
                    ))}
                  </div>
                  <div className={styles.filterRow}>
                    <Button
                      onClick={() => setCategoryFilter("all")}
                      type="button"
                      variant={categoryFilter === "all" ? "default" : "outline"}
                    >
                      All categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        type="button"
                        variant={categoryFilter === category ? "default" : "outline"}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {visibleListings.length ? (
                    <div className={styles.listStack}>
                      {visibleListings.map(({ listing, product, salesSummary }) => {
                        const selectedDeliveryLabels = currentStoreProfile.deliveryOptions
                          .filter((option) => listing.deliveryOptionIds.includes(option.id))
                          .map((option) => option.label)
                        const ratingSummary = getListingRatingSummary(listing)

                        return (
                          <Card key={listing.id} className={styles.listingCard}>
                            <CardHeader className={styles.surfaceHeader}>
                              <div className={styles.listingTopRow}>
                                <div className={styles.productIdentity}>
                                  <div className={styles.iconBadge}>{product.icon}</div>
                                  <div>
                                    <CardTitle className={styles.surfaceTitle}>{product.name}</CardTitle>
                                    <CardDescription>
                                      {product.category} · {product.unit}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className={styles.badgeRow}>
                                  <Badge variant={listing.isActive ? "success" : "outline"}>
                                    {listing.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  {listing.stockQuantity <= 20 ? <Badge variant="warning">Low stock</Badge> : null}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className={styles.surfaceBody}>
                              <div className={styles.inlineSummary}>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Units sold</p>
                                    <p className={styles.metricTileValue}>{salesSummary.totalUnitsSold}</p>
                                  </CardContent>
                                </Card>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Monthly orders</p>
                                    <p className={styles.metricTileValue}>{listing.monthlyOrders}</p>
                                  </CardContent>
                                </Card>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Revenue</p>
                                    <p className={styles.metricTileValue}>{formatRupiah(listing.monthlyRevenue)}</p>
                                  </CardContent>
                                </Card>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Average sale price</p>
                                    <p className={styles.metricTileValue}>
                                      {formatRupiah(salesSummary.averageSalePrice)}
                                    </p>
                                  </CardContent>
                                </Card>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Rating</p>
                                    <p className={styles.metricTileValue}>
                                      {ratingSummary.latestRating.toFixed(1)} / 5
                                    </p>
                                  </CardContent>
                                </Card>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Reviews</p>
                                    <p className={styles.metricTileValue}>{ratingSummary.totalReviews}</p>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className={styles.badgeRow}>
                                <Badge variant="secondary">{listing.stockQuantity} units in stock</Badge>
                                <Badge variant="outline">{formatRupiah(listing.price)} live price</Badge>
                                {selectedDeliveryLabels.map((label) => (
                                  <Badge key={`${listing.id}-${label}`} variant="outline">
                                    {label}
                                  </Badge>
                                ))}
                              </div>

                              <div className={styles.inlineActions}>
                                <p className={styles.supportingCopy}>
                                  Open the ingredient page to inspect detailed sale curves and update pricing, stock, warehouse, or delivery configuration.
                                </p>
                                <Button asChild type="button">
                                  <Link to={`/seller/ingredients/${product.slug}`}>Open ingredient page</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <Card className={styles.emptyStateCard}>
                      <CardContent className={styles.emptyStateBody}>
                        <p className={styles.emptyStateTitle}>No listings match the current filters.</p>
                        <p className={styles.emptyStateCopy}>
                          Adjust the filters or register a new ingredient from the store setup page.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </section>

            <aside className={styles.sideColumn}>
              <Card className={styles.surfaceCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <CardTitle className={styles.surfaceTitle}>Store overview</CardTitle>
                  <CardDescription>Identity and operational footprint used across all live ingredient listings.</CardDescription>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <p className={styles.storeName}>{currentStoreProfile.storeName}</p>
                  <p className={styles.supportingCopy}>{currentStoreProfile.description}</p>
                  <div className={styles.badgeRow}>
                    <Badge variant="outline">{currentStoreProfile.locations.length} locations</Badge>
                    <Badge variant="outline">{currentStoreProfile.deliveryOptions.length} delivery options</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className={styles.surfaceCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <CardTitle className={styles.surfaceTitle}>Average listing performance</CardTitle>
                  <CardDescription>Use these averages as a baseline when comparing ingredients in the hub.</CardDescription>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <div className={styles.inlineSummary}>
                    <Card className={styles.metricTile} size="sm">
                      <CardContent className={styles.metricTileBody}>
                        <p className={styles.fieldLabel}>Avg revenue</p>
                        <p className={styles.metricTileValue}>{formatRupiah(sellerSummary.averageRevenuePerListing)}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricTile} size="sm">
                      <CardContent className={styles.metricTileBody}>
                        <p className={styles.fieldLabel}>Avg orders</p>
                        <p className={styles.metricTileValue}>{sellerSummary.averageOrdersPerListing}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricTile} size="sm">
                      <CardContent className={styles.metricTileBody}>
                        <p className={styles.fieldLabel}>Avg units sold</p>
                        <p className={styles.metricTileValue}>{sellerSummary.averageUnitsSoldPerListing}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerHubPage
