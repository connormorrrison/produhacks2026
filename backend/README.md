# Backend

FastAPI backend scaffold for the senior-care call workflow:

- add a trusted contact for a senior user
- create a joinable call link for the caretaker / grandma flow
- store recording metadata and generate S3 upload URLs
- run recording analysis with Gemini or a local fallback
- create emergency alerts for trusted contacts
- expose a caretaker dashboard with history, recordings, and analyses

## Quick start

1. Create a virtualenv and install dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy the env template and update credentials:

```bash
cp .env.example .env
```

Common vars your team will likely need:

- `DATABASE_URL` for local Postgres right now
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `GEMINI_API_KEY` for analysis
- `HEYGEN_API_KEY` if you wire avatar/call session creation later
- `TWILIO_*` or `FIREBASE_*` for real notifications

Local Postgres setup for now:

```bash
createdb checkin
```

If your local Postgres username/password is different, just update `DATABASE_URL` in `.env`.
When you host Postgres later, the only backend change you should need is replacing `DATABASE_URL` with the hosted connection string.

3. Run the API:

```bash
./run.sh
```

## Suggested frontend flow

- `POST /api/contacts/profiles` to create the senior profile
- `POST /api/contacts` to assign grandma or another trusted contact
- `POST /api/calls` to create a `Session` and generate the call link
- `GET /api/calls/join/{session_id}` when the contact opens the notification link
- `POST /api/recordings` to get a presigned S3 upload URL
- upload the video directly to S3 from the client
- `POST /api/recordings/{recording_id}/complete` when upload finishes
- `POST /api/recordings/{recording_id}/analyze` to save the one-to-one `Analysis` for that `Session`
- `POST /api/emergencies` if the analysis or UI detects a risk event
- `GET /api/dashboard/{senior_id}` to render the caretaker dashboard

## Notes

- Avatar support is intentionally left off for now and the join response returns `avatar_enabled: false`.
- Database tables are auto-created on startup for faster hackathon setup. For production, add Alembic migrations.
- Emergency notifications are scaffolded and should be connected to a real provider next.
