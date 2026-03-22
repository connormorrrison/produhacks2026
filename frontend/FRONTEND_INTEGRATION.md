# Frontend Integration Guide — Elderly Care Companion

## Architecture Overview

```
Caretaker Dashboard                    Backend (Express)             HeyGen
       |                                    |                          |
  1. Create contact ──── POST /api/contacts ─┤                          |
  2. Start session  ──── POST /api/sessions ─┤── creates token ────────►|
       |                     │               |                          |
  3. Send SMS ────── POST /api/notifications ─┤── Twilio SMS ──► Grandma's phone
       |                                     |                          |
  Grandma clicks link ──► Frontend page      |                          |
       |                                     |                          |
  4. Frontend uses token ────────────────────────── createStartAvatar ──►|
  5. Voice chat streams directly ◄──── WebRTC/WebSocket ───────────────►|
  6. Session ends ───── POST /api/sessions/:id/complete ── pulls transcript
  7. Analyze ────────── POST /api/sessions/:id/analyze ── Gemini + S3 + alert
```

**Key insight:** HeyGen's avatar streams directly between the browser and HeyGen's servers via WebRTC. The backend does NOT proxy video/audio — it manages tokens, sessions, and post-call analysis.

---

## Pages to Build

| Page | Purpose |
|---|---|
| `/call/:id` | The page grandma opens from the SMS link. Shows the avatar video, a big "End Call" button, and status indicators. Keep it **simple and large-font** for elderly users. |
| `/dashboard` | Caretaker view — list contacts, see session history, view analysis results, mood scores, and alerts. |

---

## SDK Setup

```bash
npm install @heygen/streaming-avatar
```

---

## Call Page — Core Integration

This is the page grandma lands on when she clicks the SMS link.

```typescript
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar";

const BACKEND_URL = "http://localhost:3000";

let avatar: StreamingAvatar | null = null;
let backendSessionId: string = "";

// ── Step 1: Create a session via the backend ──
async function createSession(contactId: string) {
  const res = await fetch(`${BACKEND_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactId }),
  });
  const { data } = await res.json();

  backendSessionId = data.session.id;    // your DB session ID
  return data.heygenToken;               // one-time HeyGen access token
}

// ── Step 2: Initialize the avatar ──
async function startAvatarCall(token: string) {
  avatar = new StreamingAvatar({ token });

  // Attach the video stream to a <video> element
  avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
    const videoEl = document.getElementById("avatar-video") as HTMLVideoElement;
    videoEl.srcObject = event.detail;
    videoEl.play();
  });

  avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
    console.log("Stream disconnected");
    const videoEl = document.getElementById("avatar-video") as HTMLVideoElement;
    videoEl.srcObject = null;
  });

  // Optional: show status indicators
  avatar.on(StreamingEvents.USER_START, () => {
    // Show "Listening..." indicator
  });
  avatar.on(StreamingEvents.USER_STOP, () => {
    // Show "Processing..." indicator
  });
  avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
    // Show "Sunny is speaking..." indicator
  });
  avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
    // Show "Your turn to speak..." indicator
  });

  // Start the avatar session
  await avatar.createStartAvatar({
    quality: AvatarQuality.High,
    avatarName: "default",        // or a specific avatar ID from HeyGen
    language: "en",
    disableIdleTimeout: true,
  });

  // Start voice chat — grandma just talks, avatar responds
  await avatar.startVoiceChat({
    useSilencePrompt: true,       // avatar prompts if grandma goes quiet
  });
}

// ── Step 3: End the call ──
async function endCall() {
  if (avatar) {
    await avatar.stopAvatar();
    avatar = null;
  }

  // Tell the backend to pull transcript and run analysis
  await fetch(`${BACKEND_URL}/api/sessions/${backendSessionId}/complete`, {
    method: "POST",
  });
  await fetch(`${BACKEND_URL}/api/sessions/${backendSessionId}/analyze`, {
    method: "POST",
  });

  // Show a "Thank you" screen
}

// ── Usage ──
// Extract contactId from URL params or pass it from the SMS link
const contactId = "contact-uuid-from-url";
const token = await createSession(contactId);
await startAvatarCall(token);

// Wire up the "End Call" button
document.getElementById("end-call-btn")?.addEventListener("click", endCall);
```

---

## Call Page — Minimal HTML Structure

```html
<div id="call-page" style="text-align: center;">
  <!-- Avatar video feed -->
  <video
    id="avatar-video"
    autoplay
    playsinline
    style="width: 100%; max-width: 600px; border-radius: 16px;"
  ></video>

  <!-- Status indicator -->
  <p id="status" style="font-size: 24px; margin: 16px 0;">
    Connecting to Sunny...
  </p>

  <!-- End call button — make it BIG for elderly users -->
  <button
    id="end-call-btn"
    style="
      font-size: 32px;
      padding: 20px 60px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
    "
  >
    End Call
  </button>
</div>
```

---

## Dashboard Page — API Endpoints

### List all contacts
```
GET /api/contacts

Response: {
  success: true,
  data: [
    { id, name, phone, relationship, caretakerId, createdAt }
  ]
}
```

### Get contact with full session history
```
GET /api/contacts/:id

Response: {
  success: true,
  data: {
    id, name, phone, relationship,
    sessions: [
      {
        id, status, startedAt, endedAt,
        analysis: { summary, moodScore, concerns, urgencyLevel }
      }
    ]
  }
}
```

### Create a new contact
```
POST /api/contacts
Body: { name: string, phone: string, relationship?: string, caretakerId: string }
```

### Create a session and get HeyGen token
```
POST /api/sessions
Body: { contactId: string }

Response: {
  success: true,
  data: {
    session: { id, contactId, status, callLink },
    heygenToken: "one-time-access-token",
    callLink: "http://localhost:3000/call/uuid"
  }
}
```

### Send SMS invite to contact
```
POST /api/notifications/invite
Body: { contactId: string, sessionId: string }
```

### Complete a session (pulls transcript from HeyGen)
```
POST /api/sessions/:id/complete
```

### Trigger AI analysis (Gemini)
```
POST /api/sessions/:id/analyze

Response: {
  success: true,
  data: {
    summary: "Patient reported good sleep but skipped breakfast...",
    moodScore: 7,
    concerns: ["skipped meal", "mild knee pain"],
    urgencyLevel: "normal" | "elevated" | "emergency"
  }
}
```

### List all analyses (paginated)
```
GET /api/analysis?page=1&limit=20
```

### Get analysis for a specific session
```
GET /api/analysis/:sessionId
```

---

## Typical Caretaker Workflow

1. **Create a contact:** `POST /api/contacts` with grandma's name and phone
2. **Start a session:** `POST /api/sessions` with the contact ID → get back `heygenToken` and `callLink`
3. **Send SMS:** `POST /api/notifications/invite` → grandma receives SMS with the call link
4. Grandma clicks the link → opens `/call/:id` → avatar session starts automatically
5. After the call, frontend calls `POST /api/sessions/:id/complete` then `POST /api/sessions/:id/analyze`
6. Caretaker views results on `/dashboard` via `GET /api/contacts/:id` and `GET /api/analysis`
7. If urgency is `"emergency"`, the backend **auto-sends an SMS alert** to the caretaker

---

## UX Considerations for Elderly Users

- **Large fonts** (minimum 24px body text)
- **High contrast** colors
- **Minimal UI** on the call page — just the video and one big button
- **Auto-start** the voice chat so grandma doesn't need to tap anything extra
- **Status indicators** ("Sunny is listening...", "Your turn to speak...") in large text
- **No complex navigation** — the SMS link should go directly to the call

---

## SDK Reference

- npm: `@heygen/streaming-avatar`
- Docs: https://docs.heygen.com/docs/streaming-avatar-sdk
- SDK Reference: https://docs.heygen.com/docs/streaming-avatar-sdk-reference
- GitHub: https://github.com/HeyGen-Official/StreamingAvatarSDK

> **Note:** HeyGen Interactive Avatar is sunsetting March 31, 2026 in favor of LiveAvatar (liveavatar.com). For the hackathon, the current SDK works fine.
