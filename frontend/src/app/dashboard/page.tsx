"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Play, Moon, TrendingUp, Pill, ShieldCheck,
  Utensils, Activity, Users, Brain, X, Plus, Check, ArrowRight, type LucideIcon,
} from "lucide-react"
import { Reorder, AnimatePresence, motion } from "motion/react"
import { CustomButton2 } from "@/components/ui/CustomButton2"
import { CustomInput } from "@/components/ui/CustomInput"
import { Reveal } from "@/components/ui/Reveal"
import { AppNav } from "@/components/ui/AppNav"
import { PageMain } from "@/components/ui/PageMain"
import { cn } from "@/lib/utils"

// ── Summary tiles ──────────────────────────────────────────

type SummaryTile = {
  id: string
  category: string
  icon: LucideIcon
  color: string        // border + bg tint
  body: string | null   // null = not discussed recently
}

const summaryTiles: SummaryTile[] = [
  {
    id: "mood",
    category: "Mood",
    icon: TrendingUp,
    color: "emerald",
    body: "Rose's mood has been trending upward over the last 3 sessions — she's been cooking more and eating well.",
  },
  {
    id: "sleep",
    category: "Sleep",
    icon: Moon,
    color: "blue",
    body: "Rose reported some difficulty sleeping over the past few nights. Worth checking in on.",
  },
  {
    id: "medication",
    category: "Medication",
    icon: Pill,
    color: "amber",
    body: "Rose mentioned skipping her morning medication on Tuesday but said she remembered to take it by the evening.",
  },
  {
    id: "nutrition",
    category: "Nutrition",
    icon: Utensils,
    color: "orange",
    body: "Rose has been eating well this week — she mentioned trying a new soup recipe and having regular meals.",
  },
  {
    id: "safety",
    category: "Safety",
    icon: ShieldCheck,
    color: "green",
    body: "No emergency concerns flagged across any of Rose's sessions this week.",
  },
  {
    id: "social",
    category: "Social",
    icon: Users,
    color: "violet",
    body: "Rose mentioned that you visited last weekend and that her neighbour Helen brought over flowers.",
  },
  {
    id: "physical",
    category: "Physical health",
    icon: Activity,
    color: "rose",
    body: null,
  },
  {
    id: "cognitive",
    category: "Cognitive",
    icon: Brain,
    color: "cyan",
    body: null,
  },
]

const tileColors: Record<string, { border: string; bg: string; icon: string }> = {
  emerald: { border: "border-emerald-500/50", bg: "bg-emerald-500/5",  icon: "text-emerald-500" },
  blue:    { border: "border-blue-500/50",    bg: "bg-blue-500/5",     icon: "text-blue-500" },
  amber:   { border: "border-amber-500/50",   bg: "bg-amber-500/5",    icon: "text-amber-500" },
  orange:  { border: "border-orange-500/50",  bg: "bg-orange-500/5",   icon: "text-orange-500" },
  green:   { border: "border-green-500/50",   bg: "bg-green-500/5",    icon: "text-green-500" },
  violet:  { border: "border-violet-500/50",  bg: "bg-violet-500/5",   icon: "text-violet-500" },
  rose:    { border: "border-rose-500/50",    bg: "bg-rose-500/5",     icon: "text-rose-500" },
  cyan:    { border: "border-cyan-500/50",    bg: "bg-cyan-500/5",     icon: "text-cyan-500" },
}

// ── Talking points ────────────────────────────────────────

type TalkingPoint = {
  id: string
  note: string
  status: "pending" | "addressed"
  response?: string
}

const initialTalkingPoints: TalkingPoint[] = [
  { id: "1", note: "Ask about the chest tightness from last week", status: "addressed", response: "Rose said it went away after resting. She hasn't felt it since Tuesday and thinks it was just stress." },
  { id: "2", note: "Check if she's been taking morning medication", status: "addressed", response: "She missed Tuesday but has been consistent every other day. Remembered to take it by the evening." },
  { id: "3", note: "Mention the family reunion plans", status: "pending" },
  { id: "4", note: "Ask about appetite and meals this week", status: "pending" },
]

// ── Sessions ──────────────────────────────────────────────

type Session = {
  id: string
  contact: string
  title: string
  date: string
  time: string
  duration: string
  location: string
  moodScore: number
  urgency: "normal" | "elevated" | "emergency"
}

const mockSessions: Session[] = [
  { id: "1", contact: "Grandma Rose", title: "Garden update & Sarah's visit last weekend",        date: "Mar 21, 2026", time: "9:14 AM",  duration: "12 min", location: "742 Evergreen Terrace, Springfield",  moodScore: 8, urgency: "normal" },
  { id: "2", contact: "Uncle Bob",    title: "Trouble sleeping and lower energy than usual",      date: "Mar 20, 2026", time: "2:30 PM",  duration: "8 min",  location: "18 Maple St, Shelbyville",            moodScore: 4, urgency: "elevated" },
  { id: "3", contact: "Aunt May",     title: "New soup recipe, eating well, excited for reunion", date: "Mar 21, 2026", time: "11:00 AM", duration: "15 min", location: "Sunrise Assisted Living, 90 Oak Ave", moodScore: 9, urgency: "normal" },
  { id: "4", contact: "Grandma Rose", title: "Feeling alone, missed meals, chest tightness",     date: "Mar 19, 2026", time: "8:45 AM",  duration: "10 min", location: "742 Evergreen Terrace, Springfield",  moodScore: 3, urgency: "emergency" },
  { id: "5", contact: "Uncle Bob",    title: "Staying indoors more, less social this week",      date: "Mar 18, 2026", time: "4:00 PM",  duration: "6 min",  location: "18 Maple St, Shelbyville",            moodScore: 5, urgency: "elevated" },
  { id: "6", contact: "Aunt May",     title: "Book club meeting and flowers from neighbour",     date: "Mar 17, 2026", time: "10:30 AM", duration: "14 min", location: "Sunrise Assisted Living, 90 Oak Ave", moodScore: 8, urgency: "normal" },
]

// ── Helpers ────────────────────────────────────────────────

function sessionDot(urgency: string, moodScore: number) {
  if (urgency === "emergency" || moodScore < 4) return "bg-red-500"
  if (urgency === "elevated" || moodScore < 7)  return "bg-yellow-500"
  return "bg-green-500"
}

function sessionColors(urgency: string, moodScore: number) {
  if (urgency === "emergency" || moodScore < 4) return "border-red-500/60 bg-red-500/5 hover:bg-red-500/10"
  if (urgency === "elevated" || moodScore < 7)  return "border-yellow-500/60 bg-yellow-500/5 hover:bg-yellow-500/10"
  return "border-green-500/60 bg-green-500/5 hover:bg-green-500/10"
}

// ── Page ───────────────────────────────────────────────────

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [tiles, setTiles] = useState<SummaryTile[]>(summaryTiles)
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>(initialTalkingPoints)
  const [newNote, setNewNote] = useState("")

  const removedTiles = summaryTiles.filter(t => !tiles.find(v => v.id === t.id))

  // Sort: pending first, then addressed
  const sortedTalkingPoints = [...talkingPoints].sort((a, b) => {
    if (a.status === "pending" && b.status === "addressed") return -1
    if (a.status === "addressed" && b.status === "pending") return 1
    return 0
  })

  function addTalkingPoint() {
    const trimmed = newNote.trim()
    if (!trimmed) return
    setTalkingPoints(prev => [...prev, {
      id: Date.now().toString(),
      note: trimmed,
      status: "pending",
    }])
    setNewNote("")
  }

  function removeTalkingPoint(id: string) {
    setTalkingPoints(prev => prev.filter(tp => tp.id !== id))
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <div className="fixed top-6 right-6 z-50">
        <CustomButton2>Sign out</CustomButton2>
      </div>

      <PageMain>

        {/* ── While you were gone ── */}
        <section>
          <Reveal>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-normal">While you were gone</h2>
              <CustomButton2 onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Done" : "Edit"}
              </CustomButton2>
            </div>
            <p className="text-base text-muted-foreground mb-5">A recent summary of Rose's check-in calls.</p>
          </Reveal>
          <Reorder.Group
            as="div"
            axis="x"
            values={tiles}
            onReorder={setTiles}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatePresence>
              {tiles.map((tile, i) => {
                const c = tileColors[tile.color]
                const Icon = tile.icon
                return (
                  <Reorder.Item
                    key={tile.id}
                    value={tile}
                    as="div"
                    dragListener={isEditing}
                    className="relative"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: isEditing ? [-1.5, 1.5, -1.5] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={isEditing ? {
                      rotate: { repeat: Infinity, duration: 0.25 + (i % 4) * 0.03, ease: "easeInOut" },
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    } : {
                      rotate: { duration: 0.2 },
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    {isEditing && (
                      <button
                        onClick={() => setTiles(prev => prev.filter(t => t.id !== tile.id))}
                        className="absolute -top-2 -right-2 z-10 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div className={cn(
                      "rounded-xl border p-4 h-full transition-colors",
                      c.border, c.bg,
                      isEditing && "cursor-grab active:cursor-grabbing",
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("h-4 w-4", c.icon)} />
                        <p className="text-sm font-medium">{tile.category}</p>
                      </div>
                      {tile.body ? (
                        <p className="text-sm text-muted-foreground leading-relaxed">{tile.body}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">Not discussed in recent sessions.</p>
                      )}
                    </div>
                  </Reorder.Item>
                )
              })}
            </AnimatePresence>

            {/* Ghost cards for removed tiles */}
            {isEditing && removedTiles.map((tile) => {
              const c = tileColors[tile.color]
              const Icon = tile.icon
              return (
                <motion.div
                  key={`ghost-${tile.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="cursor-pointer"
                  onClick={() => setTiles(prev => [...prev, tile])}
                >
                  <div className={cn(
                    "rounded-xl border-2 border-dashed p-4 h-full transition-colors opacity-40 hover:opacity-70",
                    c.border, c.bg,
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-4 w-4", c.icon)} />
                      <p className="text-sm font-medium">{tile.category}</p>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </Reorder.Group>
        </section>

        {/* ── Talking points ── */}
        <section>
          <Reveal>
            <h2 className="text-2xl font-normal mb-1">Talking points</h2>
            <p className="text-base text-muted-foreground mb-5">Things to bring up in Rose's next session.</p>
          </Reveal>

          {/* Add new note */}
          <Reveal delay={0.04}>
            <form
              onSubmit={(e) => { e.preventDefault(); addTalkingPoint() }}
              className="flex gap-2 mb-5"
            >
              <CustomInput
                placeholder="Add a note for the next session..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <CustomButton2 type="submit" className="shrink-0">
                <Plus className="h-4 w-4" />
                Add
              </CustomButton2>
            </form>
          </Reveal>

          {/* Talking point list */}
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {sortedTalkingPoints.map((tp, i) => (
                <motion.div
                  key={tp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Reveal delay={i * 0.04}>
                    <div className={cn(
                      "grid gap-3 items-stretch",
                      tp.status === "addressed" ? "sm:grid-cols-[1fr,auto,1fr]" : "sm:grid-cols-1",
                    )}>
                      {/* Note card (always yellow) */}
                      <div className={cn(
                        "rounded-xl border p-4 flex items-start gap-3",
                        tp.status === "pending"
                          ? "border-yellow-500/50 bg-yellow-500/5"
                          : "border-yellow-500/30 bg-yellow-500/5 opacity-70",
                      )}>
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                        <p className="text-base leading-relaxed flex-1">{tp.note}</p>
                        {tp.status === "pending" && (
                          <button
                            onClick={() => removeTalkingPoint(tp.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Arrow connector (addressed only) */}
                      {tp.status === "addressed" && (
                        <div className="hidden sm:flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      {/* Response card (addressed only, green) */}
                      {tp.status === "addressed" && tp.response && (
                        <div className="rounded-xl border border-green-500/50 bg-green-500/5 p-4 flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                          <p className="text-base text-muted-foreground leading-relaxed">{tp.response}</p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Recent sessions ── */}
        <section>
          <Reveal>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-normal mb-1">Recent sessions</h2>
                <p className="text-base text-muted-foreground">Click a session to view the full recording.</p>
              </div>
              <Link href="/sessions"><CustomButton2>View all</CustomButton2></Link>
            </div>
          </Reveal>

          {/* Session list */}
          <div className="flex flex-col gap-3">
            {mockSessions.slice(0, 3).map((session, i) => (
              <Reveal key={session.id} delay={i * 0.06}>
                <Link href={`/session/${session.id}`} className="block">
                  <div className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between gap-4 ${sessionColors(session.urgency, session.moodScore)}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${sessionDot(session.urgency, session.moodScore)}`} />
                      <div className="min-w-0">
                        <p className="text-base">{session.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {session.date} · {session.time} · {session.duration} · {session.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-base text-muted-foreground">Mood <span className="text-foreground">{session.moodScore}/10</span></p>
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

      </PageMain>
    </div>
  )
}
