import type { FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/components/dashboard/dashboard.module.css"

interface FloatingSearchBarProps {
  prompts: string[]
  value: string
  onPromptSelect: (prompt: string) => void
  onSubmit: (value: string) => void
  onValueChange: (value: string) => void
}

function FloatingSearchBar({
  prompts,
  value,
  onPromptSelect,
  onSubmit,
  onValueChange,
}: FloatingSearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return
    }

    onSubmit(trimmedValue)
  }

  return (
    <div className={styles.floatingShell} tabIndex={0}>
      <Card className={styles.floatingCard}>
        <CardContent className={styles.floatingBody}>
          <div className={styles.floatingRow}>
            <Card className={styles.floatingIconCard}>
              <CardContent className={styles.floatingIconBody}>
                <Search className={styles.floatingSearchIcon} />
              </CardContent>
            </Card>
            <div className={styles.floatingMain}>
              <p className={styles.floatingLabel}>
                Culinary search entry
              </p>
              <p className={styles.floatingHint}>
                Hover to open the recipe planner
              </p>
              <form className={styles.floatingControls} onSubmit={handleSubmit}>
                <Input
                  className={styles.floatingInput}
                  onChange={(event) => onValueChange(event.target.value)}
                  placeholder="Type the food you want to produce and Tanilink will organize the ingredients"
                  value={value}
                />
                <Button className={styles.floatingButton} type="submit">
                  Search recipes
                </Button>
              </form>
            </div>
          </div>
          <div className={styles.floatingPromptList}>
            {prompts.map((prompt) => (
              <Button
                key={prompt}
                className={styles.floatingPromptButton}
                onClick={() => {
                  onPromptSelect(prompt)
                  onSubmit(prompt)
                }}
                type="button"
                variant="outline"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FloatingSearchBar
