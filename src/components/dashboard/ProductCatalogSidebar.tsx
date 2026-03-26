import type { Product } from "@/lib/data"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/dashboard/ProductCard"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductCatalogSidebarProps {
  products: Product[]
  selectedProductId: number | null
  onClearSelection: () => void
  onSelectProduct: (id: number) => void
}

function ProductCatalogSidebar({
  products,
  selectedProductId,
  onClearSelection,
  onSelectProduct,
}: ProductCatalogSidebarProps) {
  return (
    <aside>
      <Card className={styles.sidebarCard}>
        <CardHeader className={styles.sidebarHeader}>
          <p className={styles.sectionLabel}>Ingredient catalog</p>
          <CardTitle className={styles.sectionTitle}>
            Select a product
          </CardTitle>
          {selectedProductId !== null ? (
            <CardAction>
              <Button
                className={styles.sidebarClearButton}
                onClick={onClearSelection}
                size="sm"
                type="button"
                variant="ghost"
              >
                Clear
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <Separator />
        <CardContent className={styles.sidebarBody}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              isActive={product.id === selectedProductId}
              onSelect={() => onSelectProduct(product.id)}
              product={product}
            />
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}

export default ProductCatalogSidebar
