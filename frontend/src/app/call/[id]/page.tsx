"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar"
import { createSession, completeSession, analyzeSession } from "@/lib/api"

type CallStatus =
  | "connecting"
  | "ready"
  | "listening"
  | "speaking"
  | "your-turn"
  | "ending"
  | "ended"
  | "error"

const STATUS_TEXT: Record<CallStatus, string> = {
  connecting: "Connecting to Sunny...",
  ready: "Connected! Starting conversation...",
  listening: "Sunny is listening...",
  speaking: "Sunny is speaking...",
  "your-turn": "Your turn to speak...",
  ending: "Ending call...",
  ended: "Call ended. Thank you!",
  error: "Something went wrong. Please try again.",
}

export default function CallPage() {
  const params = useParams<{ id: string }>()
  const contactId = params.id

  const videoRef = useRef<HTMLVideoElement>(null)
  const avatarRef = useRef<StreamingAvatar | null>(null)
  const sessionIdRef = useRef<string>("")

  const [status, setStatus] = useState<CallStatus>("connecting")

  const endCall = useCallback(async () => {
    if (status === "ending" || status === "ended") return
    setStatus("ending")

    try {
      if (avatarRef.current) {
        await avatarRef.current.stopAvatar()
        avatarRef.current = null
      }
      if (sessionIdRef.current) {
        await completeSession(sessionIdRef.current)
        await analyzeSession(sessionIdRef.current)
      }
    } catch (e) {
      console.error("Error ending call:", e)
    }

    setStatus("ended")
  }, [status])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const res = await createSession(contactId)
        if (cancelled) return

        const { heygenToken } = res.data
        sessionIdRef.current = res.data.session.id

        const avatar = new StreamingAvatar({ token: heygenToken })
        avatarRef.current = avatar

        avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.detail
            videoRef.current.play()
          }
          setStatus("ready")
        })

        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          if (videoRef.current) {
            videoRef.current.srcObject = null
          }
        })

        avatar.on(StreamingEvents.USER_START, () => setStatus("listening"))
        avatar.on(StreamingEvents.USER_STOP, () => setStatus("speaking"))
        avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setStatus("speaking"))
        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => setStatus("your-turn"))

        await avatar.createStartAvatar({
          quality: AvatarQuality.High,
          avatarName: "default",
          language: "en",
          disableIdleTimeout: true,
        })

        await avatar.startVoiceChat()
      } catch (e) {
        console.error("Failed to start call:", e)
        if (!cancelled) setStatus("error")
      }
    }

    init()

    return () => {
      cancelled = true
      if (avatarRef.current) {
        avatarRef.current.stopAvatar().catch(() => {})
      }
    }
  }, [contactId])

  if (status === "ended") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: "32px" }} className="font-semibold">
            Thank you for chatting!
          </h1>
          <p style={{ fontSize: "24px" }} className="text-white/70">
            Your caretaker will be notified.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-2xl"
        style={{ maxWidth: "600px" }}
      />

      {/* Status */}
      <p
        style={{ fontSize: "28px" }}
        className="mt-6 text-center font-medium text-white/90"
      >
        {STATUS_TEXT[status]}
      </p>

      {/* End Call button */}
      {status !== "error" && (
        <button
          onClick={endCall}
          disabled={status === "ending"}
          className="mt-8 rounded-2xl bg-red-600 px-16 py-5 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          style={{ fontSize: "32px" }}
        >
          End Call
        </button>
      )}

      {status === "error" && (
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-2xl bg-white px-16 py-5 font-semibold text-black transition-colors hover:bg-white/90"
          style={{ fontSize: "28px" }}
        >
          Try Again
        </button>
      )}
    </main>
  )
}
