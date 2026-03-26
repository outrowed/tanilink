import type { Product } from "@/lib/data"
import styles from "@/components/dashboard/dashboard.module.css"

export function categoryBadgeClass(category: Product["category"]) {
  switch (category) {
    case "Staple":
      return styles.badgeStaple
    case "Protein":
      return styles.badgeProtein
    case "Vegetable":
      return styles.badgeVegetable
    case "Spice":
      return styles.badgeSpice
    case "Pantry":
      return styles.badgePantry
  }
}
