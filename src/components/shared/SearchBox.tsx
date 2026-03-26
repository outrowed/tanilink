import { useMemo, useState, type FormEvent } from "react"
import { Clock3, Search, Sparkles, X } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { useMarketplace } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { recentAiSearches } from "@/lib/data"
import { getProductSuggestions } from "@/lib/search"
import { cn } from "@/lib/utils"
import styles from "@/components/shared/SearchBox.module.css"

type SearchMode = "marketplace" | "ai"
type SearchBoxVariant = "navbar" | "hero"

interface SearchBoxProps {
  alwaysShowSuggestions?: boolean
  className?: string
  defaultMode?: SearchMode
  placeholder?: string
  variant?: SearchBoxVariant
}

function getCurrentMode(pathname: string, searchParams: URLSearchParams, defaultMode: SearchMode): SearchMode {
  if (pathname === "/search" || pathname === "/planner/results") {
    return searchParams.get("mode") === "ai" ? "ai" : "marketplace"
  }

  return defaultMode
}

function getResultsHref(query: string, mode: SearchMode) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return "/"
  }

  return mode === "ai"
    ? `/search?q=${encodeURIComponent(trimmedQuery)}&mode=ai`
    : `/search?q=${encodeURIComponent(trimmedQuery)}`
}

function SearchBox({
  alwaysShowSuggestions = false,
  className,
  defaultMode = "marketplace",
  placeholder = "Search ingredients, sellers, or ask for a dish or supply bundle",
  variant = "navbar",
}: SearchBoxProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const routeQuery = searchParams.get("q") ?? ""

  return (
    <SearchBoxInner
      alwaysShowSuggestions={alwaysShowSuggestions}
      key={`${location.pathname}:${location.search}`}
      className={className}
      defaultMode={defaultMode}
      initialQuery={routeQuery}
      placeholder={placeholder}
      variant={variant}
    />
  )
}

interface SearchBoxInnerProps extends SearchBoxProps {
  initialQuery: string
}

function SearchBoxInner({
  alwaysShowSuggestions = false,
  className,
  defaultMode = "marketplace",
  initialQuery,
  placeholder = "Search ingredients, sellers, or ask for a dish or supply bundle",
  variant = "navbar",
}: SearchBoxInnerProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)
  const { marketplaceProducts } = useMarketplace()

  const currentMode = getCurrentMode(location.pathname, searchParams, defaultMode)
  const isAiSelected = currentMode === "ai"
  const normalizedQuery = query.trim().toLowerCase()
  const productSuggestions = useMemo(
    () => getProductSuggestions(marketplaceProducts, query),
    [marketplaceProducts, query]
  )
  const shouldShowSuggestions = alwaysShowSuggestions || isOpen

  const handleNavigate = (mode: SearchMode, nextQuery = query) => {
    navigate(getResultsHref(nextQuery, mode))
    setIsOpen(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleNavigate("marketplace")
  }

  const handleReset = () => {
    setQuery("")
    setIsOpen(false)
    navigate("/")
  }

  return (
    <div className={cn(styles.root, variant === "hero" && styles.rootHero, className)}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <div className={styles.searchInputWrap}>
          <Search className={styles.searchIcon} />
          <Input
            className={cn(styles.searchInput, variant === "hero" && styles.searchInputHero)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120)
            }}
            onChange={(event) => {
              setQuery(event.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            value={query}
          />
          <div className={styles.searchActions}>
            {query ? (
              <button className={styles.resetButton} onClick={handleReset} type="button">
                <X className={styles.smallIcon} />
              </button>
            ) : null}
            <Button
              className={cn(styles.actionButton, styles.aiButton, isAiSelected && styles.activeTabButton)}
              onClick={() => handleNavigate("ai")}
              type="button"
              variant={isAiSelected ? "default" : "secondary"}
            >
              <Sparkles className={styles.smallIcon} />
              <span className={styles.aiText}>AI</span>
            </Button>
          </div>
        </div>
      </form>

      {shouldShowSuggestions ? (
        <div className={styles.suggestionPanel}>
          {normalizedQuery ? (
            <div className={styles.suggestionSection}>
              <p className={styles.suggestionLabel}>Matching products</p>
              {productSuggestions.length ? (
                productSuggestions.map((product) => (
                  <button
                    key={product.id}
                    className={styles.suggestionButton}
                    onClick={() => {
                      navigate(`/products/${product.slug}`)
                      setIsOpen(false)
                    }}
                    type="button"
                  >
                    <div>
                      <p className={styles.suggestionTitle}>{product.name}</p>
                      <p className={styles.suggestionMeta}>
                        {product.category} · {product.unit}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {product.priceChange > 0 ? `+${product.priceChange}%` : `${product.priceChange}%`}
                    </Badge>
                  </button>
                ))
              ) : (
                <p className={styles.suggestionEmpty}>No direct product matches yet.</p>
              )}
            </div>
          ) : null}

          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <Clock3 className={styles.smallIcon} />
              <p className={styles.suggestionLabel}>Recent AI searches</p>
            </div>
            <div className={styles.recentList}>
              {recentAiSearches.map((search) => (
                <button
                  key={search}
                  className={styles.recentButton}
                  onClick={() => handleNavigate("ai", search)}
                  type="button"
                >
                  <Sparkles className={styles.smallIcon} />
                  {search}
                </button>
              ))}
            </div>
          </div>

          {normalizedQuery ? (
            <div className={styles.actionRow}>
              <button className={styles.routeButton} onClick={() => handleNavigate("marketplace")} type="button">
                <Search className={styles.smallIcon} />
                Search marketplace for "{query.trim()}"
              </button>
              <button className={styles.routeButton} onClick={() => handleNavigate("ai")} type="button">
                <Sparkles className={styles.smallIcon} />
                Ask AI planner about "{query.trim()}"
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default SearchBox
