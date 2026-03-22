"use client"

import { useEffect, useState } from "react"
import { Clock, Loader2 } from "lucide-react"
import { AppNav } from "@/components/ui/AppNav"
import { PageMain } from "@/components/ui/PageMain"
import {
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardContent,
} from "@/components/ui/CustomCard"
import { getAnalyses, type AnalysisEntry } from "@/lib/api"
import { Reveal } from "@/components/ui/Reveal"

function MoodBadge({ score }: { score: number }) {
  const color =
    score >= 7
      ? "bg-green-500/10 text-green-500"
      : score >= 4
        ? "bg-yellow-500/10 text-yellow-500"
        : "bg-red-500/10 text-red-500"
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      Mood: {score}/10
    </span>
  )
}

function UrgencyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    normal: "bg-green-500/10 text-green-500",
    elevated: "bg-yellow-500/10 text-yellow-500",
    emergency: "bg-red-500/10 text-red-500",
  }
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[level] ?? "bg-muted text-muted-foreground"}`}
    >
      {level}
    </span>
  )
}

export default function LogPage() {
  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalyses(1, 20)
        setAnalyses(res.data)
      } catch (e) {
        console.error("Failed to load analyses:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen">
      <AppNav />

      <PageMain>
        <Reveal>
          <h1 className="mb-6 text-2xl font-medium">Check-in history</h1>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : analyses.length === 0 ? (
          <Reveal delay={0.05}>
            <CustomCard>
              <CustomCardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No check-in history yet. Sessions will appear here after completion.
                </p>
              </CustomCardContent>
            </CustomCard>
          </Reveal>
        ) : (
          <div className="flex flex-col gap-4">
            {analyses.map((entry, i) => (
              <Reveal key={entry.sessionId} delay={i * 0.08}>
                <CustomCard>
                  <CustomCardHeader>
                    <div className="flex items-center justify-between">
                      <CustomCardTitle>
                        {entry.contactName || "Session"}
                      </CustomCardTitle>
                      <div className="flex items-center gap-2">
                        <MoodBadge score={entry.moodScore} />
                        <UrgencyBadge level={entry.urgencyLevel} />
                      </div>
                    </div>
                    <CustomCardDescription>
                      <Clock className="mr-1 inline h-3 w-3" />
                      {entry.createdAt}
                    </CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <p className="text-sm text-muted-foreground">
                      {entry.summary}
                    </p>
                    {entry.concerns.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.concerns.map((concern) => (
                          <span
                            key={concern}
                            className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-500"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    )}
                  </CustomCardContent>
                </CustomCard>
              </Reveal>
            ))}
          </div>
        )}
      </PageMain>
    </div>
  )
}
