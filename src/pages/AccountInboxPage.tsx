import { useState } from "react"

import PageSurface, { PageSection, StickySidebar } from "@/components/layout/PageSurface"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMockData } from "@/context/mock-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Account.module.css"

function AccountInboxPage() {
  const { inboxThreads } = useMockData()
  const [selectedThreadId, setSelectedThreadId] = useState(inboxThreads[0]?.id ?? "")
  const selectedThread = inboxThreads.find((thread) => thread.id === selectedThreadId) ?? inboxThreads[0] ?? null
  const unreadCount = inboxThreads.filter((thread) => thread.unread).length

  return (
    <PageSurface>
      <PageHeader
        action={<BackButton fallbackTo="/account" label="Back" />}
        description="Keep delivery updates, seller messages, and support conversations together in one inbox."
        label="Inbox"
        meta={
          <div className={styles.headerMeta}>
            <Badge variant="outline">{inboxThreads.length} conversations</Badge>
            <Badge variant="outline">{unreadCount} unread</Badge>
          </div>
        }
        title="Messages and support updates"
      />

      <PageSection as="main" className={styles.splitLayout}>
        <section className={styles.listColumn}>
            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <CardTitle className={styles.panelTitle}>Conversation list</CardTitle>
                <CardDescription>Open any thread to review seller notes and support follow-ups.</CardDescription>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <div className={styles.listStack}>
                  {inboxThreads.map((thread) => (
                    <button
                      key={thread.id}
                      className={cn(
                        styles.selectionCard,
                        selectedThread?.id === thread.id && styles.selectionCardActive
                      )}
                      onClick={() => setSelectedThreadId(thread.id)}
                      type="button"
                    >
                      <div className={styles.selectionHeader}>
                        <p className={styles.selectionTitle}>{thread.sender}</p>
                        <span className={styles.selectionMeta}>{thread.timestamp}</span>
                      </div>
                      <p className={styles.selectionTitle}>{thread.subject}</p>
                      <p className={styles.selectionCopy}>{thread.preview}</p>
                      <div className={styles.selectionFooter}>
                        <Badge variant={thread.unread ? "info" : "outline"}>{thread.status}</Badge>
                        {thread.unread ? <Badge variant="warning">Unread</Badge> : null}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

        <StickySidebar className={styles.detailColumn}>
            {selectedThread ? (
              <Card className={styles.panelCard}>
                <CardHeader className={styles.panelHeader}>
                  <CardTitle className={styles.panelTitle}>{selectedThread.subject}</CardTitle>
                  <CardDescription>{selectedThread.sender}</CardDescription>
                </CardHeader>
                <CardContent className={styles.panelBody}>
                  <div className={styles.badgeRow}>
                    <Badge variant="outline">{selectedThread.status}</Badge>
                    <Badge variant={selectedThread.unread ? "warning" : "secondary"}>
                      {selectedThread.unread ? "Unread" : "Read"}
                    </Badge>
                  </div>

                  <div className={styles.messageList}>
                    {selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(styles.messageRow, message.isUser && styles.messageRowUser)}
                      >
                        <div className={cn(styles.messageBubble, message.isUser && styles.messageBubbleUser)}>
                          <p className={styles.messageAuthor}>{message.author}</p>
                          <p className={styles.messageText}>{message.body}</p>
                          <p className={styles.messageTime}>{message.sentAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.composerBlock}>
                    <p className={styles.metricLabel}>Reply</p>
                    <textarea
                      className={styles.composerArea}
                      disabled
                      placeholder="This inbox preview is read-only."
                      rows={4}
                    />
                    <Button disabled type="button">
                      Send message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
        </StickySidebar>
      </PageSection>
    </PageSurface>
  )
}

export default AccountInboxPage
