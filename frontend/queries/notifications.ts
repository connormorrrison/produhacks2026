import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "../api";
import type { SendInviteInput } from "./types";

/** Manually send an SMS invite to a contact for a session. */
export function useSendInvite(
  options?: UseMutationOptions<{ sent: boolean }, Error, SendInviteInput>
) {
  return useMutation({
    mutationFn: async ({ contactId, sessionId }: SendInviteInput) => {
      const res = await api.sendInvite(contactId, sessionId);
      return res.data!;
    },
    ...options,
  });
}
