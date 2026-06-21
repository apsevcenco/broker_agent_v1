import type { InboxMessage } from "../shared/types";

export function suggestMemoryUpdate(message: InboxMessage): string {
  return `Suggested memory update for ${message.senderName}: role ${message.senderRole}, source ${message.source}, recent inquiry classified as ${message.classification || "unclassified"}. Preserve admin notes and require approval before changing relationship memory.`;
}
