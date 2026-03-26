import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace, useSellerStore } from "@/context/seller"
import { formatRupiah, type Product } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/Seller.module.css"

type ListingStatusFilter = "all" | "active" | "inactive"
type ListingCategoryFilter = "all" | Product["category"]

function SellerHubPage() {
  const { currentSellerListings, currentStoreProfile, sellerSummary, toggleListing, removeListing, updateListing } =
    useSellerStore()
  const { getProductBySlug } = useMarketplace()
  const [statusFilter, setStatusFilter] = useState<ListingStatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<ListingCategoryFilter>("all")

  const listingsWithProducts = useMemo(
    () =>
      currentSellerListings
        .map((listing) => ({
          listing,
          product: getProductBySlug(listing.productSlug),
        }))
        .filter((entry): entry is { listing: (typeof currentSellerListings)[number]; product: Product } =>
          Boolean(entry.product)
        ),
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

  if (!currentStoreProfile || !sellerSummary) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/account" label="Back" />}
          description="Monitor store performance, edit live listings, and keep inventory details aligned with the customer marketplace."
          label="Seller hub"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{sellerSummary.activeListings} active listings</Badge>
              <Badge variant="outline">{sellerSummary.lowStockCount} low-stock alerts</Badge>
            </div>
          }
          title={`${currentStoreProfile.storeName} product hub`}
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
                <p className={styles.metricLabel}>Average order value</p>
                <p className={styles.metricValue}>{formatRupiah(sellerSummary.averageOrderValue)}</p>
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
                <p className={styles.metricLabel}>Active listings</p>
                <p className={styles.metricValue}>{sellerSummary.activeListings}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Low-stock alerts</p>
                <p className={styles.metricValue}>{sellerSummary.lowStockCount}</p>
              </CardContent>
            </Card>
          </section>

          <section className={styles.gridLayout}>
            <section className={styles.mainColumn}>
              <Card className={styles.surfaceCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <CardTitle className={styles.surfaceTitle}>Live inventory manager</CardTitle>
                      <CardDescription>
                        Update price, stock, warehouse, and delivery-related listing details inline.
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
                      {visibleListings.map(({ listing, product }) => {
                        const selectedDeliveryLabels = currentStoreProfile.deliveryOptions
                          .filter((option) => listing.deliveryOptionIds.includes(option.id))
                          .map((option) => option.label)

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
                              <div className={styles.formGrid}>
                                <label className={styles.fieldGroup}>
                                  <span className={styles.fieldLabel}>Price</span>
                                  <Input
                                    onChange={(event) =>
                                      updateListing(listing.id, { price: Number(event.target.value) || 0 })
                                    }
                                    type="number"
                                    value={listing.price}
                                  />
                                </label>
                                <label className={styles.fieldGroup}>
                                  <span className={styles.fieldLabel}>Stock quantity</span>
                                  <Input
                                    onChange={(event) =>
                                      updateListing(listing.id, { stockQuantity: Number(event.target.value) || 0 })
                                    }
                                    type="number"
                                    value={listing.stockQuantity}
                                  />
                                </label>
                                <label className={styles.fieldGroup}>
                                  <span className={styles.fieldLabel}>Stock label</span>
                                  <Input
                                    onChange={(event) => updateListing(listing.id, { stockLabel: event.target.value })}
                                    type="text"
                                    value={listing.stockLabel}
                                  />
                                </label>
                                <label className={styles.fieldGroup}>
                                  <span className={styles.fieldLabel}>Handling time</span>
                                  <Input
                                    onChange={(event) => updateListing(listing.id, { handlingTime: event.target.value })}
                                    type="text"
                                    value={listing.handlingTime}
                                  />
                                </label>
                              </div>

                              <div className={styles.inlineSummary}>
                                <Card className={styles.metricTile} size="sm">
                                  <CardContent className={styles.metricTileBody}>
                                    <p className={styles.fieldLabel}>Monthly revenue</p>
                                    <p className={styles.metricTileValue}>{formatRupiah(listing.monthlyRevenue)}</p>
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
                                    <p className={styles.fieldLabel}>Pending payout</p>
                                    <p className={styles.metricTileValue}>{formatRupiah(listing.pendingPayout)}</p>
                                  </CardContent>
                                </Card>
                              </div>

                              <div className={styles.badgeRow}>
                                {selectedDeliveryLabels.map((label) => (
                                  <Badge key={`${listing.id}-${label}`} variant="outline">
                                    {label}
                                  </Badge>
                                ))}
                              </div>

                              <div className={styles.inlineActions}>
                                <Button onClick={() => toggleListing(listing.id)} type="button" variant="outline">
                                  {listing.isActive ? "Pause listing" : "Activate listing"}
                                </Button>
                                <Button onClick={() => removeListing(listing.id)} type="button" variant="destructive">
                                  Remove listing
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
                          Adjust the status or category filters, or register a new ingredient from the store page.
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
                  <CardDescription>Seller identity and operational footprint used across your listings.</CardDescription>
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
                  <CardTitle className={styles.surfaceTitle}>Marketplace sync</CardTitle>
                  <CardDescription>Active listings immediately appear on consumer product pages and seller ranking.</CardDescription>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <div className={styles.listStack}>
                    {currentSellerListings.slice(0, 3).map((listing) => {
                      const product = getProductBySlug(listing.productSlug)

                      return product ? (
                        <Card key={`sync-${listing.id}`} className={styles.metricTile} size="sm">
                          <CardContent className={styles.metricTileBody}>
                            <p className={styles.fieldLabel}>{product.name}</p>
                            <p className={styles.metricTileValue}>{formatRupiah(listing.price)}</p>
                          </CardContent>
                        </Card>
                      ) : null
                    })}
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
