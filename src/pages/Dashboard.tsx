import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/dashboard/ProductCard"
import PageHeader from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { products, type Product } from "@/lib/data"
import styles from "@/pages/Dashboard.module.css"

function matchesProductQuery(product: Product, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [
    product.name,
    product.category,
    product.description,
    product.marketStatus,
    ...product.sellers.map((seller) => seller.location),
    ...product.sellers.map((seller) => seller.name),
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appliedQuery = searchParams.get("q") ?? ""

  const filteredProducts = useMemo(
    () => products.filter((product) => matchesProductQuery(product, appliedQuery)),
    [appliedQuery]
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <main className={styles.catalogLayout}>
          <section className={styles.catalogSection}>
            <PageHeader
              description="Browse market-tracked products, compare their price curves, and open seller-aware detail pages."
              label="Ingredient catalog"
              meta={
                <div className={styles.catalogMeta}>
                  <Badge variant="info">{filteredProducts.length} visible products</Badge>
                  {appliedQuery ? (
                    <Badge variant="outline">Filtered by "{appliedQuery}"</Badge>
                  ) : null}
                </div>
              }
              title="Market-tracked ingredients for kitchens and consumers"
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
