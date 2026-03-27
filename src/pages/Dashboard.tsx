import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/dashboard/ProductCard"
import PageSurface, { PageSection } from "@/components/layout/PageSurface"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type Product } from "@/lib/data"
import { matchesProductQuery } from "@/lib/search"
import styles from "@/pages/Dashboard.module.css"

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedQuery = searchParams.get("q") ?? ""
  const { marketplaceProducts } = useMarketplace()
  const categories = useMemo(
    () => Array.from(new Set(marketplaceProducts.map((product) => product.category))),
    [marketplaceProducts]
  )
  const selectedCategory = useMemo(() => {
    const categoryParam = searchParams.get("category")
    return categoryParam && categories.includes(categoryParam as Product["category"])
      ? (categoryParam as Product["category"])
      : "all"
  }, [categories, searchParams])

  const filteredProducts = useMemo(
    () =>
      marketplaceProducts.filter((product) => {
        if (!matchesProductQuery(product, appliedQuery)) {
          return false
        }

        if (selectedCategory !== "all" && product.category !== selectedCategory) {
          return false
        }

        return true
      }),
    [appliedQuery, marketplaceProducts, selectedCategory]
  )

  const handleCategoryChange = (nextCategory: "all" | Product["category"]) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextCategory === "all") {
      nextSearchParams.delete("category")
    } else {
      nextSearchParams.set("category", nextCategory)
    }

    setSearchParams(nextSearchParams, { replace: true })
  }

  return (
    <PageSurface>
      <PageSection as="main" className={styles.catalogLayout}>
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
                {selectedCategory !== "all" ? (
                  <Badge variant="outline">{selectedCategory}</Badge>
                ) : null}
              </div>
            }
            title="Market-tracked ingredients across the marketplace"
          />

          <div className={styles.filterRow}>
            <div className={styles.categoryFilterRow}>
              <button
                className={styles.categoryFilterButton}
                data-active={selectedCategory === "all"}
                onClick={() => handleCategoryChange("all")}
                type="button"
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={styles.categoryFilterButton}
                  data-active={selectedCategory === category}
                  onClick={() => handleCategoryChange(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

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
      </PageSection>
    </PageSurface>
  )
}

export default Dashboard
