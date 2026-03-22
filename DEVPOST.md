# ChecKin:AI Health Companion for Elderly Care

## Inspiration

Millions of elderly people live alone, and their caretakers:whether family members, neighbors, or healthcare workers:can't always be there to check in. Missed medications, unreported pain, and social isolation often go unnoticed until they become emergencies. We wanted to build something that could be there every day, even when the caretaker can't.

ChecKin was born from a simple idea: what if an AI companion could have a warm, natural conversation with grandma every morning, ask about her health, and let her caretaker know how she's really doing?

## What it does

ChecKin is an AI-powered health check-in platform for elderly care. A caretaker sets up their loved one as a contact, and the system sends them an SMS with a link. When they open it, they're greeted by **Sunny**:a friendly AI avatar that conducts a conversational health check-in, asking about sleep, medications, appetite, pain, and mood.

After the call, the platform automatically:
- **Transcribes** the entire conversation
- **Records** the user's camera feed
- **Analyzes** both the transcript and video for health concerns
- **Detects visible symptoms** like tremors, signs of pain, or labored breathing
- **Sends emergency SMS alerts** to all designated emergency contacts if something urgent is flagged
- **Tracks caretaker follow-ups**:topics the caretaker wants Sunny to bring up, with AI-generated summaries of what was discussed
- **Generates daily insight cards** summarizing health trends across sessions

The caretaker dashboard provides a complete picture: mood scores, urgency levels, session recordings, transcripts, location data, and AI-generated insights:all in one place.

## How we built it

### Frontend
- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS** with a custom dark theme for the call experience
- **Framer Motion** for animations and micro-interactions
- **LiveKit client SDK** for WebRTC video/audio and real-time data channels
- **MediaRecorder API** for client-side camera recording
- **Geolocation API** for session location capture

### Backend
- **Express 5** with TypeScript
- **Prisma ORM** with PostgreSQL (hosted on Railway)
- **Google Gemini 2.5 Flash** for all AI capabilities
- **HeyGen LiveAvatar API** for the AI avatar (video + speech)
- **LiveKit** for WebRTC room management
- **Twilio** for SMS notifications and emergency alerts
- **AWS S3** for transcript and recording storage
- **node-cron** for scheduled daily summary generation

### Architecture
The call flow works like this:
1. Caretaker clicks "New Session":backend creates a LiveAvatar token and sends an SMS
2. User clicks the link:frontend starts the LiveAvatar session and connects to the LiveKit room
3. LiveAvatar transcribes user speech in real-time, emitting events on the LiveKit data channel
4. Frontend forwards transcriptions to the backend, which sends them to Gemini (acting as Sunny) and gets a conversational response
5. Frontend publishes the response as an `avatar.speak_text` command:the avatar speaks it aloud
6. When the call ends, the recording uploads to S3, the transcript is analyzed by Gemini (text + video in parallel), follow-ups are reviewed, and emergency alerts fire if needed

## Challenges we ran into

- **HeyGen API migration**: We started building on the Streaming Avatar SDK, which was deprecated mid-development. We had to pivot to the LiveAvatar API and LiveKit direct integration, rewriting the entire call flow.
- **Browser audio policies**: Browsers block autoplay audio without user interaction. We solved this by adding a "Start Call" screen that requires a tap before connecting.
- **Gemini output reliability**: Gemini sometimes returns smart quotes (`"` `"`) instead of standard quotes in JSON, or truncates UUIDs. We added sanitization for curly quotes and switched from ID-based to index-based follow-up tracking to avoid reference errors.
- **Dual-modal analysis**: Getting Gemini to analyze video for symptoms without just describing appearance required careful prompt engineering. We reframed the video analysis to only detect medically relevant symptoms.

## Accomplishments that we're proud of

- **End-to-end autonomous health check-ins**: From SMS to AI conversation to analysis to emergency alerts:fully automated
- **Real-time conversational AI with a visual avatar**: Not just a chatbot:a warm, animated companion that speaks and listens
- **Dual-modal health analysis**: Combining what the person *said* with what the camera *saw* for more complete health monitoring
- **Caretaker follow-up loop**: Caretakers set talking points, Sunny weaves them into conversation naturally, and the system reports back what was discussed
- **Production-grade call UI**: Full-screen avatar video, draggable picture-in-picture self-view, frosted glass controls, live subtitles:designed for elderly accessibility

## What we learned

- LiveKit's data channel protocol is powerful for controlling AI avatars beyond just video/audio
- Gemini's multimodal capabilities (text + video analysis) open up possibilities for passive health monitoring
- Designing for elderly users means ruthless simplicity:one big button, large text, minimal navigation
- SMS as the entry point removes the biggest barrier: no app download, no login, just tap and talk

## What's next for ChecKin

- **Trend detection**: Track health metrics across weeks and months to identify gradual decline
- **Multi-language support**: Enable Sunny to conduct check-ins in the user's native language
- **Integration with health providers**: Share anonymized reports with doctors and care teams
- **Smart scheduling**: Automatically adjust call frequency based on health trends and urgency
- **Family sharing**: Let multiple family members view the dashboard and receive alerts
- **Wearable integration**: Incorporate data from smartwatches for heart rate, step count, and sleep tracking

## Built With

`nextjs` `react` `typescript` `tailwindcss` `express` `prisma` `postgresql` `google-gemini` `heygen` `livekit` `twilio` `aws-s3` `framer-motion`
