/** @fileoverview Test-only observation of the actual protected native Writer client hook, without restoring removed generic Sfx Notify aliases. */
import { vi } from "vitest";
import type { SwClient, SwModify } from "../sw/inc/calbck";
import type { SwModelHint } from "../sw/inc/hints";
/** Native friendship access for test observation only. */
interface WriterNotificationHook {
  /** Actual protected virtual receiver. @param source - Registered owner. @param hint - Original value. @returns Nothing. */
  SwClientNotify(source: SwModify, hint: SwModelHint): void;
}
/** Observes the actual native hook rather than the removed Sfx listener entry. @param client - Original Writer client. @returns Actual method spy. */
export function spyOnWriterClient(client: SwClient) {
  return vi.spyOn(client as unknown as WriterNotificationHook, "SwClientNotify");
}
