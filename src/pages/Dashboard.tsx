import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/dashboard/ProductCard"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { matchesProductQuery } from "@/lib/search"
import styles from "@/pages/Dashboard.module.css"

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appliedQuery = searchParams.get("q") ?? ""
  const { marketplaceProducts } = useMarketplace()

  const filteredProducts = useMemo(
    () => marketplaceProducts.filter((product) => matchesProductQuery(product, appliedQuery)),
    [appliedQuery, marketplaceProducts]
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <main className={styles.catalogLayout}>
          <section className={styles.catalogSection}>
            <PageHeader
              description="Browse market-tracked products, compare their price curves, and open seller-aware detail pages."
              label="Ingredient marketplace"
              meta={
                <div className={styles.catalogMeta}>
                  <Badge variant="info">{filteredProducts.length} visible products</Badge>
                  {appliedQuery ? (
                    <Badge variant="outline">Filtered by "{appliedQuery}"</Badge>
                  ) : null}
                </div>
              }
              title="Market-tracked ingredients across the marketplace"
            />

            {filteredProducts.length ? (
              <div className={styles.catalogList}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={styles.catalogItem}>
                    <ProductCard
                      isActive={false}
                      onSelect={() => navigate(`/products/${product.slug}`)}
                      product={product}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className={styles.emptyStateCard}>
                <CardContent className={styles.emptyStateBody}>
                  <p className={styles.emptyStateTitle}>No products match this search.</p>
                  <p className={styles.emptyStateCopy}>
                    Try another ingredient name, category, seller location, or use the global AI search in the navbar.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
