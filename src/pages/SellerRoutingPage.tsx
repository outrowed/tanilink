import { useMemo, useState, type DragEvent } from "react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace, useSellerStore } from "@/context/seller"
import { formatRupiah, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Seller.module.css"

const LOW_STOCK_THRESHOLD = 20

function SellerRoutingPage() {
  const { currentSellerListings, currentStoreProfile, sellerSummary, updateListing } = useSellerStore()
  const { getProductBySlug } = useMarketplace()
  const [draggedListingId, setDraggedListingId] = useState<number | null>(null)
  const [activeDropLocationId, setActiveDropLocationId] = useState<string | null>(null)

  const listingEntries = useMemo(
    () =>
      currentSellerListings
        .map((listing) => ({
          listing,
          product: getProductBySlug(listing.productSlug),
        }))
        .filter((entry): entry is { listing: (typeof currentSellerListings)[number]; product: Product } =>
          Boolean(entry.product)
        )
        .sort((left, right) => left.product.name.localeCompare(right.product.name)),
    [currentSellerListings, getProductBySlug]
  )

  const columns = useMemo(
    () =>
      (currentStoreProfile?.locations ?? []).map((location) => {
        const entries = listingEntries.filter((entry) => entry.listing.warehouseLocationId === location.id)
        const totalStock = entries.reduce((sum, entry) => sum + entry.listing.stockQuantity, 0)
        const lowStockCount = entries.filter((entry) => entry.listing.stockQuantity <= LOW_STOCK_THRESHOLD).length

        return {
          entries,
          location,
          lowStockCount,
          totalStock,
        }
      }),
    [currentStoreProfile?.locations, listingEntries]
  )

  const lowStockRoutedItems = useMemo(
    () => listingEntries.filter((entry) => entry.listing.stockQuantity <= LOW_STOCK_THRESHOLD).length,
    [listingEntries]
  )

  if (!currentStoreProfile || !sellerSummary) {
    return null
  }

  const handleDragStart = (listingId: number) => (event: DragEvent<HTMLElement>) => {
    setDraggedListingId(listingId)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(listingId))
  }

  const handleDragOver = (locationId: string) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"

    if (activeDropLocationId !== locationId) {
      setActiveDropLocationId(locationId)
    }
  }

  const handleDrop = (locationId: string) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault()

    if (draggedListingId == null) {
      setActiveDropLocationId(null)
      return
    }

    const listing = currentSellerListings.find((entry) => entry.id === draggedListingId)

    if (listing && listing.warehouseLocationId !== locationId) {
      updateListing(draggedListingId, { warehouseLocationId: locationId })
    }

    setDraggedListingId(null)
    setActiveDropLocationId(null)
  }

  const handleDragEnd = () => {
    setDraggedListingId(null)
    setActiveDropLocationId(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/seller" label="Back" />}
          description="Move ingredients between warehouse locations to keep routing aligned with live stock availability and fulfillment lanes."
          label="Warehouse routing"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{currentStoreProfile.locations.length} locations</Badge>
              <Badge variant="outline">{currentSellerListings.length} routed listings</Badge>
            </div>
          }
          title="Current warehouse routing"
        />

        <main className={styles.stackLayout}>
          <section className={styles.summaryGrid}>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Warehouse locations</p>
                <p className={styles.metricValue}>{currentStoreProfile.locations.length}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Routed listings</p>
                <p className={styles.metricValue}>{currentSellerListings.length}</p>
              </CardContent>
            </Card>
            <Card className={styles.surfaceCard}>
              <CardContent className={styles.metricBody}>
                <p className={styles.metricLabel}>Low-stock routed items</p>
                <p className={styles.metricValue}>{lowStockRoutedItems}</p>
              </CardContent>
            </Card>
          </section>

          {currentStoreProfile.locations.length < 2 ? (
            <div className={styles.noticeBanner}>
              Add another warehouse location to make routing more useful across your ingredient marketplace.
              <div className={styles.inlineActions}>
                <Button asChild size="sm" type="button" variant="outline">
                  <Link to="/seller/store">Open store setup</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <Card className={styles.surfaceCard}>
            <CardHeader className={styles.surfaceHeader}>
              <div className={styles.sectionHeader}>
                <div>
                  <CardTitle className={styles.surfaceTitle}>Routing board</CardTitle>
                  <CardDescription>
                    Drag ingredient cards into a warehouse column to update the live routing location for that listing.
                  </CardDescription>
                </div>
                <Button asChild type="button" variant="outline">
                  <Link to="/seller/store">Manage locations</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className={styles.surfaceBody}>
              <div className={styles.routingBoard}>
                {columns.map(({ location, entries, totalStock, lowStockCount }) => (
                  <section key={location.id} className={styles.routingColumn}>
                    <div className={styles.routingColumnHeader}>
                      <div>
                        <h3 className={styles.routingColumnTitle}>{location.label}</h3>
                        <p className={styles.routingColumnMeta}>
                          {location.area}, {location.city}
                        </p>
                      </div>
                      <div className={styles.badgeRow}>
                        <Badge variant="outline">{entries.length} listings</Badge>
                        <Badge variant="outline">{totalStock} units</Badge>
                        {lowStockCount ? <Badge variant="warning">{lowStockCount} low stock</Badge> : null}
                      </div>
                    </div>

                    <div
                      className={cn(
                        styles.routingDropZone,
                        activeDropLocationId === location.id && styles.routingDropZoneActive
                      )}
                      onDragOver={handleDragOver(location.id)}
                      onDrop={handleDrop(location.id)}
                    >
                      {entries.length ? (
                        entries.map(({ listing, product }) => (
                          <article
                            key={listing.id}
                            className={cn(
                              styles.routingCard,
                              draggedListingId === listing.id && styles.routingCardDragging
                            )}
                            draggable
                            onDragEnd={handleDragEnd}
                            onDragStart={handleDragStart(listing.id)}
                          >
                            <div className={styles.listingTopRow}>
                              <div className={styles.productIdentity}>
                                <div className={styles.iconBadge}>{product.icon}</div>
                                <div>
                                  <Link className={styles.routingCardLink} to={`/seller/ingredients/${product.slug}`}>
                                    {product.name}
                                  </Link>
                                  <p className={styles.supportingCopy}>
                                    {product.category} · {product.unit}
                                  </p>
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

                            <div className={styles.badgeRow}>
                              <Badge variant="secondary">{listing.stockQuantity} units in stock</Badge>
                              <Badge variant="outline">{formatRupiah(listing.price)}</Badge>
                            </div>

                            <div className={styles.inlineActions}>
                              <p className={styles.supportingCopy}>{listing.handlingTime}</p>
                              <Button asChild size="sm" type="button" variant="outline">
                                <Link to={`/seller/ingredients/${product.slug}`}>Open ingredient</Link>
                              </Button>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div
                          className={cn(
                            styles.routingEmptyState,
                            activeDropLocationId === location.id && styles.routingEmptyStateActive
                          )}
                        >
                          Drop an ingredient here to route it through this location.
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default SellerRoutingPage
