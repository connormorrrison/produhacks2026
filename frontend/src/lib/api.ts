const BACKEND_URL = "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Contacts ──

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  caretakerId: string;
  createdAt: string;
}

export interface ContactWithSessions extends Contact {
  sessions: Session[];
}

export function getContacts() {
  return apiFetch<{ success: boolean; data: Contact[] }>("/api/contacts");
}

export function getContact(id: string) {
  return apiFetch<{ success: boolean; data: ContactWithSessions }>(
    `/api/contacts/${id}`
  );
}

export function createContact(data: {
  name: string;
  phone: string;
  relationship?: string;
  caretakerId: string;
}) {
  return apiFetch<{ success: boolean; data: Contact }>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Sessions ──

export interface Session {
  id: string;
  contactId: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  callLink?: string;
  analysis?: Analysis;
}

export function createSession(contactId: string) {
  return apiFetch<{
    success: boolean;
    data: {
      session: Session;
      heygenToken: string;
      callLink: string;
    };
  }>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ contactId }),
  });
}

export function completeSession(id: string) {
  return apiFetch<{ success: boolean }>(`/api/sessions/${id}/complete`, {
    method: "POST",
  });
}

export function analyzeSession(id: string) {
  return apiFetch<{ success: boolean; data: Analysis }>(
    `/api/sessions/${id}/analyze`,
    { method: "POST" }
  );
}

// ── Notifications ──

export function sendInvite(contactId: string, sessionId: string) {
  return apiFetch<{ success: boolean }>("/api/notifications/invite", {
    method: "POST",
    body: JSON.stringify({ contactId, sessionId }),
  });
}

// ── Analysis ──

export interface Analysis {
  summary: string;
  moodScore: number;
  concerns: string[];
  urgencyLevel: "normal" | "elevated" | "emergency";
}

export interface AnalysisEntry {
  sessionId: string;
  contactName?: string;
  createdAt: string;
  summary: string;
  moodScore: number;
  concerns: string[];
  urgencyLevel: "normal" | "elevated" | "emergency";
}

export function getAnalyses(page = 1, limit = 20) {
  return apiFetch<{ success: boolean; data: AnalysisEntry[] }>(
    `/api/analysis?page=${page}&limit=${limit}`
  );
}

export function getAnalysis(sessionId: string) {
  return apiFetch<{ success: boolean; data: Analysis }>(
    `/api/analysis/${sessionId}`
  );
}
