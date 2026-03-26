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
type ListingStockFilter = "all" | "low-stock"

const LOW_STOCK_THRESHOLD = 20

function SellerHubPage() {
  const { currentSellerListings, currentStoreProfile, sellerSummary } = useSellerStore()
  const { getProductBySlug } = useMarketplace()
  const [statusFilter, setStatusFilter] = useState<ListingStatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<ListingCategoryFilter>("all")
  const [stockFilter, setStockFilter] = useState<ListingStockFilter>("all")

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

        if (stockFilter === "low-stock" && listing.stockQuantity > LOW_STOCK_THRESHOLD) {
          return false
        }

        return true
      }),
    [categoryFilter, listingsWithProducts, statusFilter, stockFilter]
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

  const filteredListingSummary = useMemo(() => {
    if (!filteredListings.length) {
      return {
        averageOrdersPerListing: 0,
        averageRevenuePerListing: 0,
        averageReviewsPerListing: 0,
        averageStockPerListing: 0,
        averageUnitsSoldPerListing: 0,
      }
    }

    const totalRevenue = filteredListings.reduce((sum, listing) => sum + listing.monthlyRevenue, 0)
    const totalOrders = filteredListings.reduce((sum, listing) => sum + listing.monthlyOrders, 0)
    const totalStock = filteredListings.reduce((sum, listing) => sum + listing.stockQuantity, 0)
    const totalUnitsSold = filteredListings.reduce(
      (sum, listing) => sum + getListingSalesSummary(listing).totalUnitsSold,
      0
    )
    const totalReviews = filteredListings.reduce(
      (sum, listing) => sum + getListingRatingSummary(listing).totalReviews,
      0
    )

    return {
      averageOrdersPerListing: Math.round(totalOrders / filteredListings.length),
      averageRevenuePerListing: Math.round(totalRevenue / filteredListings.length),
      averageReviewsPerListing: Math.round(totalReviews / filteredListings.length),
      averageStockPerListing: Math.round(totalStock / filteredListings.length),
      averageUnitsSoldPerListing: Math.round(totalUnitsSold / filteredListings.length),
    }
  }, [filteredListings])

  const filteredStateLabel = useMemo(() => {
    const labels = []

    labels.push(statusFilter === "all" ? "All statuses" : statusFilter === "active" ? "Active only" : "Inactive only")
    labels.push(categoryFilter === "all" ? "All categories" : categoryFilter)
    labels.push(stockFilter === "all" ? "All stock levels" : "Low stock only")

    return labels.join(" · ")
  }, [categoryFilter, statusFilter, stockFilter])

  function resetFilters() {
    setStatusFilter("all")
    setCategoryFilter("all")
    setStockFilter("all")
  }

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
                <p className={styles.metricLabel}>Average store rating</p>
                <p className={styles.metricValue}>{sellerSummary.averageStoreRating.toFixed(1)} / 5</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Active listings</p>
                <p className={styles.metricValue}>{sellerSummary.activeListings}</p>
              </CardContent>
            </Card>
          </section>

          <section className={`${styles.gridLayout} ${styles.hubGridLayout}`}>
            <section className={`${styles.mainColumn} ${styles.hubMainColumn}`}>
              <Card className={styles.surfaceCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <CardTitle className={styles.surfaceTitle}>Ingredient analytics</CardTitle>
                      <CardDescription>
                        Review headline performance for each listing, then open the ingredient page for detailed analytics and pricing or stock edits.
                      </CardDescription>
                    </div>
                    <div className={styles.filterRow}>
                      <Button asChild type="button" variant="outline">
                        <Link to="/seller/routing">Manage routing</Link>
                      </Button>
                      <Button asChild type="button" variant="outline">
                        <Link to="/seller/store">Open store setup</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <div className={styles.noticeBanner}>
                    Showing {visibleListings.length} ingredient{visibleListings.length === 1 ? "" : "s"} · {filteredStateLabel}
                  </div>
                  <div className={styles.filterToolbar}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="seller-hub-status-filter">
                        Status
                      </label>
                      <select
                        className={styles.select}
                        id="seller-hub-status-filter"
                        onChange={(event) => setStatusFilter(event.target.value as ListingStatusFilter)}
                        value={statusFilter}
                      >
                        <option value="all">All statuses</option>
                        <option value="active">Active only</option>
                        <option value="inactive">Inactive only</option>
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="seller-hub-stock-filter">
                        Stock
                      </label>
                      <select
                        className={styles.select}
                        id="seller-hub-stock-filter"
                        onChange={(event) => setStockFilter(event.target.value as ListingStockFilter)}
                        value={stockFilter}
                      >
                        <option value="all">All stock levels</option>
                        <option value="low-stock">Low stock only</option>
                      </select>
                    </div>
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
                                  {listing.stockQuantity <= LOW_STOCK_THRESHOLD ? (
                                    <Badge variant="warning">Low stock</Badge>
                                  ) : null}
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
                          Reset the current filters or register a new ingredient from the store setup page.
                        </p>
                        <div className={styles.inlineActions}>
                          <Button onClick={resetFilters} type="button" variant="outline">
                            Reset filters
                          </Button>
                          <Button asChild type="button">
                            <Link to="/seller/store">Open store setup</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </section>

            <aside className={`${styles.sideColumn} ${styles.hubSideColumn}`}>
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
                    <Badge variant="outline">{filteredStateLabel}</Badge>
                  </div>
                </CardContent>
              </Card>

              {filteredListings.length ? (
                <>
                  <ProductSalesChart
                    availableRanges={averageSalesHistoryByRange}
                    description={`Average listing sales across ${filteredListings.length} visible ingredient${filteredListings.length === 1 ? "" : "s"}. Each period averages sale price and units sold across the current filtered set.`}
                    history={averageSalesHistoryByRange["1y"]}
                    label="Store average"
                    subtitle={filteredStateLabel}
                    title="Average listing sales"
                    tone="#2563eb"
                  />

                  <Card className={styles.surfaceCard}>
                    <CardHeader className={styles.surfaceHeader}>
                      <CardTitle className={styles.surfaceTitle}>Filtered listing averages</CardTitle>
                      <CardDescription>
                        Secondary performance baselines for the ingredients currently visible in the hub.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={styles.surfaceBody}>
                      <div className={styles.inlineSummary}>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg revenue</p>
                            <p className={styles.metricTileValue}>
                              {formatRupiah(filteredListingSummary.averageRevenuePerListing)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg orders</p>
                            <p className={styles.metricTileValue}>
                              {filteredListingSummary.averageOrdersPerListing}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg stock</p>
                            <p className={styles.metricTileValue}>
                              {filteredListingSummary.averageStockPerListing}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg units sold</p>
                            <p className={styles.metricTileValue}>
                              {filteredListingSummary.averageUnitsSoldPerListing}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg rating</p>
                            <p className={styles.metricTileValue}>
                              {filteredAverageRatingSummary.averageRating.toFixed(1)} / 5
                            </p>
                          </CardContent>
                        </Card>
                        <Card className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>Avg reviews</p>
                            <p className={styles.metricTileValue}>
                              {filteredListingSummary.averageReviewsPerListing}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className={styles.noticeBanner}>
                        Strongest rating period: {filteredAverageRatingSummary.strongestPeriod}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className={styles.emptyStateCard}>
                  <CardContent className={styles.emptyStateBody}>
                    <p className={styles.emptyStateTitle}>No analytics available for this filter set.</p>
                    <p className={styles.emptyStateCopy}>
                      Clear the filters to restore store-level averages and comparison trends.
                    </p>
                    <Button onClick={resetFilters} type="button" variant="outline">
                      Reset filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SellerHubPage
