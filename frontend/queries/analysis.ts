import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api } from "../api";
import { analysisKeys } from "./keys";
import type { AnalysisWithSession } from "./types";

/** Fetch a paginated list of all analyses. */
export function useAnalyses(
  page = 1,
  limit = 20,
  options?: Omit<
    UseQueryOptions<{
      readonly analyses: readonly AnalysisWithSession[];
      readonly meta: { readonly total: number; readonly page: number; readonly limit: number };
    }>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: analysisKeys.all(page, limit),
    queryFn: async () => {
      const res = await api.listAnalyses(page, limit);
      return { analyses: res.data!, meta: res.meta };
    },
    ...options,
  });
}

/** Fetch analysis for a specific session. */
export function useAnalysis(
  sessionId: string,
  options?: Omit<UseQueryOptions<AnalysisWithSession>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: analysisKeys.detail(sessionId),
    queryFn: async () => {
      const res = await api.getAnalysis(sessionId);
      return res.data!;
    },
    enabled: !!sessionId,
    ...options,
  });
}
