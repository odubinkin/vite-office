/** @fileoverview Exposes bounded Writer slot identities generated from pinned SDI/HRC sources. */

import generated from "../uiconfig/swriter/writer-ui.generated.json" with { type: "json" };

/** Resolves URL parameters to their declaring slot and rejects ungenerated commands. @param commandUrl - Canonical command URL. @returns Numeric slot ID. */
export function getWriterSlotId(commandUrl: string): number {
  const baseUrl = commandUrl.startsWith(".uno:")
    ? (commandUrl.split("?", 1)[0] as string)
    : commandUrl;
  const slotId = generated.commands[baseUrl as keyof typeof generated.commands]?.slotId;
  if (slotId === undefined) throw new Error(`Unsupported Writer command URL: ${commandUrl}`);
  return slotId;
}

/** Exposes the generated supported upstream slots for parity tests. */
export const WRITER_UPSTREAM_SLOT_IDS = Object.freeze(
  Object.fromEntries(
    Object.entries(generated.commands)
      .filter(
        /** Keeps only upstream UNO slots. @param entry - Command resource pair. @returns Whether the URL is a UNO command. */ ([
          commandUrl,
        ]) => commandUrl.startsWith(".uno:"),
      )
      .map(
        /** Projects a command resource to its numeric slot. @param entry - Command resource pair. @returns URL and slot pair. */ ([
          commandUrl,
          resource,
        ]) => [commandUrl, resource.slotId],
      ),
  ),
);
