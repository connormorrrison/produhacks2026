import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api } from "../api";
import { contactKeys, sessionKeys, analysisKeys } from "./keys";
import type {
  Analysis,
  Session,
  SessionWithContact,
  CreateSessionResponse,
  JoinSessionResponse,
  ChatResponse,
  LocationResponse,
  SaveLocationInput,
} from "./types";

/** Fetch a single session with its contact and analysis. */
export function useSession(
  id: string,
  options?: Omit<UseQueryOptions<SessionWithContact>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: async () => {
      const res = await api.getSession(id);
      return res.data!;
    },
    enabled: !!id,
    ...options,
  });
}

/** Create a session and auto-send SMS invite. Invalidates parent contact. */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation<CreateSessionResponse, Error, string>({
    mutationFn: async (contactId: string) => {
      const res = await api.createSession(contactId);
      return res.data!;
    },
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

/** Join a pending session via contact ID. Returns LiveKit credentials. */
export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation<JoinSessionResponse, Error, string>({
    mutationFn: async (contactId: string) => {
      const res = await api.joinSession(contactId);
      return res.data!;
    },
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(contactId),
      });
    },
  });
}

/** Send a chat message during an active session. */
export function useChat() {
  return useMutation<
    ChatResponse,
    Error,
    { sessionId: string; text: string }
  >({
    mutationFn: async ({ sessionId, text }) => {
      const res = await api.chat(sessionId, text);
      return res.data!;
    },
  });
}

/** Save geolocation on a session. */
export function useSaveLocation() {
  const queryClient = useQueryClient();

  return useMutation<
    LocationResponse,
    Error,
    { sessionId: string } & SaveLocationInput
  >({
    mutationFn: async ({ sessionId, latitude, longitude }) => {
      const res = await api.saveLocation(sessionId, { latitude, longitude });
      return res.data!;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(variables.sessionId),
      });
    },
  });
}

/** Mark a session as completed and pull the transcript. */
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, string>({
    mutationFn: async (sessionId: string) => {
      const res = await api.completeSession(sessionId);
      return res.data!;
    },
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: contactKeys.detail(data.contactId),
      });
    },
  });
}

/** Trigger Gemini analysis on a completed session. */
export function useAnalyzeSession() {
  const queryClient = useQueryClient();

  return useMutation<Analysis, Error, string>({
    mutationFn: async (sessionId: string) => {
      const res = await api.analyzeSession(sessionId);
      return res.data!;
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.detail(sessionId),
      });
    },
  });
}
