import type { ReactNode } from "react"

import styles from "@/components/shared/PageHeader.module.css"

interface PageHeaderProps {
  action?: ReactNode
  description: string
  label: string
  meta?: ReactNode
  title: string
}

function PageHeader({ action, description, label, meta, title }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.copy}>
        <p className={styles.label}>{label}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>

      {action || meta ? (
        <div className={styles.side}>
          {action ? <div className={styles.action}>{action}</div> : null}
          {meta ? <div className={styles.meta}>{meta}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

export default PageHeader
